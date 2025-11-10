/**
 * ==========================================================================
 * CLINIC MODULE - MASTER DATA PERAWAT
 * ==========================================================================
 *
 * Komponen untuk mengelola master data perawat di klinik.
 * Terintegrasi dengan data karyawan PT. Socfindo dengan jabatan Perawat.
 * Auto-fill: NIK, Nama, Phone, Email, Divisi dari data karyawan
 *
 * #ClinicModule #MasterData #Nurses #EmployeeIntegration
 *
 * @author Sigma Development Team
 * @version 2.0.0
 * @since 2025-11-10
 * ==========================================================================
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Heart,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Briefcase,
  Building2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// TypeScript interfaces
interface Division {
  id: string;
  nama_divisi: string;
  kode_divisi: string;
}

interface Employee {
  id: string;
  employee_id: string; // NIK
  full_name: string;
  email: string | null;
  phone: string | null;
  position_id: string;
  division_id: string;
  division?: Division;
}

interface Nurse {
  id: string;
  user_id: string | null;
  employee_id: string;
  nurse_code: string; // Will use employee NIK
  full_name: string;
  str_number: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    employee_id: string;
    division?: Division;
  };
}

interface NurseFormData {
  employee_id: string;
  nurse_code: string; // NIK karyawan
  full_name: string;
  str_number: string;
  phone: string;
  email: string;
  division_name: string; // Read-only display
  is_active: boolean;
  notes: string;
}

export function ClinicNurses() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nursePositionId, setNursePositionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<NurseFormData>({
    employee_id: '',
    nurse_code: '',
    full_name: '',
    str_number: '',
    phone: '',
    email: '',
    division_name: '',
    is_active: true,
    notes: '',
  });

  // Load position ID for "Perawat" and data
  useEffect(() => {
    loadNursePosition();
    loadNurses();
  }, []);

  // Load employees when position is found
  useEffect(() => {
    if (nursePositionId) {
      loadEmployees();
    }
  }, [nursePositionId]);

  const loadNursePosition = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('id')
        .eq('code', 'P4') // Perawat
        .single();

      if (error) throw error;
      setNursePositionId(data.id);
    } catch (error: any) {
      console.error('Error loading nurse position:', error);
      toast.error('Gagal memuat data jabatan perawat');
    }
  };

  const loadEmployees = async () => {
    if (!nursePositionId) return;

    try {
      // Load employees with their divisions
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          full_name,
          email,
          phone,
          position_id,
          division_id
        `)
        .eq('position_id', nursePositionId)
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;

      // Load divisions for these employees
      const divisionIds = [...new Set(data?.map(e => e.division_id).filter(Boolean))];

      if (divisionIds.length > 0) {
        const { data: divisionsData, error: divError } = await supabase
          .from('divisions')
          .select('id, nama_divisi, kode_divisi')
          .in('id', divisionIds);

        if (divError) throw divError;

        // Map divisions to employees
        const employeesWithDivisions = data?.map(emp => ({
          ...emp,
          division: divisionsData?.find(div => div.id === emp.division_id)
        }));

        setEmployees(employeesWithDivisions || []);
      } else {
        setEmployees(data || []);
      }
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error('Gagal memuat data karyawan');
    }
  };

  const loadNurses = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('clinic_nurses')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load related employee and division data
      if (data && data.length > 0) {
        const employeeIds = data.map(n => n.employee_id);

        const { data: employeesData, error: empError } = await supabase
          .from('employees')
          .select('id, employee_id, division_id')
          .in('id', employeeIds);

        if (empError) throw empError;

        // Load divisions
        const divisionIds = [...new Set(employeesData?.map(e => e.division_id).filter(Boolean))];

        let divisionsData: Division[] = [];
        if (divisionIds.length > 0) {
          const { data: divData, error: divError } = await supabase
            .from('divisions')
            .select('id, nama_divisi, kode_divisi')
            .in('id', divisionIds);

          if (!divError) {
            divisionsData = divData || [];
          }
        }

        // Combine data
        const nursesWithData = data.map(nurse => {
          const employee = employeesData?.find(e => e.id === nurse.employee_id);
          const division = employee ? divisionsData.find(d => d.id === employee.division_id) : null;

          return {
            ...nurse,
            employee: employee ? {
              employee_id: employee.employee_id,
              division: division
            } : undefined
          };
        });

        setNurses(nursesWithData);
      } else {
        setNurses(data || []);
      }
    } catch (error: any) {
      console.error('Error loading nurses:', error);
      toast.error('Gagal memuat data perawat');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter nurses
  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = nurse.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nurse.nurse_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (nurse.str_number && nurse.str_number.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Auto-fill form when employee is selected
  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        ...formData,
        employee_id: employee.id,
        nurse_code: employee.employee_id, // Use NIK as nurse_code
        full_name: employee.full_name,
        phone: employee.phone || '',
        email: employee.email || '',
        division_name: employee.division?.nama_divisi || 'Tidak ada divisi',
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (!formData.employee_id || !formData.nurse_code || !formData.full_name) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      const dataToSave = {
        employee_id: formData.employee_id,
        nurse_code: formData.nurse_code,
        full_name: formData.full_name,
        str_number: formData.str_number || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_active: formData.is_active,
        notes: formData.notes || null,
      };

      if (selectedNurse) {
        // Update existing nurse
        const { error } = await supabase
          .from('clinic_nurses')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedNurse.id);

        if (error) throw error;
        toast.success('Data perawat berhasil diperbarui');
      } else {
        // Create new nurse
        const { error } = await supabase
          .from('clinic_nurses')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Data perawat berhasil ditambahkan');
      }

      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
      loadNurses();
    } catch (error: any) {
      console.error('Error saving nurse:', error);
      if (error.code === '23505') {
        toast.error('Karyawan ini sudah terdaftar sebagai perawat');
      } else if (error.code === '23503') {
        toast.error('Data karyawan tidak valid');
      } else {
        toast.error('Gagal menyimpan data perawat: ' + error.message);
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedNurse) return;

    try {
      const { error } = await supabase
        .from('clinic_nurses')
        .delete()
        .eq('id', selectedNurse.id);

      if (error) throw error;

      toast.success('Data perawat berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedNurse(null);
      loadNurses();
    } catch (error: any) {
      console.error('Error deleting nurse:', error);
      toast.error('Gagal menghapus data perawat');
    }
  };

  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (nurse: Nurse) => {
    setSelectedNurse(nurse);

    // Find employee
    const employee = employees.find(e => e.id === nurse.employee_id);

    setFormData({
      employee_id: nurse.employee_id,
      nurse_code: nurse.nurse_code,
      full_name: nurse.full_name,
      str_number: nurse.str_number || '',
      phone: nurse.phone || '',
      email: nurse.email || '',
      division_name: nurse.employee?.division?.nama_divisi || 'Tidak ada divisi',
      is_active: nurse.is_active,
      notes: nurse.notes || '',
    });

    if (employee) {
      setSelectedEmployee(employee);
    }

    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_id: '',
      nurse_code: '',
      full_name: '',
      str_number: '',
      phone: '',
      email: '',
      division_name: '',
      is_active: true,
      notes: '',
    });
    setSelectedNurse(null);
    setSelectedEmployee(null);
  };

  // Get available employees (not already registered as nurses)
  const getAvailableEmployees = () => {
    const registeredEmployeeIds = nurses.map(n => n.employee_id);
    return employees.filter(e =>
      !registeredEmployeeIds.includes(e.id) ||
      (selectedNurse && e.id === selectedNurse.employee_id)
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Master Data Perawat</h1>
              <p className="text-sm text-gray-500">Kelola data perawat yang bertugas di klinik</p>
            </div>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Perawat
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama perawat, NIK, atau STR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Memuat data...</div>
          </div>
        ) : filteredNurses.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Tidak ada data perawat</p>
              {searchQuery && <p className="text-sm mt-2">Tidak ditemukan hasil untuk "{searchQuery}"</p>}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNurses.map((nurse) => (
              <Card key={nurse.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{nurse.full_name}</h3>
                      <p className="text-sm text-gray-500">{nurse.nurse_code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {nurse.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {nurse.employee?.employee_id && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">NIK: {nurse.employee.employee_id}</p>
                    </div>
                  )}

                  {nurse.employee?.division && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{nurse.employee.division.nama_divisi}</p>
                    </div>
                  )}

                  {nurse.str_number && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">STR: {nurse.str_number}</p>
                      </div>
                    </div>
                  )}

                  {nurse.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 truncate">{nurse.phone}</p>
                    </div>
                  )}

                  {nurse.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 truncate">{nurse.email}</p>
                    </div>
                  )}

                  {nurse.notes && (
                    <div className="flex items-start gap-2">
                      <UserCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">{nurse.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(nurse)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteDialog(nurse)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNurse ? 'Edit Data Perawat' : 'Tambah Perawat Baru'}
            </DialogTitle>
            <DialogDescription>
              {selectedNurse ? 'Perbarui informasi perawat' : 'Pilih karyawan dengan jabatan Perawat dari data kepegawaian'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            {!selectedNurse && (
              <div className="space-y-2">
                <Label htmlFor="employee_id">
                  Pilih Karyawan (Jabatan: Perawat) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={handleEmployeeSelect}
                  disabled={isEditDialogOpen}
                >
                  <SelectTrigger id="employee_id">
                    <SelectValue placeholder="Pilih karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEmployees().map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_id} {emp.division && `(${emp.division.kode_divisi})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAvailableEmployees().length === 0 && (
                  <p className="text-sm text-amber-600">
                    Semua karyawan dengan jabatan Perawat sudah terdaftar
                  </p>
                )}
              </div>
            )}

            {/* Basic Information - Auto-filled */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informasi Perawat (Auto-fill dari Data Karyawan)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nurse_code">
                    Nomor ID Karyawan (NIK) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nurse_code"
                    value={formData.nurse_code}
                    placeholder="EMP-XX-0000"
                    required
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    placeholder="Nama perawat"
                    required
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division_name">
                  Divisi (Estate)
                </Label>
                <Input
                  id="division_name"
                  value={formData.division_name}
                  placeholder="Nama divisi"
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="perawat@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="str_number">Nomor STR (Opsional)</Label>
                <Input
                  id="str_number"
                  value={formData.str_number}
                  onChange={(e) => setFormData({ ...formData, str_number: e.target.value })}
                  placeholder="STR-xxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500">Nomor Surat Tanda Registrasi Perawat (tidak wajib diisi)</p>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Status & Catatan</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Perawat Aktif
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tentang shift, tanggung jawab, atau informasi lainnya..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!formData.employee_id || !formData.nurse_code}>
                {selectedNurse ? 'Simpan Perubahan' : 'Tambah Perawat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data perawat <strong>{selectedNurse?.full_name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
