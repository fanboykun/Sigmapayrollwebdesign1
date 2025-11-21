/**
 * HolidayMaster.tsx
 * 
 * Komponen untuk mengelola Master Hari Libur dalam sistem payroll.
 * Digunakan untuk mendefinisikan hari libur nasional, cuti bersama,
 * dan hari libur perusahaan yang akan mempengaruhi perhitungan gaji.
 * 
 * Fitur utama:
 * - CRUD master hari libur
 * - Kalender untuk memilih tanggal
 * - Kategori hari libur (Nasional, Cuti Bersama, Perusahaan)
 * - Role-based access control
 * - Validasi data input
 * 
 * @module HolidayMaster
 * @author Sistem ERP Perkebunan Sawit
 */

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  X,
  AlertCircle,
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
import { PermissionGuard } from "./PermissionGuard";
import { DatePicker } from "./ui/date-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useHolidays } from "../hooks/useHolidays";
import { useToast } from "./ui/use-toast";

/**
 * Tipe kategori hari libur (sesuai dengan database enum)
 */
type HolidayCategory = "national" | "religious" | "company";

/**
 * Display labels untuk kategori
 */
const categoryLabels: Record<HolidayCategory, string> = {
  national: "Nasional",
  religious: "Keagamaan",
  company: "Perusahaan",
};

/**
 * Komponen konten HolidayMaster (tanpa wrapper)
 * Digunakan sebagai tab content di WorkingDaysMaster
 */
export function HolidayMasterContent() {
  const { toast } = useToast();
  const { holidays, loading, error, addHoliday, updateHoliday, deleteHoliday } = useHolidays();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOverwriteDialogOpen, setIsOverwriteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);
  const [pendingHolidayData, setPendingHolidayData] = useState<any | null>(null);
  const [existingRecordsInfo, setExistingRecordsInfo] = useState<{
    count: number;
    statuses: string[];
  } | null>(null);

  // State untuk form input
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    type: "national" as HolidayCategory,
    description: "",
    is_paid: true,
  });

  /**
   * Filter data berdasarkan pencarian
   */
  const filteredData = holidays.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoryLabels[item.type as HolidayCategory].toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.date.includes(searchTerm)
  );

  /**
   * Sorting data berdasarkan tanggal
   */
  const sortedData = [...filteredData].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  /**
   * Handle perubahan input form
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Buka dialog untuk tambah data baru
   */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      date: "",
      name: "",
      type: "national",
      description: "",
      is_paid: true,
    });
    setSelectedDate(undefined);
    setIsDialogOpen(true);
  };

  /**
   * Buka dialog untuk edit data
   */
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      name: item.name,
      type: item.type,
      description: item.description || "",
      is_paid: item.is_paid,
    });
    setSelectedDate(new Date(item.date));
    setIsDialogOpen(true);
  };

  /**
   * Simpan data (create/update) menggunakan Supabase
   */
  const handleSave = async (forceOverwrite: boolean = false) => {
    // Validasi
    if (!formData.date || !formData.name) {
      toast({
        title: "Validasi Gagal",
        description: "Tanggal dan nama hari libur wajib diisi!",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingItem) {
        // Update existing
        const { error } = await updateHoliday(editingItem.id, formData);
        if (error) throw new Error(error);

        toast({
          title: "Berhasil",
          description: "Data hari libur berhasil diupdate",
        });
      } else {
        // Create new
        const result = await addHoliday(formData, forceOverwrite);

        // Check if needs confirmation
        if (result.needsConfirmation) {
          setPendingHolidayData(result.pendingHoliday);
          setExistingRecordsInfo({
            count: result.existingCount || 0,
            statuses: result.existingStatuses || []
          });
          setIsOverwriteDialogOpen(true);
          setIsSaving(false);
          return;
        }

        if (result.error) throw new Error(result.error);

        toast({
          title: "Berhasil",
          description: "Data hari libur berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      setFormData({
        date: "",
        name: "",
        type: "national",
        description: "",
        is_paid: true,
      });
      setSelectedDate(undefined);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle konfirmasi untuk menimpa data presensi
   */
  const handleConfirmOverwrite = async () => {
    if (!pendingHolidayData) return;

    setIsSaving(true);
    try {
      const result = await addHoliday(pendingHolidayData, true); // Force overwrite
      if (result.error) throw new Error(result.error);

      toast({
        title: "Berhasil",
        description: "Data hari libur berhasil ditambahkan dan data presensi diperbarui",
      });

      setIsOverwriteDialogOpen(false);
      setIsDialogOpen(false);
      setPendingHolidayData(null);
      setExistingRecordsInfo(null);
      setFormData({
        date: "",
        name: "",
        type: "national",
        description: "",
        is_paid: true,
      });
      setSelectedDate(undefined);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle delete confirmation menggunakan Supabase
   */
  const handleDelete = async () => {
    if (!editingItem) return;

    setIsSaving(true);

    try {
      const { error } = await deleteHoliday(editingItem.id);
      if (error) throw new Error(error);

      toast({
        title: "Berhasil",
        description: "Data hari libur berhasil dihapus",
      });

      setIsDeleteDialogOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
   * Get badge variant berdasarkan kategori
   */
  const getCategoryBadgeVariant = (type: HolidayCategory) => {
    switch (type) {
      case "national":
        return "default";
      case "religious":
        return "secondary";
      case "company":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Card dengan Table */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Hari Libur</CardTitle>
                <CardDescription>
                  Daftar hari libur yang mempengaruhi perhitungan gaji
                </CardDescription>
              </div>
              <PermissionGuard module="holiday_master" action="create">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Hari Libur
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
                  placeholder="Cari nama hari libur, kategori, atau tanggal..."
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Hari Libur</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-center">Dibayar</TableHead>
                    <TableHead>Dibuat Pada</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-muted-foreground">Memuat data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div>{format(new Date(item.date), "dd MMMM yyyy", { locale: id })}</div>
                            <div className="text-muted-foreground text-sm">
                              {format(new Date(item.date), "EEEE", { locale: id })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadgeVariant(item.type as HolidayCategory)}>
                            {categoryLabels[item.type as HolidayCategory]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.description || ""}>
                            {item.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.is_paid ? (
                            <Badge variant="default" className="bg-green-600">Ya</Badge>
                          ) : (
                            <Badge variant="secondary">Tidak</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(item.created_at), "dd MMM yyyy", { locale: id })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionGuard module="holiday_master" action="edit">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard module="holiday_master" action="delete">
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
                {editingItem ? "Edit Hari Libur" : "Tambah Hari Libur"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Perbarui informasi hari libur"
                  : "Tambahkan data hari libur baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Pilih Tanggal dengan Calendar */}
              <div className="grid gap-2">
                <Label>Tanggal Hari Libur *</Label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={handleDateSelect}
                  placeholder="Pilih tanggal hari libur"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 5}
                />
              </div>

              {/* Nama Hari Libur */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Hari Libur *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Contoh: Hari Kemerdekaan RI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kategori */}
                <div className="grid gap-2">
                  <Label htmlFor="type">Kategori *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">Nasional</SelectItem>
                      <SelectItem value="religious">Keagamaan</SelectItem>
                      <SelectItem value="company">Perusahaan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Dibayar */}
                <div className="grid gap-2">
                  <Label htmlFor="is_paid">Status Pembayaran *</Label>
                  <Select
                    value={formData.is_paid ? "true" : "false"}
                    onValueChange={(value) => handleInputChange("is_paid", value === "true")}
                  >
                    <SelectTrigger id="is_paid">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Dibayar</SelectItem>
                      <SelectItem value="false">Tidak Dibayar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Keterangan */}
              <div className="grid gap-2">
                <Label htmlFor="description">Keterangan</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Tambahkan keterangan mengenai hari libur ini..."
                  rows={3}
                />
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p>
                    Hari libur akan mempengaruhi perhitungan hari efektif kerja dalam sistem payroll.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
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
                Apakah Anda yakin ingin menghapus data hari libur ini?
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

        {/* Overwrite Confirmation Dialog */}
        <Dialog open={isOverwriteDialogOpen} onOpenChange={setIsOverwriteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-orange-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Konfirmasi Timpa Data Presensi
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Terdapat <strong>{existingRecordsInfo?.count || 0} data presensi</strong> yang sudah ada pada tanggal ini.
                  </p>
                  {existingRecordsInfo?.statuses && existingRecordsInfo.statuses.length > 0 && (
                    <p className="text-sm">
                      Status presensi: <strong>{existingRecordsInfo.statuses.join(", ")}</strong>
                    </p>
                  )}
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-900">
                    <strong>Peringatan:</strong> Jika Anda melanjutkan, semua data presensi pada tanggal ini akan diganti dengan status "holiday". Data asli tidak dapat dikembalikan.
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOverwriteDialogOpen(false);
                  setPendingHolidayData(null);
                  setExistingRecordsInfo(null);
                }}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmOverwrite}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Ya, Timpa Data"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}

/**
 * Komponen utama HolidayMaster dengan wrapper
 * Untuk digunakan sebagai halaman standalone
 */
export function HolidayMaster() {
  return (
    <PermissionGuard module="holiday_master" action="view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Master Hari Libur
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data hari libur nasional, cuti bersama, dan hari libur perusahaan
          </p>
        </div>

        <HolidayMasterContent />
      </div>
    </PermissionGuard>
  );
}
