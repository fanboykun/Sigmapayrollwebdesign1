import { useState, useMemo, useCallback, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DatePicker } from "./ui/date-picker";
import {
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  UserPlus,
  Eye,
  Users,
  UserMinus,
  UserCheck,
  User,
  Briefcase,
  CreditCard,
  Shield,
  Package,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Users2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Recruitment } from "./Recruitment";
import { Termination } from "./Termination";
import { Probasi } from "./Probasi";
import { supabase } from "../utils/supabase/client";
import { toast } from "sonner";
import { usePositions } from "../hooks/usePositions";
import { useDivisions } from "../hooks/useDivisions";

interface Asset {
  id?: string;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  assigned_date: Date | undefined;
  return_date: Date | undefined;
  description?: string;
  status?: 'assigned' | 'returned' | 'damaged' | 'lost';
  notes?: string;
}

// Family data structure matching database JSONB format
interface FamilyMember {
  nik?: string;
  fullName: string;
  birthDate?: string;
  gender?: "male" | "female";
  bloodType?: string;
  bpjsHealthNumber?: string;
  phone?: string;
}

interface FamilyData {
  spouse?: FamilyMember;
  children?: FamilyMember[];
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: "male" | "female";
  religion: string;
  address: string;
  division: string;
  position: string;
  gradeLevel: "pegawai" | "karyawan" | "pkwt";
  joinDate: Date;
  status: "active" | "inactive" | "on-leave";
  bankName: string;
  bankAccount: string;
  emergencyContact: string;
  emergencyPhone: string;
  // Additional fields
  nationalId?: string; // KTP/National ID
  height?: number; // Height in cm
  weight?: number; // Weight in kg
  drivingLicenseNumber?: string; // SIM Number
  drivingLicenseExpiry?: Date; // SIM expiry date
  nationality?: string; // Nationality
  bloodGroup?: string; // Blood type (A+, B+, O+, AB+, etc)
  maritalStatus?: "single" | "married" | "divorced" | "widowed";
  // BPJS & Tax fields
  bpjsHealthNumber?: string;
  npwp?: string;
  ptkpStatus?: string; // TK, K/0, K/1, K/2, K/3
  // Family data (JSONB in database)
  familyData?: FamilyData;
  // For backward compatibility with form
  spouseName?: string;
  child1Name?: string;
  child2Name?: string;
  child3Name?: string;
  assets?: Asset[];
  // Workflow status - links to Probasi, Rekrutmen, Terminasi tabs
  workflowStatus?: "none" | "recruitment" | "probation" | "termination";
  // Termination reason - only applicable when status is inactive
  terminationReason?: "resignation" | "retirement" | "contract_end" | "layoff";
}

export function EmployeeManagement() {
  const [mainTab, setMainTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [joinDate, setJoinDate] = useState<Date | undefined>();
  const [drivingLicenseExpiry, setDrivingLicenseExpiry] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState("personal");

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    religion: "",
    address: "",
    division: "",
    position: "",
    gradeLevel: "pegawai",
    bankName: "",
    bankAccount: "",
    emergencyContact: "",
    emergencyPhone: "",
    // Additional fields
    nationalId: "",
    height: "",
    weight: "",
    drivingLicenseNumber: "",
    nationality: "Indonesian",
    bloodGroup: "",
    maritalStatus: "single",
    // BPJS & Tax fields
    bpjsHealthNumber: "",
    npwp: "",
    ptkpStatus: "",
    // Family fields (for form UI)
    spouseName: "",
    child1Name: "",
    child2Name: "",
    child3Name: "",
    // Workflow status
    workflowStatus: "none",
  });

  // Asset state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAsset, setCurrentAsset] = useState({
    asset_code: "",
    asset_name: "",
    asset_type: "",
    description: "",
    status: "assigned" as const,
  });
  const [assignedDate, setAssignedDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pegawaiCount: 0,
    karyawanCount: 0,
  });

  // Load positions and divisions from database
  const { positions } = usePositions();
  const { divisions } = useDivisions();

  // Load statistics for cards - this gets total counts across all data
  const loadStatistics = async () => {
    try {
      // Get total employees count
      const { count: totalCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });

      // Get active employees count
      const { count: activeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get pegawai (permanent) count
      const { count: pegawaiCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("employment_type", "permanent");

      // Get karyawan (non-permanent, non-contract) count
      // In the gradeLevel mapping: permanent = pegawai, contract = pkwt, internship = karyawan
      const { count: karyawanCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("employment_type", "internship");

      setStatistics({
        totalEmployees: totalCount || 0,
        activeEmployees: activeCount || 0,
        pegawaiCount: pegawaiCount || 0,
        karyawanCount: karyawanCount || 0,
      });
    } catch (err: any) {
      console.error("Error loading statistics:", err);
    }
  };

  // Load employees from Supabase with filters
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Calculate range for pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Build query with filters - use count to get total
      let query = supabase.from("employees").select("*", { count: "exact" });

      // Apply division filter
      if (departmentFilter !== "all") {
        query = query.eq("division_id", departmentFilter);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply search filter (search across multiple fields)
      if (searchQuery.trim()) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,employee_id.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      // Order results
      query = query.order("employee_id", { ascending: true });

      // Apply pagination range
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform Supabase data to match the Employee interface
      const transformedData: Employee[] = (data || []).map((emp: any) => {
        // Extract family data from JSONB
        const familyData = emp.family_data || {};
        const spouse = familyData.spouse;
        const children = familyData.children || [];

        return {
          id: emp.id,
          employeeId: emp.employee_id,
          fullName: emp.full_name,
          email: emp.email,
          phone: emp.phone,
          birthDate: new Date(emp.birth_date),
          gender: emp.gender as "male" | "female",
          religion: emp.religion || "",
          address: emp.address,
          division: emp.division_id,
          position: emp.position_id,
          gradeLevel:
            emp.employment_type === "permanent"
              ? "pegawai"
              : emp.employment_type === "contract"
              ? "pkwt"
              : "karyawan",
          joinDate: new Date(emp.join_date),
          status: emp.status as "active" | "inactive" | "on-leave",
          bankName: emp.bank_name,
          bankAccount: emp.bank_account,
          emergencyContact: emp.emergency_contact_name || "",
          emergencyPhone: emp.emergency_contact_phone || "",
          nationalId: emp.national_id,
          height: emp.height,
          weight: emp.weight,
          drivingLicenseNumber: emp.driving_license_number,
          drivingLicenseExpiry: emp.driving_license_expiry
            ? new Date(emp.driving_license_expiry)
            : undefined,
          nationality: emp.nationality,
          bloodGroup: emp.blood_type,
          maritalStatus: emp.marital_status,
          bpjsHealthNumber: emp.bpjs_health_number,
          npwp: emp.npwp,
          ptkpStatus: emp.tax_ptkp_status || emp.ptkp_status,
          familyData: familyData,
          // For backward compatibility with form
          spouseName: spouse?.fullName || "",
          child1Name: children[0]?.fullName || "",
          child2Name: children[1]?.fullName || "",
          child3Name: children[2]?.fullName || "",
          assets: [],
          workflowStatus: (emp.workflow_status || "none") as "none" | "recruitment" | "probation" | "termination",
          terminationReason: emp.termination_reason as "resignation" | "retirement" | "contract_end" | "layoff" | undefined,
        };
      });

      setEmployees(transformedData);
      setTotalCount(count || 0);
    } catch (err: any) {
      setFetchError(err.message);
      console.error("Error fetching employees:", err);
      toast.error("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics on component mount
  useEffect(() => {
    loadStatistics();
  }, []);

  // Fetch employees on component mount and when filters change
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployees();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery, departmentFilter, statusFilter, currentPage]);

  // Reload employees when switching to employees tab
  useEffect(() => {
    if (mainTab === 'employees') {
      loadEmployees();
      loadStatistics();
    }
  }, [mainTab]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter]);

  // No need for client-side filtering anymore - filtering is done in loadEmployees
  const filteredEmployees = employees;

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "male",
      religion: "",
      address: "",
      division: "",
      position: "",
      gradeLevel: "pegawai",
      bankName: "",
      bankAccount: "",
      emergencyContact: "",
      emergencyPhone: "",
      nationalId: "",
      height: "",
      weight: "",
      drivingLicenseNumber: "",
      nationality: "Indonesian",
      bloodGroup: "",
      maritalStatus: "single",
      bpjsHealthNumber: "",
      npwp: "",
      ptkpStatus: "",
      spouseName: "",
      child1Name: "",
      child2Name: "",
      child3Name: "",
      workflowStatus: "none",
    });
    setBirthDate(undefined);
    setJoinDate(undefined);
    setDrivingLicenseExpiry(undefined);
    setAssets([]);
    setCurrentAsset({
      asset_code: "",
      asset_name: "",
      asset_type: "",
      description: "",
      status: "assigned",
    });
    setAssignedDate(undefined);
    setReturnDate(undefined);
    setActiveTab("personal");
  };

  // Load assets for employee
  const loadEmployeeAssets = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from("employee_assets")
        .select("*")
        .eq("employee_id", employeeId);

      if (error) throw error;

      const transformedAssets: Asset[] = (data || []).map((asset: any) => ({
        id: asset.id,
        asset_code: asset.asset_code,
        asset_name: asset.asset_name,
        asset_type: asset.asset_type,
        assigned_date: asset.assigned_date ? new Date(asset.assigned_date) : undefined,
        return_date: asset.return_date ? new Date(asset.return_date) : undefined,
        description: asset.description,
        status: asset.status,
        notes: asset.notes,
      }));

      setAssets(transformedAssets);
    } catch (err: any) {
      console.error("Error loading employee assets:", err);
    }
  };

  // Save assets to database
  const saveEmployeeAssets = async (employeeId: string) => {
    try {
      // Delete existing assets for this employee
      await supabase
        .from("employee_assets")
        .delete()
        .eq("employee_id", employeeId);

      // Insert new assets
      if (assets.length > 0) {
        const assetsToInsert = assets.map((asset) => ({
          employee_id: employeeId,
          asset_code: asset.asset_code,
          asset_name: asset.asset_name,
          asset_type: asset.asset_type,
          assigned_date: asset.assigned_date?.toISOString().split("T")[0],
          return_date: asset.return_date?.toISOString().split("T")[0],
          description: asset.description,
          status: asset.status || "assigned",
          notes: asset.notes,
        }));

        const { error } = await supabase
          .from("employee_assets")
          .insert(assetsToInsert);

        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Error saving employee assets:", err);
      throw err;
    }
  };

  const handleAddEmployee = async () => {
    try {
      // Validation
      if (!formData.employeeId || !formData.fullName || !formData.email) {
        toast.error("Mohon lengkapi field yang wajib diisi (NIK, Nama, Email)");
        return;
      }

      if (!birthDate || !joinDate) {
        toast.error("Tanggal lahir dan tanggal bergabung harus diisi");
        return;
      }

      if (!formData.division || !formData.position) {
        toast.error("Divisi dan Jabatan harus diisi");
        return;
      }

      // Prepare family data in JSONB format
      const familyData: FamilyData = {};

      if (formData.spouseName) {
        familyData.spouse = {
          fullName: formData.spouseName,
        };
      }

      const children: FamilyMember[] = [];
      if (formData.child1Name) children.push({ fullName: formData.child1Name });
      if (formData.child2Name) children.push({ fullName: formData.child2Name });
      if (formData.child3Name) children.push({ fullName: formData.child3Name });

      if (children.length > 0) {
        familyData.children = children;
      }

      // Verify division and position exist in database
      const divisionExists = divisions.find(d => d.id === formData.division);
      const positionExists = positions.find(p => p.id === formData.position);

      if (!divisionExists) {
        toast.error("Divisi yang dipilih tidak valid. Silakan pilih divisi yang tersedia.");
        return;
      }

      if (!positionExists) {
        toast.error("Jabatan yang dipilih tidak valid. Silakan pilih jabatan yang tersedia.");
        return;
      }

      // Prepare data for Supabase (transform from component format to database format)
      const insertData: any = {
        employee_id: formData.employeeId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        birth_date: birthDate.toISOString().split("T")[0],
        gender: formData.gender,
        religion: formData.religion,
        address: formData.address,
        division_id: formData.division,
        position_id: formData.position,
        employment_type:
          formData.gradeLevel === "pegawai"
            ? "permanent"
            : formData.gradeLevel === "pkwt"
            ? "contract"
            : "internship",
        join_date: joinDate.toISOString().split("T")[0],
        status: "active",
        bank_name: formData.bankName,
        bank_account: formData.bankAccount,
        emergency_contact_name: formData.emergencyContact,
        emergency_contact_phone: formData.emergencyPhone,
        national_id: formData.nationalId,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        driving_license_number: formData.drivingLicenseNumber,
        driving_license_expiry: drivingLicenseExpiry
          ? drivingLicenseExpiry.toISOString().split("T")[0]
          : null,
        nationality: formData.nationality,
        blood_type: formData.bloodGroup,
        marital_status: formData.maritalStatus,
        bpjs_health_number: formData.bpjsHealthNumber,
        npwp: formData.npwp,
        tax_ptkp_status: formData.ptkpStatus,
        family_data: Object.keys(familyData).length > 0 ? familyData : null,
        base_salary: 0, // Required field, set default
        workflow_status: formData.workflowStatus,
      };

      const { data, error } = await supabase
        .from("employees")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Save assets to database
      if (data && assets.length > 0) {
        await saveEmployeeAssets(data.id);
      }

      toast.success("Karyawan berhasil ditambahkan");
      setIsAddDialogOpen(false);
      resetForm();
      loadEmployees(); // Refresh the employee list
      loadStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error("Error adding employee:", error);
      if (error.code === "23505") {
        toast.error("NIK atau email sudah digunakan");
      } else {
        toast.error("Gagal menambahkan karyawan: " + error.message);
      }
    }
  };

  const handleEditEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender,
      religion: employee.religion,
      address: employee.address,
      division: employee.division,
      position: employee.position,
      gradeLevel: employee.gradeLevel,
      bankName: employee.bankName,
      bankAccount: employee.bankAccount,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      nationalId: employee.nationalId || "",
      height: employee.height?.toString() || "",
      weight: employee.weight?.toString() || "",
      drivingLicenseNumber: employee.drivingLicenseNumber || "",
      nationality: employee.nationality || "Indonesian",
      bloodGroup: employee.bloodGroup || "",
      maritalStatus: employee.maritalStatus || "single",
      bpjsHealthNumber: employee.bpjsHealthNumber || "",
      npwp: employee.npwp || "",
      ptkpStatus: employee.ptkpStatus || "",
      spouseName: employee.spouseName || "",
      child1Name: employee.child1Name || "",
      child2Name: employee.child2Name || "",
      child3Name: employee.child3Name || "",
      workflowStatus: employee.workflowStatus || "none",
    });
    setBirthDate(employee.birthDate);
    setJoinDate(employee.joinDate);
    setDrivingLicenseExpiry(employee.drivingLicenseExpiry);

    // Load assets from database
    await loadEmployeeAssets(employee.id);

    setActiveTab("personal");
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      // Validation
      if (!formData.division || !formData.position) {
        toast.error("Divisi dan Jabatan harus diisi");
        return;
      }

      // Verify division and position exist in database
      const divisionExists = divisions.find(d => d.id === formData.division);
      const positionExists = positions.find(p => p.id === formData.position);

      if (!divisionExists) {
        toast.error("Divisi yang dipilih tidak valid. Silakan pilih divisi yang tersedia.");
        return;
      }

      if (!positionExists) {
        toast.error("Jabatan yang dipilih tidak valid. Silakan pilih jabatan yang tersedia.");
        return;
      }

      // Prepare family data in JSONB format
      const familyData: FamilyData = {};

      if (formData.spouseName) {
        familyData.spouse = {
          fullName: formData.spouseName,
        };
      }

      const children: FamilyMember[] = [];
      if (formData.child1Name) children.push({ fullName: formData.child1Name });
      if (formData.child2Name) children.push({ fullName: formData.child2Name });
      if (formData.child3Name) children.push({ fullName: formData.child3Name });

      if (children.length > 0) {
        familyData.children = children;
      }

      // Prepare data for Supabase (transform from component format to database format)
      const updateData: any = {
        employee_id: formData.employeeId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        birth_date: birthDate?.toISOString().split("T")[0],
        gender: formData.gender,
        religion: formData.religion,
        address: formData.address,
        division_id: formData.division,
        position_id: formData.position,
        employment_type:
          formData.gradeLevel === "pegawai"
            ? "permanent"
            : formData.gradeLevel === "pkwt"
            ? "contract"
            : "internship",
        join_date: joinDate?.toISOString().split("T")[0],
        bank_name: formData.bankName,
        bank_account: formData.bankAccount,
        emergency_contact_name: formData.emergencyContact,
        emergency_contact_phone: formData.emergencyPhone,
        national_id: formData.nationalId,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        driving_license_number: formData.drivingLicenseNumber,
        driving_license_expiry: drivingLicenseExpiry
          ? drivingLicenseExpiry.toISOString().split("T")[0]
          : null,
        nationality: formData.nationality,
        blood_type: formData.bloodGroup,
        marital_status: formData.maritalStatus,
        bpjs_health_number: formData.bpjsHealthNumber,
        npwp: formData.npwp,
        tax_ptkp_status: formData.ptkpStatus,
        family_data: Object.keys(familyData).length > 0 ? familyData : null,
        workflow_status: formData.workflowStatus,
      };

      const { error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      // Save assets to database
      await saveEmployeeAssets(selectedEmployee.id);

      toast.success("Data karyawan berhasil diupdate");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedEmployee(null);
      loadEmployees(); // Refresh the employee list
      loadStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error("Gagal mengupdate data karyawan: " + error.message);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
      return;
    }

    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;

      toast.success("Karyawan berhasil dihapus");
      loadEmployees(); // Refresh the employee list
      loadStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      if (error.code === "23503") {
        toast.error(
          "Karyawan tidak dapat dihapus karena masih terkait dengan data lain"
        );
      } else {
        toast.error("Gagal menghapus karyawan");
      }
    }
  };

  const handleAssetInputChange = (field: string, value: string) => {
    setCurrentAsset({ ...currentAsset, [field]: value });
  };

  const handleAddAsset = () => {
    if (!currentAsset.asset_code || !currentAsset.asset_name || !currentAsset.asset_type) {
      toast.error("Kode Aset, Nama Aset, dan Tipe Aset harus diisi!");
      return;
    }

    if (!assignedDate) {
      toast.error("Tanggal penugasan harus diisi!");
      return;
    }

    const newAsset: Asset = {
      asset_code: currentAsset.asset_code,
      asset_name: currentAsset.asset_name,
      asset_type: currentAsset.asset_type,
      assigned_date: assignedDate,
      return_date: returnDate,
      description: currentAsset.description,
      status: currentAsset.status,
    };

    setAssets([...assets, newAsset]);
    setCurrentAsset({
      asset_code: "",
      asset_name: "",
      asset_type: "",
      description: "",
      status: "assigned",
    });
    setAssignedDate(undefined);
    setReturnDate(undefined);
  };

  const handleDeleteAsset = (assetCode: string) => {
    setAssets(assets.filter((asset) => asset.asset_code !== assetCode));
  };

  // Helper function to get division name (estate) from ID
  const getDivisionName = (divisionId: string) => {
    const division = divisions.find(div => div.id === divisionId);
    return division ? division.nama_divisi : divisionId;
  };

  // Helper function to get division code from ID
  const getDivisionCode = (divisionId: string) => {
    const division = divisions.find(div => div.id === divisionId);
    return division ? division.kode_divisi : divisionId;
  };

  // Helper function to get position name from ID
  const getPositionName = (positionId: string) => {
    const position = positions.find(pos => pos.id === positionId);
    return position ? position.name : positionId;
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Aktif", className: "bg-[#00d27a]/10 text-[#00d27a]" },
      inactive: {
        label: "Tidak Aktif",
        className: "bg-muted text-muted-foreground",
      },
      "on-leave": {
        label: "Cuti",
        className: "bg-[#f5803e]/10 text-[#f5803e]",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge
        variant="secondary"
        className={`${config.className} hover:${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const getGradeLevelBadge = (grade: string) => {
    const gradeConfig = {
      pegawai: {
        label: "Pegawai",
        className: "bg-[#2c7be5]/10 text-[#2c7be5]",
      },
      karyawan: {
        label: "Karyawan",
        className: "bg-[#00d27a]/10 text-[#00d27a]",
      },
      pkwt: { label: "PKWT", className: "bg-[#f5803e]/10 text-[#f5803e]" },
    };

    const config =
      gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.pegawai;
    return (
      <Badge
        variant="secondary"
        className={`${config.className} hover:${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const employeeFormFields = useMemo(
    () => (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto bg-muted/50 p-1 gap-1 w-full">
          <TabsTrigger 
            value="personal" 
            className="flex items-center justify-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-2 flex-1 min-w-0"
          >
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">Pribadi</span>
          </TabsTrigger>
          <TabsTrigger 
            value="employment"
            className="flex items-center justify-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-2 flex-1 min-w-0"
          >
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">Pekerjaan</span>
          </TabsTrigger>
          <TabsTrigger 
            value="financial"
            className="flex items-center justify-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-2 flex-1 min-w-0"
          >
            <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">Keuangan</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bpjs"
            className="flex items-center justify-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-2 flex-1 min-w-0"
          >
            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">BPJS</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assets"
            className="flex items-center justify-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-2 flex-1 min-w-0"
          >
            <Package className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">Aset</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6 mt-6">
          {/* Informasi Identitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Informasi Identitas</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Nomor Karyawan *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) =>
                    handleInputChange("employeeId", e.target.value)
                  }
                  placeholder="1504951"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Imran I"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID / KTP *</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) =>
                    handleInputChange("nationalId", e.target.value)
                  }
                  placeholder="02.1504.101085.0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Kewarganegaraan</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) =>
                    handleInputChange("nationality", value)
                  }
                >
                  <SelectTrigger id="nationality">
                    <SelectValue placeholder="Pilih kewarganegaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indonesian">Indonesian</SelectItem>
                    <SelectItem value="Malaysian">Malaysian</SelectItem>
                    <SelectItem value="Singaporean">Singaporean</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Kontak */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Informasi Kontak</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="imran@sigma.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="081234567890"
                />
              </div>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Data Pribadi</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Lahir *</Label>
                <DatePicker
                  date={birthDate}
                  onDateChange={setBirthDate}
                  placeholder="Pilih tanggal lahir"
                  fromYear={1940}
                  toYear={new Date().getFullYear() - 17}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Tinggi Badan (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="165"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="55"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Golongan Darah</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) =>
                    handleInputChange("bloodGroup", value)
                  }
                >
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Pilih golongan darah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Agama *</Label>
                <Select
                  value={formData.religion}
                  onValueChange={(value) => handleInputChange("religion", value)}
                >
                  <SelectTrigger id="religion">
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="islam">Islam</SelectItem>
                    <SelectItem value="kristen">Kristen</SelectItem>
                    <SelectItem value="katolik">Katolik</SelectItem>
                    <SelectItem value="hindu">Hindu</SelectItem>
                    <SelectItem value="buddha">Buddha</SelectItem>
                    <SelectItem value="konghucu">Konghucu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drivingLicenseNumber">Nomor SIM</Label>
                <Input
                  id="drivingLicenseNumber"
                  value={formData.drivingLicenseNumber}
                  onChange={(e) =>
                    handleInputChange("drivingLicenseNumber", e.target.value)
                  }
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Berlaku SIM</Label>
                <DatePicker
                  date={drivingLicenseExpiry}
                  onDateChange={setDrivingLicenseExpiry}
                  placeholder="Pilih tanggal berlaku"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 20}
                />
              </div>
            </div>
          </div>

          {/* Alamat & Kontak Darurat */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Alamat & Kontak Darurat</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Jl. Sudirman No. 123, Jakarta"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Kontak Darurat</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  placeholder="Nama kontak darurat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Nomor Kontak Darurat</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyPhone", e.target.value)
                  }
                  placeholder="081234567890"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6 mt-6">
          {/* Informasi Pekerjaan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Informasi Pekerjaan</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">Divisi (Estate) *</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) => handleInputChange("division", value)}
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="Pilih divisi (estate)" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Tidak ada data divisi
                      </div>
                    ) : (
                      divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.nama_divisi}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan (Nama Jabatan) *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => handleInputChange("position", value)}
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Tidak ada data jabatan
                      </div>
                    ) : (
                      positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Golongan *</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) =>
                    handleInputChange("gradeLevel", value)
                  }
                >
                  <SelectTrigger id="gradeLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pegawai">Pegawai</SelectItem>
                    <SelectItem value="karyawan">Karyawan</SelectItem>
                    <SelectItem value="pkwt">PKWT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Bergabung *</Label>
                <DatePicker
                  date={joinDate}
                  onDateChange={setJoinDate}
                  placeholder="Pilih tanggal bergabung"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflowStatus">Status Workflow</Label>
                <Select
                  value={formData.workflowStatus}
                  onValueChange={(value) =>
                    handleInputChange("workflowStatus", value)
                  }
                >
                  <SelectTrigger id="workflowStatus">
                    <SelectValue placeholder="Pilih status workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    <SelectItem value="recruitment">Rekrutmen</SelectItem>
                    <SelectItem value="probation">Probasi</SelectItem>
                    <SelectItem value="termination">Terminasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status Aktual Saat Ini</Label>
                <div className="flex items-center h-10 px-3 py-2 rounded-md border border-input bg-muted/30">
                  {selectedEmployee && selectedEmployee.terminationReason ? (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                      {selectedEmployee.terminationReason === "resignation"
                        ? "Pengunduran Diri"
                        : selectedEmployee.terminationReason === "retirement"
                        ? "Pensiun"
                        : selectedEmployee.terminationReason === "contract_end"
                        ? "Akhir Masa Kontrak"
                        : "Afkir"}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className={
                        formData.workflowStatus === "recruitment"
                          ? "bg-blue-500/10 text-blue-500"
                          : formData.workflowStatus === "probation"
                          ? "bg-orange-500/10 text-orange-500"
                          : formData.workflowStatus === "termination"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-gray-500/10 text-gray-500"
                      }
                    >
                      {formData.workflowStatus === "recruitment"
                        ? "Sedang Rekrutmen"
                        : formData.workflowStatus === "probation"
                        ? "Sedang Probasi"
                        : formData.workflowStatus === "termination"
                        ? "Dalam Proses Terminasi"
                        : "Normal - Tidak Ada Status Khusus"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Workflow */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Integrasi dengan Tab Workflow
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Status workflow ini akan menentukan tampilan karyawan di tab Probasi, Rekrutmen, dan Terminasi.
                  Ketika status diubah dari tab tersebut, data karyawan ini akan otomatis terupdate.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* Informasi Bank */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Informasi Rekening Bank</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(value) => handleInputChange("bankName", value)}
                >
                  <SelectTrigger id="bankName">
                    <SelectValue placeholder="Pilih bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                    <SelectItem value="Permata">Permata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Nomor Rekening *</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) =>
                    handleInputChange("bankAccount", e.target.value)
                  }
                  placeholder="1234567890"
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pastikan nomor rekening sudah benar untuk proses transfer gaji
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bpjs" className="space-y-6 mt-6">
          {/* Nomor BPJS & NPWP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Nomor BPJS & NPWP</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bpjsHealthNumber">Nomor BPJS Kesehatan</Label>
                <Input
                  id="bpjsHealthNumber"
                  value={formData.bpjsHealthNumber}
                  onChange={(e) =>
                    handleInputChange("bpjsHealthNumber", e.target.value)
                  }
                  placeholder="0001234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  id="npwp"
                  value={formData.npwp}
                  onChange={(e) =>
                    handleInputChange("npwp", e.target.value)
                  }
                  placeholder="12.345.678.9-012.000"
                />
              </div>
            </div>
          </div>

          {/* Status Pajak PTKP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Status Pajak (PTKP)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Status Pernikahan</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) =>
                    handleInputChange("maritalStatus", value)
                  }
                >
                  <SelectTrigger id="maritalStatus">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Belum Menikah</SelectItem>
                    <SelectItem value="married">Menikah</SelectItem>
                    <SelectItem value="divorced">Cerai</SelectItem>
                    <SelectItem value="widowed">Janda/Duda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptkpStatus">
                  Status PTKP (Penghasilan Tidak Kena Pajak)
                </Label>
                <Select
                  value={formData.ptkpStatus}
                  onValueChange={(value) =>
                    handleInputChange("ptkpStatus", value)
                  }
                >
                  <SelectTrigger id="ptkpStatus">
                    <SelectValue placeholder="Pilih status PTKP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TK/0">TK/0 - Tidak Kawin tanpa tanggungan</SelectItem>
                    <SelectItem value="TK/1">TK/1 - Tidak Kawin 1 tanggungan</SelectItem>
                    <SelectItem value="TK/2">TK/2 - Tidak Kawin 2 tanggungan</SelectItem>
                    <SelectItem value="TK/3">TK/3 - Tidak Kawin 3 tanggungan</SelectItem>
                    <SelectItem value="K/0">K/0 - Kawin tanpa tanggungan</SelectItem>
                    <SelectItem value="K/1">K/1 - Kawin 1 tanggungan</SelectItem>
                    <SelectItem value="K/2">K/2 - Kawin 2 tanggungan</SelectItem>
                    <SelectItem value="K/3">K/3 - Kawin 3 tanggungan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Data Keluarga */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Data Keluarga</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="spouseName">Nama Istri/Suami</Label>
              <Input
                id="spouseName"
                value={formData.spouseName}
                onChange={(e) => handleInputChange("spouseName", e.target.value)}
                placeholder="Nama istri/suami"
              />
            </div>

            <div className="space-y-4">
              <Label>Data Anak (Maksimal 3 anak)</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="child1Name" className="text-sm text-muted-foreground">
                    Anak 1
                  </Label>
                  <Input
                    id="child1Name"
                    value={formData.child1Name}
                    onChange={(e) =>
                      handleInputChange("child1Name", e.target.value)
                    }
                    placeholder="Nama anak pertama"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child2Name" className="text-sm text-muted-foreground">
                    Anak 2
                  </Label>
                  <Input
                    id="child2Name"
                    value={formData.child2Name}
                    onChange={(e) =>
                      handleInputChange("child2Name", e.target.value)
                    }
                    placeholder="Nama anak kedua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child3Name" className="text-sm text-muted-foreground">
                    Anak 3
                  </Label>
                  <Input
                    id="child3Name"
                    value={formData.child3Name}
                    onChange={(e) =>
                      handleInputChange("child3Name", e.target.value)
                    }
                    placeholder="Nama anak ketiga"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6 mt-6">
          {/* Form Tambah Aset */}
          <div className="border rounded-lg p-6 space-y-4 bg-muted/20">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm">Tambah Aset Baru</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset_code">Kode Aset *</Label>
                <Input
                  id="asset_code"
                  value={currentAsset.asset_code}
                  onChange={(e) =>
                    handleAssetInputChange("asset_code", e.target.value)
                  }
                  placeholder="AST-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_name">Nama Aset *</Label>
                <Input
                  id="asset_name"
                  value={currentAsset.asset_name}
                  onChange={(e) =>
                    handleAssetInputChange("asset_name", e.target.value)
                  }
                  placeholder="Laptop Dell XPS 15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset_type">Tipe Aset *</Label>
                <Select
                  value={currentAsset.asset_type}
                  onValueChange={(value) =>
                    handleAssetInputChange("asset_type", value)
                  }
                >
                  <SelectTrigger id="asset_type">
                    <SelectValue placeholder="Pilih tipe aset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="phone">Handphone</SelectItem>
                    <SelectItem value="vehicle">Kendaraan</SelectItem>
                    <SelectItem value="equipment">Peralatan</SelectItem>
                    <SelectItem value="uniform">Seragam</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentAsset.status}
                  onValueChange={(value) =>
                    handleAssetInputChange("status", value)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Ditugaskan</SelectItem>
                    <SelectItem value="returned">Dikembalikan</SelectItem>
                    <SelectItem value="damaged">Rusak</SelectItem>
                    <SelectItem value="lost">Hilang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Penugasan *</Label>
                <DatePicker
                  date={assignedDate}
                  onDateChange={setAssignedDate}
                  placeholder="Pilih tanggal penugasan"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 5}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Pengembalian</Label>
                <DatePicker
                  date={returnDate}
                  onDateChange={setReturnDate}
                  placeholder="Pilih tanggal pengembalian"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={currentAsset.description}
                onChange={(e) =>
                  handleAssetInputChange("description", e.target.value)
                }
                placeholder="Deskripsi detail aset"
                rows={3}
              />
            </div>

            <Button type="button" onClick={handleAddAsset} className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Tambah Aset
            </Button>
          </div>

          {/* Daftar Aset */}
          {assets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm">Daftar Aset ({assets.length})</h4>
              </div>
              {assets.map((asset, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{asset.asset_code}</Badge>
                        <p className="mb-0">{asset.asset_name}</p>
                        <Badge variant="outline" className="capitalize">
                          {asset.asset_type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {asset.assigned_date && (
                          <div>
                            <span>Ditugaskan: </span>
                            <span>
                              {format(asset.assigned_date, "PPP", {
                                locale: id,
                              })}
                            </span>
                          </div>
                        )}
                        {asset.return_date && (
                          <div>
                            <span>Pengembalian: </span>
                            <span>
                              {format(asset.return_date, "PPP", { locale: id })}
                            </span>
                          </div>
                        )}
                        {asset.status && (
                          <div>
                            <span>Status: </span>
                            <Badge variant="secondary" className="capitalize">
                              {asset.status === 'assigned' ? 'Ditugaskan' :
                               asset.status === 'returned' ? 'Dikembalikan' :
                               asset.status === 'damaged' ? 'Rusak' : 'Hilang'}
                            </Badge>
                          </div>
                        )}
                        {asset.description && (
                          <div className="md:col-span-2">
                            <span>Deskripsi: </span>
                            <span>{asset.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAsset(asset.asset_code)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    ),
    [
      activeTab,
      formData,
      birthDate,
      joinDate,
      assets,
      currentAsset,
      assignedDate,
      returnDate,
      drivingLicenseExpiry,
      positions,
      divisions,
    ]
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Manajemen Karyawan & HR</h1>
        <p className="text-muted-foreground">
          Kelola data karyawan, probasi, rekrutmen, dan terminasi
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
          <TabsTrigger value="employees" className="gap-2">
            <Users size={16} />
            Data Karyawan
          </TabsTrigger>
          <TabsTrigger value="probasi" className="gap-2">
            <UserCheck size={16} />
            Probasi
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="gap-2">
            <UserPlus size={16} />
            Rekrutmen
          </TabsTrigger>
          <TabsTrigger value="termination" className="gap-2">
            <UserMinus size={16} />
            Terminasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Karyawan
                  </p>
                  <h3 className="text-2xl">{statistics.totalEmployees}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <UserPlus size={24} className="text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Karyawan Aktif
                  </p>
                  <h3 className="text-2xl">
                    {statistics.activeEmployees}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
                  <UserPlus size={24} className="text-[#00d27a]" />
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Golongan Pegawai
                  </p>
                  <h3 className="text-2xl">
                    {statistics.pegawaiCount}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#2c7be5]/10 rounded flex items-center justify-center">
                  <UserPlus size={24} className="text-[#2c7be5]" />
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Golongan Karyawan
                  </p>
                  <h3 className="text-2xl">
                    {statistics.karyawanCount}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
                  <UserPlus size={24} className="text-[#00d27a]" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm">
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="Cari berdasarkan nama, ID, atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Divisi</SelectItem>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.kode_divisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      <SelectItem value="on-leave">Cuti</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Ekspor</span>
                  </Button>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="gap-2 flex-1 sm:flex-none"
                        onClick={resetForm}
                      >
                        <UserPlus size={16} />
                        Tambah Karyawan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Karyawan Baru</DialogTitle>
                        <DialogDescription>
                          Isi formulir di bawah untuk menambahkan data karyawan
                          baru
                        </DialogDescription>
                      </DialogHeader>
                      {employeeFormFields}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Batal
                        </Button>
                        <Button onClick={handleAddEmployee}>Simpan Data</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[800px]">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      NIK
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Karyawan
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Divisi
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Jabatan
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Golongan
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Status
                    </th>
                    <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 md:px-6 py-8 text-center text-muted-foreground"
                      >
                        Memuat data karyawan...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 md:px-6 py-8 text-center text-muted-foreground"
                      >
                        {fetchError
                          ? `Error: ${fetchError}`
                          : "Tidak ada data karyawan"}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <span className="font-medium">
                            {employee.employeeId}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {employee.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div>
                              <p className="mb-0">{employee.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getDivisionName(employee.division)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-muted-foreground">
                          {getPositionName(employee.position)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getGradeLevelBadge(employee.gradeLevel)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} dari {totalCount} karyawan
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || loading}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || loading}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Data Karyawan</DialogTitle>
                <DialogDescription>
                  Perbarui informasi karyawan yang dipilih
                </DialogDescription>
              </DialogHeader>
              {employeeFormFields}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleUpdateEmployee}>Update Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detail Karyawan</DialogTitle>
                <DialogDescription>
                  Informasi lengkap data karyawan
                </DialogDescription>
              </DialogHeader>
              {selectedEmployee && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                      {selectedEmployee.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h3>{selectedEmployee.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEmployee.employeeId} •{" "}
                        {selectedEmployee.position}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getGradeLevelBadge(selectedEmployee.gradeLevel)}
                        {getStatusBadge(selectedEmployee.status)}
                        {selectedEmployee.terminationReason ? (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                            {selectedEmployee.terminationReason === "resignation"
                              ? "Pengunduran Diri"
                              : selectedEmployee.terminationReason === "retirement"
                              ? "Pensiun"
                              : selectedEmployee.terminationReason === "contract_end"
                              ? "Akhir Masa Kontrak"
                              : "Afkir"}
                          </Badge>
                        ) : selectedEmployee.workflowStatus && selectedEmployee.workflowStatus !== "none" ? (
                          <Badge
                            variant="secondary"
                            className={
                              selectedEmployee.workflowStatus === "recruitment"
                                ? "bg-blue-500/10 text-blue-500"
                                : selectedEmployee.workflowStatus === "probation"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-red-500/10 text-red-500"
                            }
                          >
                            {selectedEmployee.workflowStatus === "recruitment"
                              ? "Rekrutmen"
                              : selectedEmployee.workflowStatus === "probation"
                              ? "Probasi"
                              : "Terminasi"}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.nationalId && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          National ID / KTP
                        </p>
                        <p>{selectedEmployee.nationalId}</p>
                      </div>
                    )}
                    {selectedEmployee.nationality && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Kewarganegaraan
                        </p>
                        <p>{selectedEmployee.nationality}</p>
                      </div>
                    )}
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Email
                      </p>
                      <p>{selectedEmployee.email}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Telepon
                      </p>
                      <p>{selectedEmployee.phone}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tanggal Lahir
                      </p>
                      <p>
                        {format(selectedEmployee.birthDate, "PPP", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Jenis Kelamin
                      </p>
                      <p>
                        {selectedEmployee.gender === "male"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </p>
                    </div>
                    {selectedEmployee.height && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Tinggi Badan
                        </p>
                        <p>{selectedEmployee.height} cm</p>
                      </div>
                    )}
                    {selectedEmployee.weight && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Berat Badan
                        </p>
                        <p>{selectedEmployee.weight} kg</p>
                      </div>
                    )}
                    {selectedEmployee.bloodGroup && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Golongan Darah
                        </p>
                        <p>{selectedEmployee.bloodGroup}</p>
                      </div>
                    )}
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Agama
                      </p>
                      <p className="capitalize">{selectedEmployee.religion}</p>
                    </div>
                    {selectedEmployee.drivingLicenseNumber && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Nomor SIM
                        </p>
                        <p>{selectedEmployee.drivingLicenseNumber}</p>
                      </div>
                    )}
                    {selectedEmployee.drivingLicenseExpiry && (
                      <div className="p-4 bg-muted/30 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Tanggal Berlaku SIM
                        </p>
                        <p>
                          {format(
                            selectedEmployee.drivingLicenseExpiry,
                            "PPP",
                            { locale: id }
                          )}
                        </p>
                      </div>
                    )}
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Divisi
                      </p>
                      <p>{getDivisionName(selectedEmployee.division)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        Alamat
                      </p>
                      <p>{selectedEmployee.address}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tanggal Bergabung
                      </p>
                      <p>
                        {format(selectedEmployee.joinDate, "PPP", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Golongan
                      </p>
                      <p className="capitalize">
                        {selectedEmployee.gradeLevel}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Bank</p>
                      <p>
                        {selectedEmployee.bankName} -{" "}
                        {selectedEmployee.bankAccount}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        Kontak Darurat
                      </p>
                      <p>{selectedEmployee.emergencyContact}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground mb-1">
                        No. Kontak Darurat
                      </p>
                      <p>{selectedEmployee.emergencyPhone}</p>
                    </div>
                  </div>

                  {selectedEmployee.assets &&
                    selectedEmployee.assets.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4>
                          Aset Karyawan ({selectedEmployee.assets.length})
                        </h4>
                        {selectedEmployee.assets.map((asset) => (
                          <Card key={asset.id} className="p-4 bg-muted/20">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {asset.assetCode}
                                </Badge>
                                <p className="mb-0">{asset.assetName}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                {asset.loanStartDate && (
                                  <div>
                                    <span className="text-xs">
                                      Mulai Peminjaman:{" "}
                                    </span>
                                    <span>
                                      {format(asset.loanStartDate, "PPP", {
                                        locale: id,
                                      })}
                                    </span>
                                  </div>
                                )}
                                {asset.loanEndDate && (
                                  <div>
                                    <span className="text-xs">
                                      Akhir Peminjaman:{" "}
                                    </span>
                                    <span>
                                      {format(asset.loanEndDate, "PPP", {
                                        locale: id,
                                      })}
                                    </span>
                                  </div>
                                )}
                                {asset.licenseManager && (
                                  <div>
                                    <span className="text-xs">
                                      Pengurus Lisensi:{" "}
                                    </span>
                                    <span>{asset.licenseManager}</span>
                                  </div>
                                )}
                                {asset.personInCharge && (
                                  <div>
                                    <span className="text-xs">
                                      Penanggung Jawab:{" "}
                                    </span>
                                    <span>{asset.personInCharge}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="probasi" className="mt-0">
          <Probasi />
        </TabsContent>

        <TabsContent value="recruitment" className="mt-0">
          <Recruitment />
        </TabsContent>

        <TabsContent value="termination" className="mt-0">
          <Termination />
        </TabsContent>
      </Tabs>
    </div>
  );
}
