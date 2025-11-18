/**
 * LeaveManagement.tsx
 * Komponen untuk mengelola cuti karyawan dengan filter divisi
 * dan search karyawan berdasarkan divisi yang dipilih
 */

import { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Eye, CheckCircle, XCircle, Clock, Calendar as CalendarIcon, FileText, Users, User, ChevronsUpDown, Check, Building2, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useLeaveRequests, type LeaveRequestWithEmployee } from '../hooks/useLeaveRequests';
import { useDivisions } from '../hooks/useDivisions';
import { useEmployees } from '../hooks/useEmployees';
import { usePositions } from '../hooks/usePositions';
import { useHolidays } from '../hooks/useHolidays';
import { toast } from 'sonner';

export function LeaveManagement() {
  // Use the Supabase hooks
  const {
    leaveRequests: dbLeaveRequests,
    statistics,
    totalCount,
    currentPage,
    pageSize,
    loading: dbLoading,
    error: dbError,
    goToPage,
    applyFilters,
    addLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useLeaveRequests();

  const { divisions, loading: divisionsLoading } = useDivisions();
  const { employees, loading: employeesLoading } = useEmployees();
  const { positions, loading: positionsLoading } = usePositions();
  const { holidays } = useHolidays();

  // Enrich employees with division and position names
  const enrichedEmployees = useMemo(() => {
    return employees.map(emp => {
      const division = divisions.find(d => d.id === emp.division_id);
      const position = positions.find(p => p.id === emp.position_id);
      return {
        ...emp,
        divisionName: division?.nama_divisi || '',
        divisionCode: division?.kode_divisi || '',
        positionName: position?.name || '',
        positionCode: position?.code || '',
      };
    });
  }, [employees, divisions, positions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters({
      search: searchQuery,
      division: divisionFilter,
      status: statusFilter,
      leaveType: leaveTypeFilter,
    });
  }, [searchQuery, divisionFilter, statusFilter, leaveTypeFilter]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestWithEmployee | null>(null);

  // Form state
  const [openDivisionCombobox, setOpenDivisionCombobox] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    reason: '',
  });

  // Transform Supabase data to component format (SERVER-SIDE FILTERED)
  const leaveRequests = useMemo(() => {
    return dbLeaveRequests.map((req) => ({
      ...req,
      employeeId: req.employees?.employee_id || '',
      employeeName: req.employees?.full_name || '',
      employeeCode: req.employees?.employee_id || '',
      division: req.employees?.divisions?.nama_divisi || '',
      position: req.employees?.positions?.name || '',
      startDate: req.start_date,
      endDate: req.end_date,
      days: req.total_days,
      leaveType: req.leave_type,
      submittedDate: req.requested_date || req.created_at.split('T')[0],
      approvedDate: req.approved_date ? req.approved_date.split('T')[0] : undefined,
      rejectionReason: req.rejection_reason || undefined,
    }))
  }, [dbLeaveRequests]);

  // Get selected division and employee from Supabase data
  const selectedDivision = divisions.find(div => div.id === selectedDivisionId);
  const selectedEmployee = enrichedEmployees.find(emp => emp.id === selectedEmployeeId);

  // Filter employees by selected division (using division_id, not division name)
  // Only show active employees
  const filteredEmployeesByDivision = useMemo(() => {
    if (!selectedDivisionId) return [];
    return enrichedEmployees.filter(emp => emp.division_id === selectedDivisionId && emp.status === 'active');
  }, [enrichedEmployees, selectedDivisionId]);

  // Use leaveRequests directly - already filtered server-side
  const filteredRequests = leaveRequests;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedDivisionId('');
    setSelectedEmployeeId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setFormData({
      leaveType: 'annual',
      reason: '',
    });
  };

  const calculateDays = (start: Date, end: Date) => {
    let count = 0;
    const currentDate = new Date(start);

    // Create a Set of holiday dates for efficient lookup
    const holidayDates = new Set(holidays.map(h => h.date));

    // Loop through each day from start to end
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      // Skip Sunday (0 = Sunday) and holidays
      if (dayOfWeek !== 0 && !holidayDates.has(dateStr)) {
        count++;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const handleAddLeaveRequest = async () => {
    if (!selectedEmployee || !startDate || !endDate || !formData.reason) {
      toast.error('Mohon lengkapi semua data yang diperlukan');
      return;
    }

    const days = calculateDays(startDate, endDate);

    const { data, error } = await addLeaveRequest({
      employee_id: selectedEmployee.id, // Use the UUID from the database
      leave_type: formData.leaveType as any,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      total_days: days,
      reason: formData.reason,
      status: 'pending',
      requested_date: format(new Date(), 'yyyy-MM-dd'),
    });

    if (error) {
      toast.error(`Gagal menambahkan pengajuan cuti: ${error}`);
      return;
    }

    toast.success('Pengajuan cuti berhasil ditambahkan');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleApprove = async (id: string) => {
    // TODO: Get current user ID from auth context
    const { error } = await approveLeaveRequest(id);

    if (error) {
      toast.error(`Gagal menyetujui cuti: ${error}`);
      return;
    }

    toast.success('Pengajuan cuti telah disetujui dan data presensi otomatis telah dibuat');
    setIsDetailDialogOpen(false);
  };

  const handleReject = async (id: string, reason: string) => {
    // TODO: Get current user ID from auth context
    const { error } = await rejectLeaveRequest(id, reason);

    if (error) {
      toast.error(`Gagal menolak cuti: ${error}`);
      return;
    }

    toast.success('Pengajuan cuti telah ditolak');
    setIsDetailDialogOpen(false);
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Cuti Sakit',
      maternity: 'Cuti Hamil/Melahirkan',
      paternity: 'Cuti Ayah',
      unpaid: 'Cuti Tanpa Gaji',
      other: 'Lainnya',
    };
    return types[type] || type;
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeConfig: Record<string, { className: string }> = {
      annual: { className: 'bg-[#2c7be5]/10 text-[#2c7be5]' },
      sick: { className: 'bg-[#e63757]/10 text-[#e63757]' },
      maternity: { className: 'bg-[#d946ef]/10 text-[#d946ef]' },
      paternity: { className: 'bg-[#3b82f6]/10 text-[#3b82f6]' },
      unpaid: { className: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
      other: { className: 'bg-[#95aac9]/10 text-[#95aac9]' },
    };

    const config = typeConfig[type] || typeConfig.other;
    return <Badge variant="secondary" className={config.className}>{getLeaveTypeLabel(type)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; icon: any; label: string }> = {
      pending: { className: 'bg-[#f5803e]/10 text-[#f5803e]', icon: Clock, label: 'Menunggu' },
      approved: { className: 'bg-[#00d27a]/10 text-[#00d27a]', icon: CheckCircle, label: 'Disetujui' },
      rejected: { className: 'bg-[#e63757]/10 text-[#e63757]', icon: XCircle, label: 'Ditolak' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.className} gap-1`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  // Use statistics from hook (already calculated server-side for better performance)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Manajemen Cuti Karyawan</h1>
        <p className="text-muted-foreground">Kelola pengajuan cuti karyawan</p>
      </div>

      {/* Error Display */}
      {dbError && (
        <Card className="mb-4 p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle size={20} />
            <p className="mb-0">Error: {dbError}</p>
          </div>
        </Card>
      )}

      {/* Loading Indicator */}
      {dbLoading && (
        <Card className="mb-4 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground">Memuat data cuti...</p>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pengajuan</p>
              <h3 className="text-2xl">{statistics.totalRequests}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <FileText size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Menunggu Approval</p>
              <h3 className="text-2xl">{statistics.pendingRequests}</h3>
            </div>
            <div className="w-12 h-12 bg-[#f5803e]/10 rounded flex items-center justify-center">
              <Clock size={24} className="text-[#f5803e]" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Disetujui</p>
              <h3 className="text-2xl">{statistics.approvedRequests}</h3>
            </div>
            <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
              <CheckCircle size={24} className="text-[#00d27a]" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Hari Cuti Digunakan</p>
              <h3 className="text-2xl">{statistics.totalDaysUsed}</h3>
              <p className="text-xs text-muted-foreground">Cuti tahunan</p>
            </div>
            <div className="w-12 h-12 bg-[#2c7be5]/10 rounded flex items-center justify-center">
              <CalendarIcon size={24} className="text-[#2c7be5]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm mb-6">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari karyawan, kode, atau divisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div.id} value={div.nama_divisi}>{div.nama_divisi}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="annual">Cuti Tahunan</SelectItem>
                  <SelectItem value="sick">Cuti Sakit</SelectItem>
                  <SelectItem value="maternity">Cuti Hamil/Melahirkan</SelectItem>
                  <SelectItem value="paternity">Cuti Ayah</SelectItem>
                  <SelectItem value="unpaid">Cuti Tanpa Gaji</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 flex-1 sm:flex-none" onClick={resetForm}>
                    <Plus size={16} />
                    Ajukan Cuti
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajukan Cuti Baru</DialogTitle>
                    <DialogDescription>
                      Pilih divisi terlebih dahulu, kemudian pilih karyawan dari divisi tersebut
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Info:</strong> Filter divisi terlebih dahulu untuk melihat daftar karyawan. Data divisi dan jabatan akan otomatis terisi dari karyawan yang dipilih.
                      </p>
                    </div>

                    {/* Division Selection */}
                    <div className="space-y-2">
                      <Label>Pilih Divisi *</Label>
                      <Popover open={openDivisionCombobox} onOpenChange={setOpenDivisionCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDivisionCombobox}
                            className="w-full justify-between"
                          >
                            {selectedDivision ? (
                              <div className="flex items-center gap-2">
                                <Building2 size={16} />
                                <span>{selectedDivision.kode_divisi} - {selectedDivision.nama_divisi}</span>
                              </div>
                            ) : (
                              "Pilih divisi..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cari divisi..." />
                            <CommandList>
                              <CommandEmpty>Divisi tidak ditemukan.</CommandEmpty>
                              <CommandGroup className="overflow-visible">
                                {divisions.map((division) => {
                                  const employeeCount = employees.filter(emp => emp.division_id === division.id && emp.status === 'active').length;
                                  return (
                                    <CommandItem
                                      key={division.id}
                                      value={`${division.nama_divisi} ${division.kode_divisi}`}
                                      onSelect={() => {
                                        setSelectedDivisionId(division.id);
                                        setSelectedEmployeeId(''); // Reset employee selection
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
                                        <span>{division.kode_divisi} - {division.nama_divisi}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {employeeCount} karyawan aktif
                                        </span>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Employee Selection (only shows when division is selected) */}
                    {selectedDivisionId && (
                      <div className="space-y-2">
                        <Label>Pilih Karyawan *</Label>
                        <Popover open={openEmployeeCombobox} onOpenChange={setOpenEmployeeCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openEmployeeCombobox}
                              className="w-full justify-between"
                            >
                              {selectedEmployee ? (
                                <div className="flex items-center gap-2">
                                  <User size={16} />
                                  <span>{selectedEmployee.full_name} ({selectedEmployee.employee_id})</span>
                                </div>
                              ) : (
                                "Cari dan pilih karyawan..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Cari nama atau Employee ID..." />
                              <CommandList>
                                <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>
                                <CommandGroup className="overflow-visible">
                                  {filteredEmployeesByDivision.map((employee) => (
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
                                          {employee.employee_id} • {employee.positionName}
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
                          Menampilkan {filteredEmployeesByDivision.length} karyawan aktif dari divisi {selectedDivision?.nama_divisi}
                        </p>
                      </div>
                    )}

                    {/* Display Selected Employee Info */}
                    {selectedEmployee && (
                      <div className="border-t pt-4">
                        <h4 className="mb-3 text-sm">Data Karyawan Terpilih</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Employee ID</p>
                            <p className="mb-0">{selectedEmployee.employee_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Nama Lengkap</p>
                            <p className="mb-0">{selectedEmployee.full_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Divisi</p>
                            <p className="mb-0">{selectedEmployee.divisionName} ({selectedEmployee.divisionCode})</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Jabatan</p>
                            <p className="mb-0">{selectedEmployee.positionName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status Karyawan</p>
                            <p className="mb-0 capitalize">{selectedEmployee.employment_status === 'permanent' ? 'Tetap' : selectedEmployee.employment_status === 'contract' ? 'Kontrak' : 'Harian'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <Badge variant={selectedEmployee.status === 'active' ? 'default' : 'secondary'}>
                              {selectedEmployee.status === 'active' ? 'Aktif' : selectedEmployee.status === 'inactive' ? 'Tidak Aktif' : selectedEmployee.status === 'on-leave' ? 'Cuti' : 'Terminated'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leave Details (only shows when employee is selected) */}
                    {selectedEmployee && (
                      <>
                        <div className="border-t pt-4">
                          <h4 className="mb-3 text-sm">Detail Cuti</h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="leaveType">Jenis Cuti *</Label>
                              <Select value={formData.leaveType} onValueChange={(value) => handleInputChange('leaveType', value)}>
                                <SelectTrigger id="leaveType">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="annual">Cuti Tahunan</SelectItem>
                                  <SelectItem value="sick">Cuti Sakit</SelectItem>
                                  <SelectItem value="maternity">Cuti Hamil/Melahirkan</SelectItem>
                                  <SelectItem value="paternity">Cuti Ayah</SelectItem>
                                  <SelectItem value="unpaid">Cuti Tanpa Gaji</SelectItem>
                                  <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tanggal Mulai *</Label>
                                <DatePicker date={startDate} onDateChange={setStartDate} />
                              </div>

                              <div className="space-y-2">
                                <Label>Tanggal Selesai *</Label>
                                <DatePicker date={endDate} onDateChange={setEndDate} />
                              </div>
                            </div>

                            {startDate && endDate && (
                              <div className="p-3 bg-muted/30 rounded">
                                <p className="text-sm">
                                  Durasi: <span className="font-medium">{calculateDays(startDate, endDate)} hari</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  * Hari Minggu dan hari libur tidak dihitung sebagai hari cuti
                                </p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="reason">Alasan/Keterangan *</Label>
                              <Textarea
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                placeholder="Jelaskan alasan pengajuan cuti..."
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                    <Button onClick={handleAddLeaveRequest} disabled={!selectedEmployee}>
                      Ajukan Cuti
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Karyawan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Divisi</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Jenis Cuti</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Periode</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Durasi</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <p className="mb-0">{request.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{request.employeeCode} • {request.position}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm">{request.division}</p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {getLeaveTypeBadge(request.leaveType)}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm">
                      <p className="mb-0">{format(new Date(request.startDate), 'dd MMM yyyy', { locale: idLocale })}</p>
                      <p className="text-xs text-muted-foreground">s/d {format(new Date(request.endDate), 'dd MMM yyyy', { locale: idLocale })}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {request.days} hari
                    </Badge>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLeave(request);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs md:text-sm text-muted-foreground">
              Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} total pengajuan
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || dbLoading}
                className="gap-1"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                  const totalPages = Math.ceil(totalCount / pageSize);
                  let pageNumber;

                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNumber)}
                      disabled={dbLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / pageSize) || dbLoading}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengajuan cuti karyawan
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nama Karyawan</p>
                  <p className="mb-0">{selectedLeave.employees?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">NIK</p>
                  <p className="mb-0">{selectedLeave.employees?.employee_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Divisi</p>
                  <p className="mb-0">{selectedLeave.employees?.divisions?.nama_divisi || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jabatan</p>
                  <p className="mb-0">{selectedLeave.employees?.positions?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jenis Cuti</p>
                  {getLeaveTypeBadge(selectedLeave.leave_type)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedLeave.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Mulai</p>
                  <p className="mb-0">{format(new Date(selectedLeave.start_date), 'dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Selesai</p>
                  <p className="mb-0">{format(new Date(selectedLeave.end_date), 'dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Durasi</p>
                  <p className="mb-0">{selectedLeave.total_days} hari</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Pengajuan</p>
                  <p className="mb-0">{selectedLeave.requested_date ? format(new Date(selectedLeave.requested_date), 'dd MMMM yyyy', { locale: idLocale }) : format(new Date(selectedLeave.created_at), 'dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alasan</p>
                <p className="mb-0">{selectedLeave.reason || '-'}</p>
              </div>
              {selectedLeave.status === 'approved' && selectedLeave.approved_date && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm mb-0">
                    <strong>Tanggal Approval:</strong> {format(new Date(selectedLeave.approved_date), 'dd MMMM yyyy', { locale: idLocale })}
                  </p>
                </div>
              )}
              {selectedLeave.status === 'rejected' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  {selectedLeave.approved_date && (
                    <p className="text-sm mb-1">
                      <strong>Tanggal:</strong> {format(new Date(selectedLeave.approved_date), 'dd MMMM yyyy', { locale: idLocale })}
                    </p>
                  )}
                  <p className="text-sm mb-0">
                    <strong>Alasan Penolakan:</strong> {selectedLeave.rejection_reason || '-'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedLeave?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => {
                    const reason = prompt('Masukkan alasan penolakan:');
                    if (reason) handleReject(selectedLeave.id, reason);
                  }}
                >
                  <XCircle size={16} className="mr-2" />
                  Tolak
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedLeave.id)}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Setujui
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
