/**
 * EmployeeTransferForm.tsx
 * Form untuk menambah mutasi karyawan baru dengan employee search combobox
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DatePicker } from './ui/date-picker';
import { ChevronsUpDown, Check, User, Briefcase } from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  division_id: string | null;
  position_id: string | null;
  employment_type: string;
  status: string;
  division?: {
    id: string;
    nama_divisi: string;  // Indonesian column name
    kode_divisi: string;  // Indonesian column name
  };
  position?: {
    id: string;
    name: string;
    code: string;
  };
}

interface Division {
  id: string;
  nama_divisi: string;
  kode_divisi: string;
}

interface Position {
  id: string;
  name: string;
  code: string;
  level: string;
}

interface EmployeeTransferFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeTransferForm({ onSubmit, onCancel }: EmployeeTransferFormProps) {
  // State untuk employee combobox
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // State untuk division combobox
  const [openDivisionCombobox, setOpenDivisionCombobox] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);

  // State untuk position combobox
  const [openPositionCombobox, setOpenPositionCombobox] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // Form state
  const [transferDate, setTransferDate] = useState<Date | undefined>();
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>();

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);

        // Fetch employees with division relation (works!)
        const { data: employeesData, error: empError } = await supabase
          .from('employees')
          .select(`
            id,
            employee_id,
            full_name,
            division_id,
            position_id,
            employment_type,
            status,
            division:division_id(id, nama_divisi, kode_divisi)
          `)
          .eq('status', 'active')
          .order('full_name', { ascending: true });

        if (empError) throw empError;

        if (employeesData && employeesData.length > 0) {
          // Get unique position IDs
          const positionIds = [...new Set(employeesData.map(e => e.position_id).filter(Boolean))] as string[];

          // Fetch positions separately
          const { data: positionsData, error: posError } = await supabase
            .from('positions')
            .select('id, name, code')
            .in('id', positionIds);

          if (posError) throw posError;

          // Manually join positions with employees
          const enrichedEmployees = employeesData.map(emp => ({
            ...emp,
            position: positionsData?.find(pos => pos.id === emp.position_id) || null
          }));

          setEmployees(enrichedEmployees);
        } else {
          setEmployees([]);
        }
      } catch (error: any) {
        console.error('Error fetching employees:', error);
        toast.error('Gagal memuat data karyawan', {
          description: error.message
        });
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch divisions from Supabase
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoadingDivisions(true);
        const { data, error } = await supabase
          .from('divisions')
          .select('id, nama_divisi, kode_divisi')
          .order('nama_divisi', { ascending: true });

        if (error) throw error;
        setDivisions(data || []);
      } catch (error: any) {
        console.error('Error fetching divisions:', error);
        toast.error('Gagal memuat data divisi', {
          description: error.message
        });
      } finally {
        setLoadingDivisions(false);
      }
    };

    fetchDivisions();
  }, []);

  // Fetch positions from Supabase
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoadingPositions(true);
        const { data, error } = await supabase
          .from('positions')
          .select('id, name, code, level')
          .order('name', { ascending: true });

        if (error) throw error;
        setPositions(data || []);
      } catch (error: any) {
        console.error('Error fetching positions:', error);
        toast.error('Gagal memuat data jabatan', {
          description: error.message
        });
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // Get selected employee data
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedDivision = divisions.find(div => div.id === selectedDivisionId);
  const selectedPosition = positions.find(pos => pos.id === selectedPositionId);

  const handleSubmit = () => {
    // Validasi karyawan
    if (!selectedEmployee) {
      toast.error('Validasi Gagal', {
        description: 'Pilih karyawan terlebih dahulu'
      });
      return;
    }

    // Validasi divisi baru
    if (!selectedDivisionId) {
      toast.error('Validasi Gagal', {
        description: 'Pilih divisi baru terlebih dahulu'
      });
      return;
    }

    // Validasi jabatan baru
    if (!selectedPositionId) {
      toast.error('Validasi Gagal', {
        description: 'Pilih jabatan baru terlebih dahulu'
      });
      return;
    }

    // Validasi tanggal pengajuan
    if (!transferDate) {
      toast.error('Validasi Gagal', {
        description: 'Pilih tanggal pengajuan terlebih dahulu'
      });
      return;
    }

    // Validasi tanggal efektif
    if (!effectiveDate) {
      toast.error('Validasi Gagal', {
        description: 'Pilih tanggal efektif terlebih dahulu'
      });
      return;
    }

    // Validasi minimal ada perubahan (divisi atau jabatan atau keduanya)
    if (selectedEmployee.division_id === selectedDivisionId &&
        selectedEmployee.position_id === selectedPositionId) {
      toast.error('Validasi Gagal', {
        description: 'Tidak ada perubahan divisi atau jabatan. Minimal salah satu harus berbeda.'
      });
      return;
    }

    const submitData = {
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.full_name,
      fromDivision: selectedEmployee.division_id,
      fromPosition: selectedEmployee.position_id,
      toDepartment: selectedDivisionId,
      toPosition: selectedPositionId,
      transferDate,
      effectiveDate,
      reason: (document.getElementById('reason') as HTMLTextAreaElement)?.value || '',
      notes: (document.getElementById('notes') as HTMLTextAreaElement)?.value || '',
    };

    // Validasi alasan mutasi
    if (!submitData.reason.trim()) {
      toast.error('Validasi Gagal', {
        description: 'Masukkan alasan mutasi terlebih dahulu'
      });
      return;
    }

    onSubmit(submitData);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Info:</strong> Pilih karyawan dari database, kemudian isi data divisi/jabatan baru untuk mutasi. Anda dapat melakukan mutasi jabatan saja, mutasi divisi saja, atau keduanya secara bersamaan.
        </p>
      </div>

      {/* Employee Search Combobox */}
      <div className="space-y-2">
        <Label>Pilih Karyawan *</Label>
        <Popover open={openEmployeeCombobox} onOpenChange={setOpenEmployeeCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openEmployeeCombobox}
              className="w-full justify-between"
              disabled={loadingEmployees}
            >
              {selectedEmployee ? (
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{selectedEmployee.full_name} ({selectedEmployee.employee_id})</span>
                </div>
              ) : loadingEmployees ? (
                "Memuat data karyawan..."
              ) : (
                "Cari dan pilih karyawan..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Cari nama atau NIK karyawan..." />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={`${employee.full_name} ${employee.employee_id}`}
                      onSelect={() => {
                        setSelectedEmployeeId(employee.id);
                        setOpenEmployeeCombobox(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{employee.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {employee.employee_id} • {employee.division?.nama_divisi || 'N/A'} • {employee.position?.name || 'N/A'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Display Current Employee Info */}
      {selectedEmployee && (
        <div className="border-t pt-4">
          <h4 className="mb-3 text-sm">Data Karyawan Saat Ini</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <div>
              <p className="text-xs text-muted-foreground mb-1">NIK</p>
              <p className="mb-0">{selectedEmployee.employee_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nama Lengkap</p>
              <p className="mb-0">{selectedEmployee.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Divisi Saat Ini</p>
              <p className="mb-0">{selectedEmployee.division?.nama_divisi || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Jabatan Saat Ini</p>
              <p className="mb-0">{selectedEmployee.position?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Jenis Kepegawaian</p>
              <p className="mb-0">
                {selectedEmployee.employment_type === 'permanent' ? 'Tetap' :
                 selectedEmployee.employment_type === 'contract' ? 'Kontrak' : 'Magang'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="mb-0 capitalize">{selectedEmployee.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Divisi dan Jabatan Baru */}
      {selectedEmployee && (
        <>
          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm">Posisi Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Divisi Baru *</Label>
                <Popover open={openDivisionCombobox} onOpenChange={setOpenDivisionCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDivisionCombobox}
                      className="w-full justify-between"
                      disabled={loadingDivisions}
                    >
                      {selectedDivision?.nama_divisi || (loadingDivisions ? "Memuat divisi..." : "Pilih divisi baru...")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari divisi..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Divisi tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {divisions.map((division) => (
                            <CommandItem
                              key={division.id}
                              value={division.nama_divisi}
                              onSelect={() => {
                                setSelectedDivisionId(division.id);
                                setOpenDivisionCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDivisionId === division.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{division.nama_divisi}</span>
                                <span className="text-xs text-muted-foreground">
                                  {division.kode_divisi}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployee.division_id === selectedDivisionId && selectedDivisionId && '✓ Divisi tetap sama'}
                  {selectedEmployee.division_id !== selectedDivisionId && selectedDivisionId && '⚠️ Mutasi divisi'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Jabatan Baru *</Label>
                <Popover open={openPositionCombobox} onOpenChange={setOpenPositionCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPositionCombobox}
                      className="w-full justify-between"
                      disabled={loadingPositions}
                    >
                      {selectedPosition ? (
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} />
                          <span>{selectedPosition.name}</span>
                        </div>
                      ) : loadingPositions ? (
                        "Memuat jabatan..."
                      ) : (
                        "Pilih jabatan baru..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari jabatan..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Jabatan tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {positions.map((position) => (
                            <CommandItem
                              key={position.id}
                              value={position.name}
                              onSelect={() => {
                                setSelectedPositionId(position.id);
                                setOpenPositionCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPositionId === position.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{position.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {position.code} • {position.level?.charAt(0).toUpperCase() + position.level?.slice(1)}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployee.position_id === selectedPositionId && selectedPositionId && '✓ Jabatan tetap sama'}
                  {selectedEmployee.position_id !== selectedPositionId && selectedPositionId && '⚠️ Mutasi jabatan'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Pengajuan *</Label>
              <DatePicker date={transferDate} onDateChange={setTransferDate} />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Efektif *</Label>
              <DatePicker date={effectiveDate} onDateChange={setEffectiveDate} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Mutasi *</Label>
            <Textarea
              id="reason"
              placeholder="Jelaskan alasan mutasi (promosi, rotasi, permintaan pribadi, dll)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              rows={2}
            />
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedEmployee}>
          Simpan Mutasi
        </Button>
      </div>
    </div>
  );
}
