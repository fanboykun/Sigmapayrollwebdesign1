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

import React, { useState } from "react";
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
  FileText
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
import { MASTER_EMPLOYEES, getEmployeesByDivision } from "../shared/employeeData";
import { MASTER_DIVISIONS, Division } from "../shared/divisionData";
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

  // Data karyawan untuk dropdown dari master data (filtered by division)
  const getEmployeesList = () => {
    if (selectedDivision === "all") {
      return MASTER_EMPLOYEES;
    }
    return getEmployeesByDivision(selectedDivision);
  };

  const employees = getEmployeesList().map(emp => ({
    id: emp.id,
    name: emp.fullName,
    nip: emp.employeeId,
    division: emp.division,
    department: emp.department,
    position: emp.position,
  }));

  // Helper function untuk generate attendance data untuk seluruh tahun 2025
  const generateAttendanceData = (): Attendance[] => {
    const attendanceData: Attendance[] = [];
    let idCounter = 1;

    // Definisi bulan dalam bahasa Indonesia
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Generate data untuk seluruh tahun 2025 (Januari - Desember)
    for (let month = 1; month <= 12; month++) {
      const year = 2025;
      const monthName = monthNames[month - 1];

      // Dapatkan semua tanggal dalam bulan ini
      const daysInMonth = new Date(year, month, 0).getDate();

      // Loop setiap karyawan
      MASTER_EMPLOYEES.forEach((emp) => {
        // Loop setiap hari dalam bulan
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          // Skip weekend (Sabtu dan Minggu)
          if (isWeekend(dateStr)) {
            continue;
          }

          // Skip hari libur nasional
          if (isHoliday(dateStr)) {
            continue;
          }

          let status: AttendanceStatus = "HK";
          let notes = "";

          // Simulasi variasi kehadiran berdasarkan karakteristik karyawan
          const randomFactor = Math.random();

          // Karyawan contract: 5% kemungkinan sakit
          if (emp.employmentType === "contract" && randomFactor > 0.95) {
            status = "S";
            notes = "Sakit";
          }
          // Staff senior/Mandor: 3% kemungkinan permisi dinas
          else if ((emp.position.includes("Mandor") || emp.position.includes("Manager")) && randomFactor > 0.97) {
            status = "P";
            notes = "Permisi keperluan dinas";
          }
          // Karyawan permanent: 1% kemungkinan alfa
          else if (emp.employmentType === "permanent" && randomFactor > 0.99) {
            status = "A";
            notes = "Tidak hadir tanpa keterangan";
          }
          // Semua karyawan: 2% kemungkinan sakit ringan
          else if (randomFactor > 0.98) {
            status = "S";
            notes = "Sakit ringan";
          }

          attendanceData.push({
            id: idCounter.toString(),
            employeeId: emp.employeeId,
            employeeName: emp.fullName,
            employeeNIP: emp.employeeId,
            division: emp.division,
            department: emp.department,
            position: emp.position,
            date: dateStr,
            status: status,
            notes: notes,
            month: monthName,
            year: year,
            createdBy: "System",
            createdAt: dateStr,
            updatedAt: dateStr,
          });

          idCounter++;
        }
      });
    }

    return attendanceData;
  };

  // Data dummy untuk demonstrasi - menggunakan data master dengan division
  const [attendances, setAttendances] = useState<Attendance[]>(generateAttendanceData());

  /**
   * Filter data berdasarkan pencarian, periode, dan divisi
   */
  const filteredData = attendances.filter(item => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeNIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.division.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeriod = item.month === selectedMonth && item.year === selectedYear;

    const matchesDivision = selectedDivision === "all" || item.division === selectedDivision;

    return matchesSearch && matchesPeriod && matchesDivision;
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
  const handleSave = () => {
    // Validasi
    if (!formData.employeeId || !formData.date) {
      alert("Karyawan dan tanggal wajib diisi!");
      return;
    }

    const dateObj = new Date(formData.date);
    const month = format(dateObj, "MMMM", { locale: id });
    const year = dateObj.getFullYear();

    if (editingItem) {
      // Update existing
      setAttendances(attendances.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              month,
              year,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : item
      ));
    } else {
      // Create new
      const newItem: Attendance = {
        id: (attendances.length + 1).toString(),
        ...formData,
        month,
        year,
        createdBy: user?.name || "Admin",
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setAttendances([...attendances, newItem]);
    }
    setIsDialogOpen(false);
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = () => {
    if (editingItem) {
      setAttendances(attendances.filter(item => item.id !== editingItem.id));
      setIsDeleteDialogOpen(false);
      setEditingItem(null);
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
      "NIP",
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
      "NIP",
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
                        placeholder="Cari nama, NIP, atau divisi..."
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
                        {MASTER_DIVISIONS.filter(div => div.isActive).map((division) => (
                          <SelectItem key={division.id} value={division.name}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{division.shortname}</Badge>
                              <span>{division.name}</span>
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
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>NIP</TableHead>
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
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Tidak ada data presensi untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((item) => {
                          const statusBadge = getStatusBadge(item.status);
                          const division = MASTER_DIVISIONS.find(d => d.name === item.division);
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
                                      {division.shortname}
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
                        {MASTER_DIVISIONS.filter(div => div.isActive).map((division) => (
                          <SelectItem key={division.id} value={division.name}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{division.shortname}</Badge>
                              <span>{division.name}</span>
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
                        <TableHead>NIP</TableHead>
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
                      {getAttendanceSummary().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Tidak ada data ringkasan untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        getAttendanceSummary().map((summary) => {
                          const division = MASTER_DIVISIONS.find(d => d.name === summary.division);
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
                                      {division.shortname}
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
                      {MASTER_DIVISIONS.filter(div => div.isActive).map((division) => (
                        <SelectItem key={division.id} value={division.name}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{division.shortname}</Badge>
                            <span>{division.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {selectedDivision === "all"
                      ? `Menampilkan ${employees.length} karyawan dari semua divisi`
                      : `Menampilkan ${employees.length} karyawan dari divisi ${selectedDivision}`
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
                    {employees.map((emp) => {
                      const division = MASTER_DIVISIONS.find(d => d.name === emp.division);
                      return (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            {division && (
                              <Badge variant="outline" className="text-xs">
                                {division.shortname}
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
                      <span className="text-muted-foreground">NIP:</span>
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
