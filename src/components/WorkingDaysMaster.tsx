/**
 * WorkingDaysMaster.tsx
 * 
 * Komponen untuk mengelola Master Hari Kerja dalam sistem payroll.
 * Digunakan untuk mendefinisikan jumlah hari kerja efektif per bulan
 * yang akan digunakan dalam perhitungan gaji dan upah karyawan.
 * 
 * Fitur utama:
 * - CRUD master hari kerja per bulan
 * - Kalender untuk memilih periode
 * - Perhitungan otomatis hari efektif
 * - Role-based access control
 * - Validasi data input
 * 
 * @module WorkingDaysMaster
 * @author Sistem ERP Perkebunan Sawit
 */

import { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  X,
  Clock,
  Loader2,
  CalendarDays
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
import { useAuth } from "../contexts/AuthContext";
import { PermissionGuard } from "./PermissionGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  getWorkingDaysInMonth,
  getMonthNumber,
  MONTH_NAMES_ID,
} from "../shared/holidayData";
import { WorkingHours } from "./WorkingHours";
import { HolidayMasterContent } from "./HolidayMaster";
import { useWorkingDays } from "../hooks/useWorkingDays";
import { useHolidays } from "../hooks/useHolidays";
import { toast } from "sonner";

/**
 * Interface untuk data Hari Kerja
 */
interface WorkingDay {
  id: string;
  month: string;
  year: number;
  totalDays: number;
  workingDays: number;
  holidays: number;
  weekends: number;
  effectiveDays: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Komponen utama WorkingDaysMaster
 * Mengelola master hari kerja untuk perhitungan payroll
 */
export function WorkingDaysMaster() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkingDay | null>(null);
  const [saving, setSaving] = useState(false);

  // Supabase hook
  const {
    workingDays: dbWorkingDays,
    loading,
    error,
    addWorkingDay,
    updateWorkingDay,
    deleteWorkingDay,
    fetchWorkingDays,
  } = useWorkingDays();

  // Fetch holidays from database for calculation
  const { holidays: dbHolidays } = useHolidays();

  // State untuk form input
  const [formData, setFormData] = useState({
    month: "",
    year: new Date().getFullYear(),
    totalDays: 0,
    workingDays: 0,
    holidays: 0,
    weekends: 0,
    effectiveDays: 0,
  });

  // Transform database data to UI format
  const workingDays = useMemo(() => {
    return dbWorkingDays.map(wd => {
      const monthName = MONTH_NAMES_ID[(wd.month || 1) - 1];

      // Re-calculate total days and weekends from month/year
      const totalDays = new Date(wd.year, wd.month || 1, 0).getDate();

      // Calculate weekends (Sundays) for this month
      let weekendDaysCount = 0;
      for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(wd.year, (wd.month || 1) - 1, day);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0) { // Sunday
          weekendDaysCount++;
        }
      }

      const workingDaysCount = wd.working_days || 0;
      const holidayDaysCount = wd.holidays || 0;
      const effectiveDays = workingDaysCount - holidayDaysCount;

      return {
        id: wd.id,
        month: monthName,
        year: wd.year,
        totalDays,
        workingDays: workingDaysCount,
        holidays: holidayDaysCount,
        weekends: weekendDaysCount,
        effectiveDays,
        createdBy: "System",
        createdAt: wd.created_at || "",
        updatedAt: wd.updated_at || "",
      } as WorkingDay;
    });
  }, [dbWorkingDays]);

  /**
   * Filter data berdasarkan pencarian
   */
  const filteredData = workingDays.filter(item =>
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  );


  /**
   * Buka dialog untuk tambah data baru
   */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      month: "",
      year: new Date().getFullYear(),
      totalDays: 0,
      workingDays: 0,
      holidays: 0,
      weekends: 0,
      effectiveDays: 0,
    });
    setIsDialogOpen(true);
  };

  /**
   * Buka dialog untuk edit data
   */
  const handleEdit = (item: WorkingDay) => {
    setEditingItem(item);
    setFormData({
      month: item.month,
      year: item.year,
      totalDays: item.totalDays,
      workingDays: item.workingDays,
      holidays: item.holidays,
      weekends: item.weekends,
      effectiveDays: item.effectiveDays,
    });
    setIsDialogOpen(true);
  };

  /**
   * Simpan data (create/update)
   */
  const handleSave = async () => {
    // Validate
    if (!formData.month || !formData.year) {
      toast.error("Bulan dan tahun wajib diisi!");
      return;
    }

    try {
      setSaving(true);

      // Convert month name to number
      const monthNumber = MONTH_NAMES_ID.indexOf(formData.month) + 1;
      if (monthNumber === 0) {
        toast.error("Bulan tidak valid!");
        return;
      }

      // Check for duplicate (only when creating new, not when editing)
      if (!editingItem) {
        const isDuplicate = dbWorkingDays.some(
          wd => wd.year === formData.year && wd.month === monthNumber
        );

        if (isDuplicate) {
          toast.error(`Data untuk ${formData.month} ${formData.year} sudah ada! Hapus data lama terlebih dahulu jika ingin menambahkan data baru.`);
          setSaving(false);
          return;
        }
      }

      // Prepare data for Supabase
      // Only save columns that exist in database schema
      const dataToSave = {
        year: formData.year,
        month: monthNumber,
        working_days: formData.workingDays,  // Hari kerja (Total - Weekend)
        holidays: formData.holidays,          // Hari libur nasional
        description: `Total: ${formData.totalDays} hari, Weekend: ${formData.weekends} hari, Efektif: ${formData.effectiveDays} hari`,
      };

      if (editingItem) {
        // Update existing
        const { error } = await updateWorkingDay(editingItem.id, dataToSave);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Data hari kerja berhasil diperbarui");
          await fetchWorkingDays(); // Refresh data
          setIsDialogOpen(false);
        }
      } else {
        // Create new
        const { error } = await addWorkingDay(dataToSave);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Data hari kerja berhasil ditambahkan");
          await fetchWorkingDays(); // Refresh data
          setIsDialogOpen(false);
        }
      }
    } catch (err: any) {
      console.error("Error saving working day:", err);
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      const { error } = await deleteWorkingDay(editingItem.id);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Data hari kerja berhasil dihapus");
        await fetchWorkingDays(); // Refresh data
        setIsDeleteDialogOpen(false);
        setEditingItem(null);
      }
    } catch (err: any) {
      console.error("Error deleting working day:", err);
      toast.error("Gagal menghapus data");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle pemilihan bulan dan tahun
   * Kalkulasi otomatis semua field berdasarkan bulan yang dipilih
   */
  const calculateWorkingDays = (monthName: string, year: number) => {
    if (!monthName) return;

    const monthIndex = MONTH_NAMES_ID.indexOf(monthName);
    if (monthIndex === -1) return;

    const month = monthIndex + 1; // 1-12

    // 1. Hitung total hari dalam bulan
    const totalDays = new Date(year, month, 0).getDate();

    // 2. Hitung weekend dalam bulan (hanya Minggu, Sabtu tetap kerja)
    let weekends = 0;
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0) { // Hanya Minggu
        weekends++;
      }
    }

    // 3. Hitung hari libur dari database (excluding Minggu)
    const holidaysInMonth = (dbHolidays || []).filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const holidayMonth = holidayDate.getMonth() + 1;
      const holidayYear = holidayDate.getFullYear();
      const dayOfWeek = holidayDate.getDay();
      // Hanya hitung libur yang bukan Minggu dan sesuai bulan/tahun
      return holidayMonth === month && holidayYear === year && dayOfWeek !== 0;
    }).length;

    // 4. Hitung hari kerja = Total hari - Weekend
    const workingDays = totalDays - weekends;

    // 5. Hitung hari efektif = Hari kerja - Hari libur
    const effectiveDays = workingDays - holidaysInMonth;

    // Update form data dengan semua nilai yang sudah dikalkulasi
    setFormData({
      month: monthName,
      year: year,
      totalDays: totalDays,
      workingDays: workingDays,
      holidays: holidaysInMonth,
      weekends: weekends,
      effectiveDays: effectiveDays,
    });
  };

  // Hitung total statistik tahunan
  const yearlyStats = {
    totalWorkingDays: workingDays.reduce((sum, item) => sum + item.workingDays, 0),
    totalHolidays: workingDays.reduce((sum, item) => sum + item.holidays, 0),
    totalWeekends: workingDays.reduce((sum, item) => sum + item.weekends, 0),
    totalEffectiveDays: workingDays.reduce((sum, item) => sum + item.effectiveDays, 0),
  };

  return (
    <PermissionGuard module="working_days_master" action="view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Master Hari Kerja
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data hari kerja efektif per bulan untuk perhitungan gaji karyawan
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="hari-kerja" className="w-full">
          <TabsList>
            <TabsTrigger value="hari-kerja">
              <Calendar className="h-4 w-4" />
              Hari Kerja
            </TabsTrigger>
            <TabsTrigger value="hari-libur">
              <CalendarDays className="h-4 w-4" />
              Hari Libur
            </TabsTrigger>
            <TabsTrigger value="jam-kerja">
              <Clock className="h-4 w-4" />
              Jam Kerja
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Hari Kerja */}
          <TabsContent value="hari-kerja" className="space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <X className="h-5 w-5" />
                <p className="font-medium">Terjadi kesalahan: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Hari Kerja</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{yearlyStats.totalWorkingDays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Tahun 2025 (excl. weekend)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Hari Efektif</CardDescription>
              <CardTitle className="text-3xl text-green-600">{yearlyStats.totalEffectiveDays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Tahun 2025 (untuk payroll)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Hari Libur</CardDescription>
              <CardTitle className="text-3xl text-red-600">{yearlyStats.totalHolidays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Libur nasional & perusahaan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Weekend</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{yearlyStats.totalWeekends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Minggu
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card dengan Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Hari Kerja</CardTitle>
                <CardDescription>
                  Daftar hari kerja efektif setiap bulan
                </CardDescription>
              </div>
              <PermissionGuard module="working_days_master" action="create">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Hari Kerja
                </Button>
              </PermissionGuard>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari bulan atau tahun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-center">Total Hari</TableHead>
                    <TableHead className="text-center">Hari Kerja</TableHead>
                    <TableHead className="text-center">Hari Libur</TableHead>
                    <TableHead className="text-center">Weekend</TableHead>
                    <TableHead className="text-center">Hari Efektif</TableHead>
                    <TableHead className="text-center">Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Memuat data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div>{item.month} {item.year}</div>
                            <div className="text-muted-foreground text-sm">
                              Update: {item.updatedAt}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.totalDays}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.workingDays}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive">{item.holidays}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{item.weekends}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-green-600">
                            {item.effectiveDays}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionGuard module="working_days_master" action="edit">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard module="working_days_master" action="delete">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Hari Kerja" : "Tambah Hari Kerja"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Perbarui informasi hari kerja"
                  : "Pilih bulan, dan sistem akan menghitung hari kerja secara otomatis"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Pilih Bulan dan Tahun */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-base font-semibold">Bulan *</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value: string) => calculateWorkingDays(value, formData.year)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES_ID.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-base font-semibold">Tahun *</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value: string) => {
                      const year = parseInt(value);
                      if (formData.month) {
                        calculateWorkingDays(formData.month, year);
                      } else {
                        setFormData({ ...formData, year });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hasil Kalkulasi Otomatis */}
              {formData.month && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span> Hasil Kalkulasi Otomatis
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Total Hari */}
                    <div className="p-3 bg-white rounded border">
                      <Label className="text-xs text-muted-foreground">Total Hari</Label>
                      <div className="text-2xl font-bold text-gray-700">{formData.totalDays}</div>
                      <p className="text-xs text-muted-foreground mt-1">Hari dalam bulan</p>
                    </div>

                    {/* Weekend */}
                    <div className="p-3 bg-white rounded border">
                      <Label className="text-xs text-muted-foreground">Weekend</Label>
                      <div className="text-2xl font-bold text-gray-700">{formData.weekends}</div>
                      <p className="text-xs text-muted-foreground mt-1">Minggu</p>
                    </div>

                    {/* Hari Kerja */}
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <Label className="text-xs text-blue-700">Hari Kerja</Label>
                      <div className="text-2xl font-bold text-blue-700">{formData.workingDays}</div>
                      <p className="text-xs text-blue-600 mt-1">Total - Weekend</p>
                    </div>

                    {/* Hari Libur */}
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <Label className="text-xs text-red-700">Hari Libur</Label>
                      <div className="text-2xl font-bold text-red-700">{formData.holidays}</div>
                      <p className="text-xs text-red-600 mt-1">Libur nasional</p>
                    </div>
                  </div>

                  {/* Hari Efektif - Highlighted */}
                  <div className="mt-3 p-4 bg-green-600 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white/80 text-xs">HARI EFEKTIF (untuk Payroll)</Label>
                        <div className="text-3xl font-bold mt-1">{formData.effectiveDays} Hari</div>
                        <p className="text-white/80 text-xs mt-1">= Hari Kerja - Hari Libur</p>
                      </div>
                      <Badge variant="secondary" className="bg-white text-green-700 text-base px-4 py-2">
                        Final
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.month || !formData.year}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
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
                Apakah Anda yakin ingin menghapus data hari kerja ini?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </TabsContent>

          {/* Tab Content: Hari Libur */}
          <TabsContent value="hari-libur" className="space-y-6">
            <HolidayMasterContent />
          </TabsContent>

          {/* Tab Content: Jam Kerja */}
          <TabsContent value="jam-kerja" className="space-y-6">
            <WorkingHours />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
