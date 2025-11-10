/**
 * ==========================================================================
 * CLINIC MODULE - MASTER DATA DOKTER
 * ==========================================================================
 *
 * Komponen untuk mengelola master data dokter di klinik.
 * Fitur: CRUD, search, filter by specialization, schedule management
 *
 * #ClinicModule #MasterData #Doctors
 *
 * @author Sigma Development Team
 * @version 1.0.0
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
  Stethoscope,
  AlertCircle,
  Calendar,
  UserCheck,
  Clock,
  Phone,
  Mail,
  FileText,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// TypeScript interfaces
interface Doctor {
  id: string;
  user_id: string | null;
  employee_id: string | null;
  doctor_code: string;
  full_name: string;
  str_number: string;
  sip_number: string | null;
  specialization: string;
  phone: string | null;
  email: string | null;
  schedule: DoctorSchedule | null;
  is_active: boolean;
  is_external: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DoctorSchedule {
  monday?: { start: string; end: string };
  tuesday?: { start: string; end: string };
  wednesday?: { start: string; end: string };
  thursday?: { start: string; end: string };
  friday?: { start: string; end: string };
  saturday?: { start: string; end: string };
  sunday?: { start: string; end: string };
}

interface DoctorFormData {
  doctor_code: string;
  full_name: string;
  str_number: string;
  sip_number: string;
  specialization: string;
  phone: string;
  email: string;
  schedule: DoctorSchedule;
  is_active: boolean;
  is_external: boolean;
  notes: string;
}

const SPECIALIZATIONS = [
  'Dokter Umum',
  'Dokter Gigi',
  'Spesialis Penyakit Dalam',
  'Spesialis Anak',
  'Spesialis Bedah',
  'Spesialis Kandungan',
  'Spesialis Kulit dan Kelamin',
  'Spesialis THT',
  'Spesialis Mata',
  'Spesialis Saraf',
  'Spesialis Jantung',
  'Spesialis Paru',
  'Spesialis Jiwa',
  'Spesialis Radiologi',
];

const DAYS = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' },
];

export function ClinicDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<DoctorFormData>({
    doctor_code: '',
    full_name: '',
    str_number: '',
    sip_number: '',
    specialization: 'Dokter Umum',
    phone: '',
    email: '',
    schedule: {},
    is_active: true,
    is_external: false,
    notes: '',
  });

  // Schedule editing state
  const [scheduleEditing, setScheduleEditing] = useState<{[key: string]: boolean}>({});

  // Load doctors
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('clinic_doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
      toast.error('Gagal memuat data dokter');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.doctor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.str_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization = selectedSpecialization === 'all' ||
                                  doctor.specialization === selectedSpecialization;

    return matchesSearch && matchesSpecialization;
  });

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (!formData.doctor_code || !formData.full_name || !formData.str_number || !formData.specialization) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      if (selectedDoctor) {
        // Update existing doctor
        const { error } = await supabase
          .from('clinic_doctors')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedDoctor.id);

        if (error) throw error;
        toast.success('Data dokter berhasil diperbarui');
      } else {
        // Create new doctor
        const { error } = await supabase
          .from('clinic_doctors')
          .insert([formData]);

        if (error) throw error;
        toast.success('Data dokter berhasil ditambahkan');
      }

      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
      loadDoctors();
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      if (error.code === '23505') {
        toast.error('Kode dokter, STR, atau SIP sudah digunakan');
      } else {
        toast.error('Gagal menyimpan data dokter');
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDoctor) return;

    try {
      const { error } = await supabase
        .from('clinic_doctors')
        .delete()
        .eq('id', selectedDoctor.id);

      if (error) throw error;

      toast.success('Data dokter berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
      loadDoctors();
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast.error('Gagal menghapus data dokter');
    }
  };

  // Open edit dialog
  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      doctor_code: doctor.doctor_code,
      full_name: doctor.full_name,
      str_number: doctor.str_number,
      sip_number: doctor.sip_number || '',
      specialization: doctor.specialization,
      phone: doctor.phone || '',
      email: doctor.email || '',
      schedule: doctor.schedule || {},
      is_active: doctor.is_active,
      is_external: doctor.is_external,
      notes: doctor.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      doctor_code: '',
      full_name: '',
      str_number: '',
      sip_number: '',
      specialization: 'Dokter Umum',
      phone: '',
      email: '',
      schedule: {},
      is_active: true,
      is_external: false,
      notes: '',
    });
    setSelectedDoctor(null);
    setScheduleEditing({});
  };

  // Toggle schedule day
  const toggleScheduleDay = (day: string) => {
    const newSchedule = { ...formData.schedule };
    if (newSchedule[day as keyof DoctorSchedule]) {
      delete newSchedule[day as keyof DoctorSchedule];
    } else {
      newSchedule[day as keyof DoctorSchedule] = { start: '08:00', end: '16:00' };
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Update schedule time
  const updateScheduleTime = (day: string, type: 'start' | 'end', value: string) => {
    const newSchedule = { ...formData.schedule };
    if (newSchedule[day as keyof DoctorSchedule]) {
      newSchedule[day as keyof DoctorSchedule] = {
        ...newSchedule[day as keyof DoctorSchedule]!,
        [type]: value,
      };
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Format schedule for display
  const formatSchedule = (schedule: DoctorSchedule | null) => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return 'Tidak ada jadwal';
    }

    const days = Object.keys(schedule);
    const dayNames = days.map(day => {
      const dayObj = DAYS.find(d => d.key === day);
      return dayObj ? dayObj.label : day;
    });

    return dayNames.join(', ');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Master Data Dokter</h1>
              <p className="text-sm text-gray-500">Kelola data dokter yang bertugas di klinik</p>
            </div>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Dokter
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
                placeholder="Cari nama dokter, kode, atau STR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Semua Spesialisasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Spesialisasi</SelectItem>
              {SPECIALIZATIONS.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Memuat data...</div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Tidak ada data dokter</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.full_name}</h3>
                      <p className="text-sm text-gray-500">{doctor.doctor_code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {doctor.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                    {doctor.is_external && (
                      <Badge variant="outline" className="ml-1">Eksternal</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">STR: {doctor.str_number}</p>
                      {doctor.sip_number && (
                        <p className="text-xs text-gray-500">SIP: {doctor.sip_number}</p>
                      )}
                    </div>
                  </div>

                  {doctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 truncate">{doctor.phone}</p>
                    </div>
                  )}

                  {doctor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 truncate">{doctor.email}</p>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">{formatSchedule(doctor.schedule)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(doctor)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteDialog(doctor)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDoctor ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctor ? 'Perbarui informasi dokter' : 'Masukkan data dokter baru'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informasi Dasar</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor_code">
                    Kode Dokter <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="doctor_code"
                    value={formData.doctor_code}
                    onChange={(e) => setFormData({ ...formData, doctor_code: e.target.value })}
                    placeholder="DOC001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">
                    Spesialisasi <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                    <SelectTrigger id="specialization">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="dr. Nama Dokter, Sp.XX"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="str_number">
                    Nomor STR <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="str_number"
                    value={formData.str_number}
                    onChange={(e) => setFormData({ ...formData, str_number: e.target.value })}
                    placeholder="STR-xxxxxxxxxxxxx"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sip_number">Nomor SIP</Label>
                  <Input
                    id="sip_number"
                    value={formData.sip_number}
                    onChange={(e) => setFormData({ ...formData, sip_number: e.target.value })}
                    placeholder="SIP-xxx/xxxx"
                  />
                </div>
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
                    placeholder="dokter@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Jadwal Praktik
              </h3>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {DAYS.map(day => (
                  <div key={day.key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                      <input
                        type="checkbox"
                        checked={!!formData.schedule[day.key as keyof DoctorSchedule]}
                        onChange={() => toggleScheduleDay(day.key)}
                        className="rounded border-gray-300"
                      />
                      <Label className="cursor-pointer">{day.label}</Label>
                    </div>

                    {formData.schedule[day.key as keyof DoctorSchedule] && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={formData.schedule[day.key as keyof DoctorSchedule]?.start || ''}
                          onChange={(e) => updateScheduleTime(day.key, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="time"
                          value={formData.schedule[day.key as keyof DoctorSchedule]?.end || ''}
                          onChange={(e) => updateScheduleTime(day.key, 'end', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Status & Catatan</h3>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Dokter Aktif
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_external"
                    checked={formData.is_external}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_external: checked })}
                  />
                  <Label htmlFor="is_external" className="cursor-pointer">
                    Dokter Eksternal
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan tentang dokter..."
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
              <Button type="submit">
                {selectedDoctor ? 'Simpan Perubahan' : 'Tambah Dokter'}
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
              Apakah Anda yakin ingin menghapus data dokter <strong>{selectedDoctor?.full_name}</strong>?
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
