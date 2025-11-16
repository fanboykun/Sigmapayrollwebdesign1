import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Download, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface EmployeePayroll {
  id: string;
  name: string;
  employeeId: string;
  divisionId: string;
  divisionName: string;
  positionId: string;
  positionName: string;
  baseSalary: number;
  absentDays: number;
  deductions: number;
  status: 'active' | 'inactive' | 'on-leave';
}

export function EmployeePayroll() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayroll | null>(null);
  const [employees, setEmployees] = useState<EmployeePayroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);

  // Load divisions for filter
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

  // Load employees with payroll data
  const loadEmployees = async () => {
    try {
      setLoading(true);

      // Fetch employees with division info
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          employee_id,
          full_name,
          division_id,
          position_id,
          base_salary,
          status,
          divisions:division_id (
            id,
            kode_divisi,
            nama_divisi
          )
        `)
        .order('employee_id');

      if (empError) throw empError;

      // Fetch positions separately
      const { data: positionsData, error: posError } = await supabase
        .from('positions')
        .select('id, name');

      if (posError) throw posError;

      // Create positions map for quick lookup
      const positionsMap = new Map((positionsData || []).map((p: any) => [p.id, p.name]));

      // Get current month's attendance data for all employees
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: attendanceData, error: attError} = await supabase
        .from('attendance_records')
        .select('employee_id, status')
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('date', lastDayOfMonth.toISOString().split('T')[0])
        .in('status', ['absent', 'half-day']);

      if (attError) throw attError;

      // Count absent days per employee
      const absentMap = new Map<string, number>();
      (attendanceData || []).forEach((record: any) => {
        const count = absentMap.get(record.employee_id) || 0;
        absentMap.set(record.employee_id, count + (record.status === 'absent' ? 1 : 0.5));
      });

      // Transform data
      const transformedData: EmployeePayroll[] = (empData || []).map((emp: any) => {
        const baseSalary = emp.base_salary || 0;
        const absentDays = absentMap.get(emp.id) || 0;

        // Calculate deduction: assume 1 day absent = base_salary / 22 (working days per month)
        const dailySalary = baseSalary / 22;
        const deductions = Math.round(dailySalary * absentDays);

        return {
          id: emp.id,
          name: emp.full_name,
          employeeId: emp.employee_id,
          divisionId: emp.division_id,
          divisionName: emp.divisions?.nama_divisi || '-',
          positionId: emp.position_id,
          positionName: positionsMap.get(emp.position_id) || '-',
          baseSalary: baseSalary,
          absentDays: absentDays,
          deductions: deductions,
          status: emp.status as 'active' | 'inactive' | 'on-leave',
        };
      });

      setEmployees(transformedData);
    } catch (err: any) {
      console.error('Error loading employees:', err);
      toast.error('Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDivisions();
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = divisionFilter === 'all' || emp.divisionId === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Aktif', className: 'bg-[#00d27a]/10 text-[#00d27a] hover:bg-[#00d27a]/10' };
      case 'on-leave':
        return { label: 'Cuti', className: 'bg-[#f5803e]/10 text-[#f5803e] hover:bg-[#f5803e]/10' };
      default:
        return { label: 'Tidak Aktif', className: 'bg-muted text-muted-foreground hover:bg-muted' };
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Gaji Pokok</h1>
        <p className="text-muted-foreground">
          Kelola informasi gaji pokok karyawan berdasarkan data master dan presensi
        </p>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari berdasarkan nama atau ID karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.nama_divisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Ekspor
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Karyawan</th>
                  <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Departemen</th>
                  <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Jabatan</th>
                  <th className="text-right px-4 md:px-6 py-3 text-sm text-muted-foreground">Gaji Pokok</th>
                  <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Tidak Hadir</th>
                  <th className="text-right px-4 md:px-6 py-3 text-sm text-muted-foreground">Potongan</th>
                  <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
                  <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 md:px-6 py-12 text-center text-muted-foreground">
                      Tidak ada data karyawan
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const statusBadge = getStatusBadge(employee.status);
                    return (
                      <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="mb-0">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">{employee.divisionName}</td>
                        <td className="px-4 md:px-6 py-4 text-muted-foreground">{employee.positionName}</td>
                        <td className="px-4 md:px-6 py-4 text-right font-medium">{formatCurrency(employee.baseSalary)}</td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          {employee.absentDays > 0 ? (
                            <Badge variant="destructive" className="bg-[#e63757]/10 text-[#e63757] hover:bg-[#e63757]/10">
                              {employee.absentDays} hari
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right text-[#e63757]">
                          {employee.deductions > 0 ? `-${formatCurrency(employee.deductions)}` : '-'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="secondary" className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setSelectedEmployee(employee)}
                              >
                                <Eye size={16} />
                                Lihat
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detail Gaji Karyawan</DialogTitle>
                                <DialogDescription>
                                  Informasi gaji pokok dan potongan berdasarkan presensi
                                </DialogDescription>
                              </DialogHeader>
                              {selectedEmployee && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4 pb-4 border-b">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                      <h3>{selectedEmployee.name}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedEmployee.employeeId} • {selectedEmployee.positionName}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded">
                                      <p className="text-sm text-muted-foreground mb-1">Divisi</p>
                                      <p>{selectedEmployee.divisionName}</p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded">
                                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                                      <Badge variant="secondary" className={getStatusBadge(selectedEmployee.status).className}>
                                        {getStatusBadge(selectedEmployee.status).label}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="mb-4">Rincian Gaji Bulan Ini</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between py-3 border-b border-border">
                                        <span className="text-muted-foreground">Gaji Pokok</span>
                                        <span className="font-medium">{formatCurrency(selectedEmployee.baseSalary)}</span>
                                      </div>
                                      <div className="flex justify-between py-3 border-b border-border">
                                        <span className="text-muted-foreground">Hari Tidak Hadir</span>
                                        <span className="text-[#e63757]">{selectedEmployee.absentDays} hari</span>
                                      </div>
                                      <div className="flex justify-between py-3 border-b border-border">
                                        <span className="text-muted-foreground">Potongan Ketidakhadiran</span>
                                        <span className="text-[#e63757]">
                                          {selectedEmployee.deductions > 0 ? `-${formatCurrency(selectedEmployee.deductions)}` : '-'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-4 bg-primary/5 px-4 rounded">
                                        <span className="font-medium">Gaji Setelah Potongan</span>
                                        <span className="text-primary text-lg font-semibold">
                                          {formatCurrency(selectedEmployee.baseSalary - selectedEmployee.deductions)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                      <strong>Catatan:</strong> Potongan dihitung berdasarkan gaji harian (gaji pokok ÷ 22 hari kerja)
                                      × jumlah hari tidak hadir dalam bulan berjalan.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
          </p>
        </div>
      </Card>
    </div>
  );
}
