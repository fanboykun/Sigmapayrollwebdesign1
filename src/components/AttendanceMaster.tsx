/**
 * AttendanceMaster.tsx
 * 
 * Komponen untuk mengelola Master Presensi/Kehadiran Karyawan.
 * Digunakan untuk mencatat kehadiran karyawan dengan status HK (Hari Kerja),
 * P (Permisi), dan S (Sakit) yang akan mempengaruhi perhitungan upah pokok.
 * 
 * Fitur utama:
 * - CRUD data presensi karyawan per periode
 * - Status kehadiran: HK, P (Permisi), S (Sakit), A (Alfa)
 * - Kalender untuk memilih tanggal
 * - Perhitungan otomatis total hari kerja efektif
 * - Bulk import presensi
 * - Role-based access control
 * 
 * @module AttendanceMaster
 * @author Sistem ERP Perkebunan Sawit
 */

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  X,
  Calendar as CalendarIcon,
  Users,
  Download,
  Upload,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "../contexts/AuthContext";
import { PermissionGuard } from "./PermissionGuard";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "./ui/pagination";
import { supabase } from "../utils/supabase/client";
import { toast } from "sonner";
import {
  getWorkingDaysInMonth,
  getMonthNumber,
  isWeekend,
  isHoliday,
  getHolidayByDate,
} from "../shared/holidayData";

/**
 * Tipe status kehadiran
 */
type AttendanceStatus = "HK" | "P" | "S" | "A";

/**
 * Interface untuk data Presensi
 */
interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNIP: string;
  division: string;
  department: string;
  position: string;
  date: string;
  status: AttendanceStatus;
  notes: string;
  month: string;
  year: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface untuk ringkasan kehadiran karyawan
 */
interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  employeeNIP: string;
  division: string;
  department: string;
  position: string;
  totalHK: number;
  totalP: number;
  totalS: number;
  totalA: number;
  effectiveDays: number;
  month: string;
  year: number;
}

/**
 * Komponen utama AttendanceMaster
 * Mengelola master presensi karyawan untuk perhitungan upah
 */
export function AttendanceMaster() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<string>("November");
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  // Supabase data state
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // State untuk form input
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    employeeNIP: "",
    division: "",
    department: "",
    position: "",
    date: "",
    status: "HK" as AttendanceStatus,
    notes: "",
  });

  // Status mapping: Database → UI
  const mapStatusToUI = (dbStatus: string): AttendanceStatus => {
    switch (dbStatus) {
      case 'present': return 'HK';
      case 'leave': return 'P';
      case 'sick': return 'S';
      case 'absent': return 'A';
      default: return 'HK';
    }
  };

  // Status mapping: UI → Database
  const mapStatusToDB = (uiStatus: AttendanceStatus): string => {
    switch (uiStatus) {
      case 'HK': return 'present';
      case 'P': return 'leave';
      case 'S': return 'sick';
      case 'A': return 'absent';
      default: return 'present';
    }
  };

  // Load divisions from Supabase
  const loadDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('id, kode_divisi, nama_divisi')
        .order('nama_divisi');

      if (error) throw error;
      setDivisions(data || []);
    } catch (err: any) {
      console.error('Error loading divisions:', err);
    }
  };

  // Load employees from Supabase
  const loadEmployees = async () => {
    try {
      // Fetch employees without joins
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, full_name, division_id, position_id')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;

      // Fetch divisions separately
      const { data: divisionsData } = await supabase
        .from('divisions')
        .select('id, kode_divisi, nama_divisi');

      const divisionsMap = new Map((divisionsData || []).map((d: any) => [d.id, d.nama_divisi]));

      // Fetch positions separately
      const { data: positionsData } = await supabase
        .from('positions')
        .select('id, name');

      const positionsMap = new Map((positionsData || []).map((p: any) => [p.id, p.name]));

      const employeesList = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.full_name,
        nip: emp.employee_id,
        division: divisionsMap.get(emp.division_id) || '-',
        divisionId: emp.division_id,
        department: divisionsMap.get(emp.division_id) || '-',
        position: positionsMap.get(emp.position_id) || '-',
      }));

      setEmployees(employeesList);
    } catch (err: any) {
      console.error('Error loading employees:', err);
      toast.error('Gagal memuat data karyawan');
    }
  };

  // Load attendance data from Supabase
  const loadAttendanceData = async () => {
    try {
      setLoading(true);

      // Calculate date range for selected month/year
      const monthNumber = getMonthNumber(selectedMonth);

      // Create date strings directly to avoid timezone issues
      // Format: YYYY-MM-DD
      const year = selectedYear;
      const month = String(monthNumber).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;

      // Get last day of month
      const lastDayOfMonth = new Date(selectedYear, monthNumber, 0).getDate();
      const lastDay = `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`;

      // Fetch data in batches due to Supabase 1000-row limit per request
      let allData: any[] = [];
      let currentPage = 0;
      const pageSize = 1000;
      let hasMore = true;
      let totalCount = 0;

      // First, get total count
      const { count: totalRecords, error: countError } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay);

      if (countError) throw countError;
      totalCount = totalRecords || 0;

      // Fetch all data in batches
      while (hasMore && currentPage * pageSize < totalCount) {
        const from = currentPage * pageSize;
        const to = from + pageSize - 1;

        const { data: batchData, error: batchError } = await supabase
          .from('attendance_records')
          .select(`
            id,
            employee_id,
            date,
            status,
            notes,
            created_at,
            updated_at
          `)
          .gte('date', firstDay)
          .lte('date', lastDay)
          .range(from, to)
          .order('date', { ascending: true });

        if (batchError) throw batchError;

        if (batchData && batchData.length > 0) {
          allData.push(...batchData);
          currentPage++;
        } else {
          hasMore = false;
        }

        // Safety break - max 20 batches (20,000 records)
        if (currentPage >= 20) {
          console.warn('Reached maximum batch limit (20 batches = 20,000 records)');
          break;
        }
      }

      if (!allData || allData.length === 0) {
        setAttendanceData([]);
        toast.warning('Tidak ada data presensi untuk periode yang dipilih');
        return;
      }

      // Fetch employee details for each attendance record
      const employeeIds = [...new Set(allData.map((a: any) => a.employee_id))];

      if (employeeIds.length === 0) {
        setAttendanceData([]);
        return;
      }

      // Fetch employees without joins
      const { data: employeesData, error: empError } = await supabase
        .from('employees')
        .select('id, employee_id, full_name, division_id, position_id')
        .in('id', employeeIds);

      if (empError) {
        console.error('Error fetching employees:', empError);
      }

      // Fetch divisions separately
      const { data: divisionsData } = await supabase
        .from('divisions')
        .select('id, kode_divisi, nama_divisi');

      const divisionsMap = new Map((divisionsData || []).map((d: any) => [d.id, d.nama_divisi]));

      // Fetch positions separately
      const { data: positionsData } = await supabase
        .from('positions')
        .select('id, name');

      const positionsMap = new Map((positionsData || []).map((p: any) => [p.id, p.name]));

      // Create employee map
      const employeeMap = new Map((employeesData || []).map((emp: any) => [
        emp.id,
        {
          employeeId: emp.employee_id,
          fullName: emp.full_name,
          division: divisionsMap.get(emp.division_id) || '-',
          position: positionsMap.get(emp.position_id) || '-',
        }
      ]));

      // Transform attendance data
      const transformedData: Attendance[] = allData
        .map((record: any) => {
          const employee = employeeMap.get(record.employee_id);

          // Log missing employee data for debugging
          if (!employee) {
            console.warn('Missing employee data for attendance record:', {
              recordId: record.id,
              employeeId: record.employee_id,
              date: record.date
            });
          }

          // Skip records with missing or invalid employee_id
          if (!record.employee_id || !employee) {
            console.warn('Skipping attendance record due to missing employee:', record.id);
            return null;
          }

          return {
            id: record.id,
            employeeId: record.employee_id,
            employeeName: employee.fullName,
            employeeNIP: employee.employeeId,
            division: employee.division,
            department: employee.division,
            position: employee.position,
            date: record.date,
            status: mapStatusToUI(record.status),
            notes: record.notes || '',
            month: selectedMonth,
            year: selectedYear,
            createdBy: user?.email || 'System',
            createdAt: record.created_at,
            updatedAt: record.updated_at,
          };
        })
        .filter((record): record is Attendance => record !== null);

      setAttendanceData(transformedData);

      // Log total records loaded
      console.log(`Loaded ${transformedData.length} attendance records for ${selectedMonth} ${selectedYear}`);

      // Notify if some records were skipped
      const skippedCount = allData.length - transformedData.length;
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} data presensi tidak dapat ditampilkan karena data karyawan tidak ditemukan. Periksa console untuk detail.`);
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      toast.error('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  // useEffect to load data on mount and when filters change
  useEffect(() => {
    loadDivisions();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear]);

  /**
   * Filter data berdasarkan pencarian dan divisi
   */
  const filteredData = attendanceData.filter(item => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeNIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.division.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision = selectedDivision === "all" || item.division === selectedDivision;

    return matchesSearch && matchesDivision;
  });

  /**
   * Sorting data berdasarkan tanggal
   */
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.employeeName !== b.employeeName) {
      return a.employeeName.localeCompare(b.employeeName);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  /**
   * Pagination calculations
   */
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  /**
   * Reset page to 1 when filters change
   */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedYear, selectedDivision]);

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Hitung ringkasan kehadiran per karyawan
   */
  const getAttendanceSummary = (): AttendanceSummary[] => {
    const summary: { [key: string]: AttendanceSummary } = {};

    filteredData.forEach(item => {
      if (!summary[item.employeeId]) {
        summary[item.employeeId] = {
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          employeeNIP: item.employeeNIP,
          division: item.division,
          department: item.department,
          position: item.position,
          totalHK: 0,
          totalP: 0,
          totalS: 0,
          totalA: 0,
          effectiveDays: 0,
          month: item.month,
          year: item.year,
        };
      }

      switch (item.status) {
        case "HK":
          summary[item.employeeId].totalHK++;
          break;
        case "P":
          summary[item.employeeId].totalP++;
          break;
        case "S":
          summary[item.employeeId].totalS++;
          break;
        case "A":
          summary[item.employeeId].totalA++;
          break;
      }
    });

    // Hitung hari efektif (HK + P + S)
    Object.values(summary).forEach(item => {
      item.effectiveDays = item.totalHK + item.totalP + item.totalS;
    });

    return Object.values(summary);
  };

  /**
   * Hitung statistik kehadiran keseluruhan
   */
  const getAttendanceStats = () => {
    // Hitung hari kerja efektif dalam bulan yang dipilih
    const monthNumber = getMonthNumber(selectedMonth);
    const workingDaysInMonth = getWorkingDaysInMonth(selectedYear, monthNumber);

    const stats = {
      totalEmployees: new Set(filteredData.map(item => item.employeeId)).size,
      totalPresent: filteredData.filter(item => item.status === "HK").length,
      totalPermission: filteredData.filter(item => item.status === "P").length,
      totalSick: filteredData.filter(item => item.status === "S").length,
      totalAbsent: filteredData.filter(item => item.status === "A").length,
      totalRecords: filteredData.length,
      workingDaysInMonth: workingDaysInMonth,
    };

    return stats;
  };

  /**
   * Handle perubahan input form
   */
  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-fill employee data when selecting employee
    if (field === "employeeId") {
      const employee = employees.find(e => e.id === value);
      if (employee) {
        newFormData.employeeName = employee.name;
        newFormData.employeeNIP = employee.nip;
        newFormData.division = employee.division;
        newFormData.department = employee.department;
        newFormData.position = employee.position;
      }
    }

    setFormData(newFormData);
  };

  /**
   * Buka dialog untuk tambah data baru
   */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      employeeId: "",
      employeeName: "",
      employeeNIP: "",
      division: "",
      department: "",
      position: "",
      date: "",
      status: "HK",
      notes: "",
    });
    setSelectedDate(undefined);
    setIsDialogOpen(true);
  };

  /**
   * Buka dialog untuk edit data
   */
  const handleEdit = (item: Attendance) => {
    setEditingItem(item);
    setFormData({
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      employeeNIP: item.employeeNIP,
      division: item.division,
      department: item.department,
      position: item.position,
      date: item.date,
      status: item.status,
      notes: item.notes,
    });
    setSelectedDate(new Date(item.date));
    setIsDialogOpen(true);
  };

  /**
   * Simpan data (create/update)
   */
  const handleSave = async () => {
    // Validasi
    if (!formData.employeeId || !formData.date) {
      toast.error("Karyawan dan tanggal wajib diisi!");
      return;
    }

    try {
      setLoading(true);

      // Convert UI status to DB status
      const dbStatus = mapStatusToDB(formData.status);

      // Check if the date is in the current selected month/year
      const inputDate = new Date(formData.date);
      const inputMonth = format(inputDate, "MMMM", { locale: id });
      const inputYear = inputDate.getFullYear();
      const isInCurrentPeriod = inputMonth === selectedMonth && inputYear === selectedYear;

      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from('attendance_records')
          .update({
            status: dbStatus,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Data presensi berhasil diperbarui');
      } else {
        // Check for duplicate before inserting
        const { data: existingRecord, error: checkError } = await supabase
          .from('attendance_records')
          .select('id, status, notes')
          .eq('employee_id', formData.employeeId)
          .eq('date', formData.date)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingRecord) {
          // Record already exists, update instead of insert
          const { error: updateError } = await supabase
            .from('attendance_records')
            .update({
              status: dbStatus,
              notes: formData.notes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRecord.id);

          if (updateError) throw updateError;
          toast.success('Data presensi sudah ada dan telah diperbarui');
        } else {
          // Create new
          const { error } = await supabase
            .from('attendance_records')
            .insert({
              employee_id: formData.employeeId,
              date: formData.date,
              status: dbStatus,
              notes: formData.notes,
            });

          if (error) throw error;

          if (!isInCurrentPeriod) {
            toast.success(`Data presensi berhasil ditambahkan untuk ${inputMonth} ${inputYear}. Ubah filter periode untuk melihat data.`);
            // Auto-switch to the period of the added data
            setSelectedMonth(inputMonth);
            setSelectedYear(inputYear);
          } else {
            toast.success('Data presensi berhasil ditambahkan');
          }
        }
      }

      // Reload data
      await loadAttendanceData();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error(err.message || 'Gagal menyimpan data presensi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    if (!editingItem) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Data presensi berhasil dihapus');

      // Reload data
      await loadAttendanceData();
      setIsDeleteDialogOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error deleting attendance:', err);
      toast.error(err.message || 'Gagal menghapus data presensi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pemilihan tanggal dari kalender
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        date: format(date, "yyyy-MM-dd"),
      });
    }
  };

  /**
   * Get badge variant dan label berdasarkan status
   */
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "HK":
        return { variant: "default" as const, label: "Hadir", className: "bg-green-600" };
      case "P":
        return { variant: "secondary" as const, label: "Permisi", className: "" };
      case "S":
        return { variant: "outline" as const, label: "Sakit", className: "border-yellow-500 text-yellow-700" };
      case "A":
        return { variant: "destructive" as const, label: "Alfa", className: "" };
      default:
        return { variant: "default" as const, label: status, className: "" };
    }
  };

  /**
   * Export data ke CSV
   */
  const handleExportCSV = () => {
    const summary = getAttendanceSummary();

    // CSV Header
    const headers = [
      "ID Karyawan",
      "Nama Karyawan",
      "Divisi",
      "Department",
      "Posisi",
      "Hadir (HK)",
      "Permisi (P)",
      "Sakit (S)",
      "Alfa (A)",
      "Total Hari Efektif",
      "Periode"
    ];

    // CSV Rows
    const rows = summary.map(item => [
      item.employeeNIP,
      item.employeeName,
      item.division,
      item.department,
      item.position,
      item.totalHK,
      item.totalP,
      item.totalS,
      item.totalA,
      item.effectiveDays,
      `${item.month} ${item.year}`
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `Ringkasan_Presensi_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export data detail ke CSV
   */
  const handleExportDetailCSV = () => {
    // CSV Header
    const headers = [
      "Tanggal",
      "ID Karyawan",
      "Nama Karyawan",
      "Divisi",
      "Department",
      "Posisi",
      "Status",
      "Keterangan",
      "Dibuat Oleh",
      "Tanggal Dibuat"
    ];

    // CSV Rows
    const rows = sortedData.map(item => [
      format(new Date(item.date), "dd/MM/yyyy"),
      item.employeeNIP,
      item.employeeName,
      item.division,
      item.department,
      item.position,
      getStatusBadge(item.status).label,
      item.notes || "-",
      item.createdBy,
      item.createdAt
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `Detail_Presensi_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = getAttendanceStats();

  return (
    <PermissionGuard module="attendance_master" action="view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Master Presensi Karyawan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data kehadiran karyawan untuk perhitungan upah pokok berdasarkan hari kerja efektif
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hari Kerja Efektif</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.workingDaysInMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Hari (excl. Weekend & Libur)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Karyawan</CardDescription>
              <CardTitle className="text-3xl">{stats.totalEmployees}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Periode {selectedMonth} {selectedYear}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Hadir (HK)</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.totalPresent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {stats.totalRecords > 0
                  ? `${((stats.totalPresent / stats.totalRecords) * 100).toFixed(1)}% dari total`
                  : "Tidak ada data"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tidak Hadir (A)</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.totalAbsent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {stats.totalRecords > 0
                  ? `${((stats.totalAbsent / stats.totalRecords) * 100).toFixed(1)}% dari total`
                  : "Tidak ada data"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Status Lainnya</CardDescription>
              <CardTitle className="text-3xl">{stats.totalPermission + stats.totalSick}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                P: {stats.totalPermission} | S: {stats.totalSick}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs untuk Data Presensi dan Ringkasan */}
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="attendance">Data Presensi</TabsTrigger>
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          </TabsList>

          {/* Tab Data Presensi */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Presensi Detail</CardTitle>
                    <CardDescription>
                      Daftar presensi harian karyawan dengan status kehadiran
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportDetailCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <PermissionGuard module="attendance_master" action="create">
                      <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Presensi
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter & Search */}
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama, ID Karyawan, atau divisi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                          ].map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Division Filter */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label>Filter Divisi:</Label>
                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Pilih divisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Semua Divisi</Badge>
                          </div>
                        </SelectItem>
                        {divisions.map((division) => (
                          <SelectItem key={division.id} value={division.nama_divisi}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{division.kode_divisi}</Badge>
                              <span>{division.nama_divisi}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDivision !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDivision("all")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-x-auto">
                  <div className="max-h-[70vh] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>ID Karyawan</TableHead>
                          <TableHead>Nama Karyawan</TableHead>
                          <TableHead>Divisi</TableHead>
                          <TableHead>Posisi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead>Dibuat Oleh</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} />
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              Tidak ada data presensi untuk periode yang dipilih
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedData.map((item) => {
                          const statusBadge = getStatusBadge(item.status);
                          const division = divisions.find(d => d.nama_divisi === item.division);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <div>{format(new Date(item.date), "dd MMM yyyy", { locale: id })}</div>
                                  <div className="text-muted-foreground text-sm">
                                    {format(new Date(item.date), "EEEE", { locale: id })}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">{item.employeeNIP}</span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.employeeName}</div>
                                  <div className="text-sm text-muted-foreground">{item.department}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {division && (
                                    <Badge variant="outline" className="text-xs">
                                      {division.kode_divisi}
                                    </Badge>
                                  )}
                                  <span className="text-sm">{item.division}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{item.position}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={statusBadge.variant}
                                  className={statusBadge.className}
                                >
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={item.notes}>
                                  {item.notes || "-"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{item.createdBy}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <PermissionGuard module="attendance_master" action="edit">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </PermissionGuard>
                                  <PermissionGuard module="attendance_master" action="delete">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingItem(item);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </PermissionGuard>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>

                {/* Pagination Info and Controls */}
                {sortedData.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Data Info */}
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedData.length)} dari {sortedData.length} data presensi
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {/* Page Numbers */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current page
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <PaginationEllipsis key={page} />;
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Ringkasan */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ringkasan Kehadiran Karyawan</CardTitle>
                    <CardDescription>
                      Rekapitulasi kehadiran per karyawan periode {selectedMonth} {selectedYear}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter */}
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                        ].map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2023, 2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Division Filter for Summary */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label>Filter Divisi:</Label>
                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Pilih divisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Semua Divisi</Badge>
                          </div>
                        </SelectItem>
                        {divisions.map((division) => (
                          <SelectItem key={division.id} value={division.nama_divisi}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{division.kode_divisi}</Badge>
                              <span>{division.nama_divisi}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDivision !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDivision("all")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Table Ringkasan */}
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Karyawan</TableHead>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead className="text-center">Hadir (HK)</TableHead>
                        <TableHead className="text-center">Permisi (P)</TableHead>
                        <TableHead className="text-center">Sakit (S)</TableHead>
                        <TableHead className="text-center">Alfa (A)</TableHead>
                        <TableHead className="text-center">Total Hari Efektif</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} />
                          </TableCell>
                        </TableRow>
                      ) : getAttendanceSummary().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Tidak ada data ringkasan untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        getAttendanceSummary().map((summary) => {
                          const division = divisions.find(d => d.nama_divisi === summary.division);
                          return (
                            <TableRow key={summary.employeeId}>
                              <TableCell>
                                <span className="font-mono text-sm">{summary.employeeNIP}</span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{summary.employeeName}</div>
                                  <div className="text-sm text-muted-foreground">{summary.department}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {division && (
                                    <Badge variant="outline" className="text-xs">
                                      {division.kode_divisi}
                                    </Badge>
                                  )}
                                  <span className="text-sm">{summary.division}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{summary.position}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="default" className="bg-green-600">
                                  {summary.totalHK}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">
                                  {summary.totalP}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                  {summary.totalS}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">
                                  {summary.totalA}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="default" className="bg-blue-600">
                                  {summary.effectiveDays} Hari
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Presensi" : "Tambah Presensi"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Perbarui informasi presensi karyawan"
                  : "Tambahkan data presensi karyawan baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Filter Divisi */}
              {!editingItem && (
                <div className="grid gap-2 p-3 bg-muted/50 rounded-md">
                  <Label>Filter Karyawan berdasarkan Divisi</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih divisi untuk filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Semua Divisi</Badge>
                        </div>
                      </SelectItem>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.nama_divisi}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{division.kode_divisi}</Badge>
                            <span>{division.nama_divisi}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {selectedDivision === "all"
                      ? `Menampilkan ${employees.filter(e => selectedDivision === "all" || e.division === selectedDivision).length} karyawan dari semua divisi`
                      : `Menampilkan ${employees.filter(e => selectedDivision === "all" || e.division === selectedDivision).length} karyawan dari divisi ${selectedDivision}`
                    }
                  </p>
                </div>
              )}

              {/* Pilih Karyawan */}
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Karyawan *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => handleInputChange("employeeId", value)}
                  disabled={!!editingItem}
                >
                  <SelectTrigger id="employeeId">
                    <SelectValue placeholder="Pilih karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => selectedDivision === "all" || emp.division === selectedDivision)
                      .map((emp) => {
                        const division = divisions.find(d => d.nama_divisi === emp.division);
                        return (
                          <SelectItem key={emp.id} value={emp.id}>
                            <div className="flex items-center gap-2">
                              {division && (
                                <Badge variant="outline" className="text-xs">
                                  {division.kode_divisi}
                                </Badge>
                              )}
                              <span>{emp.nip} - {emp.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Info Karyawan yang dipilih */}
              {formData.employeeId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID Karyawan:</span>
                      <span className="ml-2 font-mono font-medium">{formData.employeeNIP}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nama:</span>
                      <span className="ml-2 font-medium">{formData.employeeName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Divisi:</span>
                      <span className="ml-2">{formData.division}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <span className="ml-2">{formData.department}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Posisi:</span>
                      <span className="ml-2">{formData.position}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Pilih Tanggal */}
                <div className="grid gap-2">
                  <Label>Tanggal *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd MMM yyyy", { locale: id })
                        ) : (
                          "Pilih tanggal"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status Kehadiran *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HK">HK - Hadir</SelectItem>
                      <SelectItem value="P">P - Permisi</SelectItem>
                      <SelectItem value="S">S - Sakit</SelectItem>
                      <SelectItem value="A">A - Alfa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Keterangan */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Keterangan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  rows={3}
                />
              </div>

              {/* Info Legend */}
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm space-y-1">
                  <p><strong>Keterangan Status:</strong></p>
                  <p>• HK (Hari Kerja): Karyawan hadir dan bekerja normal</p>
                  <p>• P (Permisi): Karyawan tidak hadir dengan izin</p>
                  <p>• S (Sakit): Karyawan tidak hadir karena sakit</p>
                  <p>• A (Alfa): Karyawan tidak hadir tanpa keterangan</p>
                </div>
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <p><strong>Catatan:</strong> Untuk cuti karyawan, silakan gunakan menu Cuti Karyawan</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus data presensi ini? 
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
