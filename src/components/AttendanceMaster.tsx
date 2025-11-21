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
 * C (Cuti) - hanya bisa dibuat otomatis dari approval cuti, tidak bisa manual input
 */
type AttendanceStatus = "HK" | "P" | "S" | "A" | "C";

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
  source: string; // Source: 'manual', 'sick_letter', 'cuti_approval'
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
  const [totalRecords, setTotalRecords] = useState(0); // Total records from database

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCurrentPage, setSummaryCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Statistics state (for cards)
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalPresent: 0,
    totalPermission: 0,
    totalSick: 0,
    totalAbsent: 0,
    totalRecords: 0,
    workingDaysInMonth: 0,
  });

  // Summary data state (for Summary tab - ALL records for the month)
  const [summaryData, setSummaryData] = useState<AttendanceSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

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
      case 'cuti': return 'C';
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
      case 'C': return 'cuti';
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

  // Load statistics for cards (COUNT queries - very fast)
  const loadStatistics = async () => {
    try {
      const monthNumber = getMonthNumber(selectedMonth);
      const year = selectedYear;
      const month = String(monthNumber).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;
      const lastDayOfMonth = new Date(selectedYear, monthNumber, 0).getDate();
      const lastDay = `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`;

      // Get active employee IDs first (to filter attendance records)
      const { data: activeEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('status', 'active');

      const activeEmployeeIds = (activeEmployees || []).map(e => e.id);

      // Get total count (only for active employees)
      const { count: total } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('employee_id', activeEmployeeIds);

      // Get count by status (only for active employees)
      const { count: present } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('employee_id', activeEmployeeIds)
        .eq('status', 'present');

      const { count: permission } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('employee_id', activeEmployeeIds)
        .eq('status', 'leave');

      const { count: sick } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('employee_id', activeEmployeeIds)
        .eq('status', 'sick');

      const { count: absent } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('employee_id', activeEmployeeIds)
        .eq('status', 'absent');

      // Get total active employees count
      const totalEmployeesCount = activeEmployeeIds.length;

      // Get working days from database (Hari Efektif from Master Hari Kerja)
      const { data: workingDayData } = await supabase
        .from('working_days')
        .select('working_days, holidays')
        .eq('year', selectedYear)
        .eq('month', monthNumber)
        .is('division_id', null) // Get company-wide working days
        .maybeSingle();

      // Calculate effective days: working_days - holidays
      let effectiveWorkingDays = 0;
      if (workingDayData) {
        effectiveWorkingDays = (workingDayData.working_days || 0) - (workingDayData.holidays || 0);
      } else {
        // Fallback to calculation if no data in database
        effectiveWorkingDays = getWorkingDaysInMonth(selectedYear, monthNumber);
      }

      setStatistics({
        totalEmployees: totalEmployeesCount || 0,
        totalPresent: present || 0,
        totalPermission: permission || 0,
        totalSick: sick || 0,
        totalAbsent: absent || 0,
        totalRecords: total || 0,
        workingDaysInMonth: effectiveWorkingDays,
      });

      setTotalRecords(total || 0);
    } catch (err: any) {
      console.error('Error loading statistics:', err);
    }
  };

  // Load summary data for Summary tab (ALL records for the month with aggregation)
  const loadSummaryData = async (division: string = 'all') => {
    try {
      setLoadingSummary(true);

      const monthNumber = getMonthNumber(selectedMonth);
      const year = selectedYear;
      const month = String(monthNumber).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;
      const lastDayOfMonth = new Date(selectedYear, monthNumber, 0).getDate();
      const lastDay = `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`;

      // Step 1: Get division_id if division filter is active
      let divisionId: string | null = null;
      if (division !== 'all') {
        const { data: divData } = await supabase
          .from('divisions')
          .select('id')
          .eq('nama_divisi', division)
          .single();

        if (divData) {
          divisionId = divData.id;
        } else {
          setSummaryData([]);
          return;
        }
      }

      // Step 2: Fetch ALL attendance records for the month (with filter if needed)
      // We'll fetch in batches if there are many records
      let allAttendanceRecords: any[] = [];
      let hasMore = true;
      let currentOffset = 0;
      const batchSize = 1000;

      while (hasMore) {
        let query = supabase
          .from('attendance_records')
          .select('employee_id, status')
          .gte('date', firstDay)
          .lte('date', lastDay)
          .range(currentOffset, currentOffset + batchSize - 1);

        const { data: batchData } = await query;

        if (batchData && batchData.length > 0) {
          allAttendanceRecords = [...allAttendanceRecords, ...batchData];
          currentOffset += batchSize;
          hasMore = batchData.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      if (allAttendanceRecords.length === 0) {
        setSummaryData([]);
        return;
      }

      // Step 3: Get unique employee IDs from attendance records
      const uniqueEmployeeIds = [...new Set(allAttendanceRecords.map(r => r.employee_id))];

      // Step 4: Fetch employee details
      let empQuery = supabase
        .from('employees')
        .select('id, employee_id, full_name, division_id, position_id')
        .in('id', uniqueEmployeeIds)
        .eq('status', 'active');

      // Apply division filter if needed
      if (divisionId) {
        empQuery = empQuery.eq('division_id', divisionId);
      }

      const { data: employeesData } = await empQuery;

      if (!employeesData || employeesData.length === 0) {
        setSummaryData([]);
        return;
      }

      // Fetch divisions and positions separately
      const { data: divisionsData } = await supabase
        .from('divisions')
        .select('id, kode_divisi, nama_divisi');

      const divisionsMap = new Map((divisionsData || []).map((d: any) => [d.id, d.nama_divisi]));

      const { data: positionsData } = await supabase
        .from('positions')
        .select('id, name');

      const positionsMap = new Map((positionsData || []).map((p: any) => [p.id, p.name]));

      // Step 5: Aggregate attendance data by employee
      const summary: { [key: string]: AttendanceSummary } = {};

      employeesData.forEach(emp => {
        summary[emp.id] = {
          employeeId: emp.id,
          employeeName: emp.full_name,
          employeeNIP: emp.employee_id,
          division: divisionsMap.get(emp.division_id) || '-',
          department: divisionsMap.get(emp.division_id) || '-',
          position: positionsMap.get(emp.position_id) || '-',
          totalHK: 0,
          totalP: 0,
          totalS: 0,
          totalA: 0,
          effectiveDays: 0,
          month: selectedMonth,
          year: selectedYear,
        };
      });

      // Count statuses
      allAttendanceRecords.forEach(record => {
        if (summary[record.employee_id]) {
          const uiStatus = mapStatusToUI(record.status);
          switch (uiStatus) {
            case 'HK':
              summary[record.employee_id].totalHK++;
              break;
            case 'P':
              summary[record.employee_id].totalP++;
              break;
            case 'S':
              summary[record.employee_id].totalS++;
              break;
            case 'A':
              summary[record.employee_id].totalA++;
              break;
            case 'C':
              // Count cuti as permisi for effective days calculation
              summary[record.employee_id].totalP++;
              break;
          }
        }
      });

      // Calculate effective days (HK + P + S)
      Object.values(summary).forEach(item => {
        item.effectiveDays = item.totalHK + item.totalP + item.totalS;
      });

      setSummaryData(Object.values(summary));
    } catch (err: any) {
      console.error('Error loading summary data:', err);
      toast.error('Gagal memuat ringkasan presensi');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Load attendance data from Supabase (PAGINATED with SERVER-SIDE FILTERING)
  const loadAttendanceData = async (page: number = 1, search: string = '', division: string = 'all') => {
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

      // Step 1: If search or division filter is active, find matching employee IDs
      let employeeIdsFilter: string[] | null = null;

      if (search.trim() !== '' || division !== 'all') {
        // Step 1A: Get division_id if division filter is active
        let divisionId: string | null = null;
        if (division !== 'all') {
          const { data: divData } = await supabase
            .from('divisions')
            .select('id')
            .eq('nama_divisi', division)
            .single();

          if (divData) {
            divisionId = divData.id;
          } else {
            // Division not found, return empty
            setAttendanceData([]);
            setTotalRecords(0);
            return;
          }
        }

        // Build employee query
        let empQuery = supabase
          .from('employees')
          .select('id, employee_id, full_name, division_id')
          .eq('status', 'active');

        // Apply search filter
        if (search.trim() !== '') {
          const searchTerm = search.toLowerCase();
          empQuery = empQuery.or(`full_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`);
        }

        // Apply division filter using division_id (not nested field)
        if (divisionId) {
          empQuery = empQuery.eq('division_id', divisionId);
        }

        const { data: matchingEmployees } = await empQuery;

        if (matchingEmployees && matchingEmployees.length > 0) {
          employeeIdsFilter = matchingEmployees.map(e => e.id);
        } else {
          // No matching employees found
          setAttendanceData([]);
          setTotalRecords(0);
          return;
        }
      }

      // Calculate pagination range
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Build main query
      let query = supabase
        .from('attendance_records')
        .select(`
          id,
          employee_id,
          date,
          status,
          source,
          notes,
          created_at,
          updated_at
        `, { count: 'exact' })
        .gte('date', firstDay)
        .lte('date', lastDay);

      // Apply employee filter from search/division
      if (employeeIdsFilter) {
        query = query.in('employee_id', employeeIdsFilter);
      }

      // Fetch paginated data
      const { data: allData, error: fetchError, count } = await query
        .range(from, to)
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;

      // Update total count for pagination
      setTotalRecords(count || 0);

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
            source: record.source || 'manual',
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
    // Load statistics, first page of data, and summary when month/year changes
    loadStatistics();
    loadAttendanceData(1, searchTerm, selectedDivision);
    loadSummaryData(selectedDivision);
    setCurrentPage(1); // Reset to page 1 when month/year changes
    setSummaryCurrentPage(1); // Reset summary pagination too
  }, [selectedMonth, selectedYear]);

  /**
   * Reload data when filters change (SERVER-SIDE FILTERING)
   */
  React.useEffect(() => {
    setCurrentPage(1);
    setSummaryCurrentPage(1); // Reset summary pagination too
    loadAttendanceData(1, searchTerm, selectedDivision);
    // Reload summary when division filter changes
    loadSummaryData(selectedDivision);
  }, [searchTerm, selectedDivision]);

  /**
   * Data already filtered and paginated from server
   */
  const filteredData = attendanceData; // No client-side filtering needed

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
   * Pagination calculations (SERVER-SIDE)
   */
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalRecords);
  const paginatedData = sortedData; // Data already paginated from server

  /**
   * Handle page change (SERVER-SIDE)
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAttendanceData(page, searchTerm, selectedDivision); // Fetch new page from server with filters
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle summary page change
   */
  const handleSummaryPageChange = (page: number) => {
    setSummaryCurrentPage(page);
  };

  /**
   * Get attendance summary (returns pre-calculated summaryData from state)
   * Data is loaded by loadSummaryData() which fetches ALL records for the month
   */
  const getAttendanceSummary = (): AttendanceSummary[] => {
    return summaryData;
  };

  // Summary pagination calculations
  const summaryTotalPages = Math.ceil(summaryData.length / ITEMS_PER_PAGE);
  const summaryStartIndex = (summaryCurrentPage - 1) * ITEMS_PER_PAGE;
  const summaryEndIndex = Math.min(summaryStartIndex + ITEMS_PER_PAGE, summaryData.length);
  const paginatedSummaryData = summaryData.slice(summaryStartIndex, summaryEndIndex);

  /**
   * Hitung statistik kehadiran keseluruhan
   * Now uses pre-calculated statistics from state
   */
  const getAttendanceStats = () => {
    return statistics;
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
    // Prevent editing attendance records with status 'C' (Cuti - auto-generated)
    if (item.status === 'C') {
      toast.error('Data presensi dengan status Cuti tidak dapat diedit secara manual. Data ini dibuat otomatis dari approval cuti.');
      return;
    }

    // Prevent editing attendance records from sick_letter
    if (item.source === 'sick_letter') {
      toast.error('Data presensi dari surat sakit tidak dapat diedit secara manual. Data ini dibuat otomatis oleh dokter.');
      return;
    }

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

      // Reload data, statistics, and summary with current filters
      await Promise.all([
        loadStatistics(),
        loadAttendanceData(currentPage, searchTerm, selectedDivision),
        loadSummaryData(selectedDivision)
      ]);
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

    // Prevent deleting attendance records with status 'C' (Cuti - auto-generated)
    if (editingItem.status === 'C') {
      toast.error('Data presensi dengan status Cuti tidak dapat dihapus secara manual. Data ini dibuat otomatis dari approval cuti.');
      setIsDeleteDialogOpen(false);
      setEditingItem(null);
      return;
    }

    // Prevent deleting attendance records from sick_letter
    if (editingItem.source === 'sick_letter') {
      toast.error('Data presensi dari surat sakit tidak dapat dihapus secara manual. Data ini dibuat otomatis oleh dokter.');
      setIsDeleteDialogOpen(false);
      setEditingItem(null);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Data presensi berhasil dihapus');

      // Reload data, statistics, and summary with current filters
      await Promise.all([
        loadStatistics(),
        loadAttendanceData(currentPage, searchTerm, selectedDivision),
        loadSummaryData(selectedDivision)
      ]);
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
      case "C":
        return { variant: "secondary" as const, label: "Cuti", className: "bg-blue-600 text-white" };
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
      <div className="p-4 h-[calc(100vh-4rem)] overflow-hidden flex flex-col gap-3">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Master Presensi Karyawan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data kehadiran karyawan untuk perhitungan upah pokok berdasarkan hari kerja efektif
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-shrink-0">
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
        <Tabs defaultValue="attendance" className="w-full flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0">
            <TabsTrigger value="attendance">Data Presensi</TabsTrigger>
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          </TabsList>

          {/* Tab Data Presensi */}
          <TabsContent value="attendance" className="flex-1 min-h-0 flex flex-col mt-2">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="flex-shrink-0">
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
              <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Filter & Search */}
                <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama, ID Karyawan, atau estate..."
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
                    <Label>Filter Estate:</Label>
                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Pilih Estate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Semua Estate</Badge>
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
                <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>ID Karyawan</TableHead>
                          <TableHead>Nama Karyawan</TableHead>
                          <TableHead>Estate</TableHead>
                          <TableHead>Posisi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} />
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                                <div className="flex flex-col items-center gap-1">
                                  <Badge
                                    variant={statusBadge.variant}
                                    className={statusBadge.className}
                                  >
                                    {statusBadge.label}
                                  </Badge>
                                  {item.source === 'sick_letter' && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Surat Sakit
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={item.notes}>
                                  {item.notes || "-"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <PermissionGuard module="attendance_master" action="edit">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(item)}
                                      disabled={item.status === 'C' || item.source === 'sick_letter'}
                                      title={item.status === 'C' ? 'Data cuti tidak dapat diedit secara manual' : item.source === 'sick_letter' ? 'Data surat sakit tidak dapat diedit secara manual' : ''}
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
                                      disabled={item.status === 'C' || item.source === 'sick_letter'}
                                      title={item.status === 'C' ? 'Data cuti tidak dapat dihapus secara manual' : item.source === 'sick_letter' ? 'Data surat sakit tidak dapat dihapus secara manual' : ''}
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
                {totalRecords > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                    {/* Data Info */}
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{endIndex} dari {totalRecords} total data presensi
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
          <TabsContent value="summary" className="flex-1 min-h-0 flex flex-col mt-2">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="flex-shrink-0">
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
              <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Filter */}
                <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
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
                <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
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
                      {loadingSummary ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} />
                          </TableCell>
                        </TableRow>
                      ) : summaryData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Tidak ada data ringkasan untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedSummaryData.map((summary) => {
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
                </div>

                {/* Pagination Info and Controls for Summary */}
                {summaryData.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                    {/* Data Info */}
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {summaryStartIndex + 1}-{summaryEndIndex} dari {summaryData.length} total karyawan
                    </div>

                    {/* Pagination Controls */}
                    {summaryTotalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => summaryCurrentPage > 1 && handleSummaryPageChange(summaryCurrentPage - 1)}
                              className={summaryCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {/* Page Numbers */}
                          {Array.from({ length: summaryTotalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === summaryTotalPages ||
                              (page >= summaryCurrentPage - 1 && page <= summaryCurrentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handleSummaryPageChange(page)}
                                    isActive={summaryCurrentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === summaryCurrentPage - 2 || page === summaryCurrentPage + 2) {
                              return <PaginationEllipsis key={page} />;
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => summaryCurrentPage < summaryTotalPages && handleSummaryPageChange(summaryCurrentPage + 1)}
                              className={summaryCurrentPage === summaryTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
