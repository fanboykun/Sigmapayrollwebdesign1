import { Card } from './ui/card';
import { DollarSign, Users, Clock, FileText, TreePine, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
  totalPayrollThisMonth: number;
  divisions: number;
}

interface RecentPayroll {
  id: string;
  period_month: number;
  period_year: number;
  total_gross: number;
  status: string;
  created_at: string;
  employee_count: number;
}

interface RecentEmployee {
  id: string;
  employee_id: string;
  full_name: string;
  division_name: string;
  position_name: string;
  join_date: string;
  status: string;
}

// Dummy data for realistic display
const dummyPayrolls: RecentPayroll[] = [
  {
    id: '1',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    total_gross: 1847500000,
    status: 'draft',
    created_at: new Date().toISOString(),
    employee_count: 156,
  },
  {
    id: '2',
    period_month: new Date().getMonth() || 12,
    period_year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    total_gross: 1823750000,
    status: 'final',
    created_at: new Date().toISOString(),
    employee_count: 154,
  },
  {
    id: '3',
    period_month: new Date().getMonth() - 1 || 11,
    period_year: new Date().getMonth() <= 1 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    total_gross: 1798250000,
    status: 'final',
    created_at: new Date().toISOString(),
    employee_count: 152,
  },
  {
    id: '4',
    period_month: new Date().getMonth() - 2 || 10,
    period_year: new Date().getMonth() <= 2 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    total_gross: 1785000000,
    status: 'final',
    created_at: new Date().toISOString(),
    employee_count: 150,
  },
];

const dummyEmployees: RecentEmployee[] = [
  {
    id: '1',
    employee_id: 'EMP-AL-0156',
    full_name: 'Ahmad Rizky Pratama',
    division_name: 'Estate Afdeling I',
    position_name: 'Mandor Panen',
    join_date: '2024-11-15',
    status: 'active',
  },
  {
    id: '2',
    employee_id: 'EMP-AL-0155',
    full_name: 'Siti Nurhaliza',
    division_name: 'Kantor Pusat',
    position_name: 'Staff Keuangan',
    join_date: '2024-11-10',
    status: 'active',
  },
  {
    id: '3',
    employee_id: 'EMP-AL-0154',
    full_name: 'Budi Santoso',
    division_name: 'Estate Afdeling II',
    position_name: 'Krani Afdeling',
    join_date: '2024-11-05',
    status: 'active',
  },
  {
    id: '4',
    employee_id: 'EMP-AL-0153',
    full_name: 'Dewi Kartika Sari',
    division_name: 'Klinik',
    position_name: 'Perawat',
    join_date: '2024-10-28',
    status: 'active',
  },
  {
    id: '5',
    employee_id: 'EMP-AL-0152',
    full_name: 'Muhammad Fadli',
    division_name: 'Workshop',
    position_name: 'Mekanik',
    join_date: '2024-10-20',
    status: 'active',
  },
];

const dummyStats: DashboardStats = {
  totalEmployees: 162,
  activeEmployees: 156,
  pendingLeaveRequests: 8,
  todayAttendance: 142,
  totalPayrollThisMonth: 1847500000,
  divisions: 12,
};

export function PayrollDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(dummyStats);
  const [recentPayrolls, setRecentPayrolls] = useState<RecentPayroll[]>(dummyPayrolls);
  const [recentEmployees, setRecentEmployees] = useState<RecentEmployee[]>(dummyEmployees);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        employeesResult,
        activeEmployeesResult,
        leaveRequestsResult,
        attendanceResult,
        payrollResult,
        divisionsResult,
        recentPayrollsResult,
        recentEmployeesResult,
      ] = await Promise.all([
        // Total employees
        supabase.from('employees').select('id', { count: 'exact', head: true }),
        // Active employees
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        // Pending leave requests
        supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Today's attendance
        supabase.from('attendance_records').select('id', { count: 'exact', head: true })
          .eq('date', format(new Date(), 'yyyy-MM-dd'))
          .eq('status', 'hadir'),
        // Current month payroll total
        supabase.from('payroll_records').select('gross_salary')
          .eq('period_month', new Date().getMonth() + 1)
          .eq('period_year', new Date().getFullYear()),
        // Total divisions
        supabase.from('divisions').select('id', { count: 'exact', head: true }),
        // Recent payroll periods (aggregated)
        supabase.from('payroll_records')
          .select('id, period_month, period_year, gross_salary, status, created_at')
          .order('period_year', { ascending: false })
          .order('period_month', { ascending: false })
          .limit(100),
        // Recent employees
        supabase.from('employees')
          .select(`
            id,
            employee_id,
            full_name,
            join_date,
            status,
            division:divisions(name),
            position:positions(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      // Calculate total payroll
      const totalPayroll = payrollResult.data?.reduce((sum, record) => sum + (record.gross_salary || 0), 0) || 0;

      // Process recent payrolls - group by period
      const payrollsByPeriod = new Map<string, RecentPayroll>();
      recentPayrollsResult.data?.forEach(record => {
        const key = `${record.period_year}-${record.period_month}`;
        if (!payrollsByPeriod.has(key)) {
          payrollsByPeriod.set(key, {
            id: key,
            period_month: record.period_month,
            period_year: record.period_year,
            total_gross: 0,
            status: record.status,
            created_at: record.created_at,
            employee_count: 0,
          });
        }
        const existing = payrollsByPeriod.get(key)!;
        existing.total_gross += record.gross_salary || 0;
        existing.employee_count += 1;
      });

      const groupedPayrolls = Array.from(payrollsByPeriod.values())
        .sort((a, b) => {
          if (a.period_year !== b.period_year) return b.period_year - a.period_year;
          return b.period_month - a.period_month;
        })
        .slice(0, 4);

      // Process recent employees
      const processedEmployees: RecentEmployee[] = (recentEmployeesResult.data || []).map(emp => {
        const division = emp.division as { name: string } | { name: string }[] | null;
        const position = emp.position as { name: string } | { name: string }[] | null;
        return {
          id: emp.id,
          employee_id: emp.employee_id,
          full_name: emp.full_name,
          division_name: Array.isArray(division) ? division[0]?.name || '-' : division?.name || '-',
          position_name: Array.isArray(position) ? position[0]?.name || '-' : position?.name || '-',
          join_date: emp.join_date,
          status: emp.status,
        };
      });

      // Use real data if available, otherwise keep dummy data
      const hasRealData = (employeesResult.count || 0) > 0;

      if (hasRealData) {
        setStats({
          totalEmployees: employeesResult.count || 0,
          activeEmployees: activeEmployeesResult.count || 0,
          pendingLeaveRequests: leaveRequestsResult.count || 0,
          todayAttendance: attendanceResult.count || 0,
          totalPayrollThisMonth: totalPayroll,
          divisions: divisionsResult.count || 0,
        });

        setRecentPayrolls(groupedPayrolls.length > 0 ? groupedPayrolls : dummyPayrolls);
        setRecentEmployees(processedEmployees.length > 0 ? processedEmployees : dummyEmployees);
      }
      // If no real data, keep the dummy data that was set as initial state
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1];
  };

  const dashboardStats = [
    {
      title: 'Karyawan Aktif',
      value: loading ? '...' : stats.activeEmployees.toString(),
      subtitle: `dari ${stats.totalEmployees} total`,
      icon: Users,
      lightColor: 'bg-[#00d27a]/10',
      textColor: 'text-[#00d27a]',
    },
    {
      title: 'Total Penggajian',
      value: loading ? '...' : formatCurrency(stats.totalPayrollThisMonth),
      subtitle: `Bulan ${getMonthName(new Date().getMonth() + 1)}`,
      icon: DollarSign,
      lightColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
    {
      title: 'Kehadiran Hari Ini',
      value: loading ? '...' : stats.todayAttendance.toString(),
      subtitle: `dari ${stats.activeEmployees} karyawan`,
      icon: Calendar,
      lightColor: 'bg-[#f5803e]/10',
      textColor: 'text-[#f5803e]',
    },
    {
      title: 'Cuti Menunggu',
      value: loading ? '...' : stats.pendingLeaveRequests.toString(),
      subtitle: 'perlu persetujuan',
      icon: Clock,
      lightColor: 'bg-[#e63757]/10',
      textColor: 'text-[#e63757]',
    },
    {
      title: 'Divisi/Estate',
      value: loading ? '...' : stats.divisions.toString(),
      subtitle: 'unit kerja',
      icon: TreePine,
      lightColor: 'bg-[#748194]/10',
      textColor: 'text-[#748194]',
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Dasbor Sigma Payroll</h1>
        <p className="text-muted-foreground">Pantau operasi payroll, HR, dan klinik Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.lightColor} w-12 h-12 rounded flex items-center justify-center`}>
                  <Icon size={20} className={stat.textColor} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Recent Payrolls */}
        <Card className="lg:col-span-2 shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3>Proses Penggajian Terbaru</h3>
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </div>
          </div>
          <div className="p-6">
            {recentPayrolls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada data penggajian</p>
            ) : (
              <div className="space-y-4">
                {recentPayrolls.map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                        <DollarSign size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="mb-0.5">{getMonthName(payroll.period_month)} {payroll.period_year}</p>
                        <p className="text-sm text-muted-foreground">{payroll.employee_count} karyawan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-0.5">{formatCurrency(payroll.total_gross)}</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                        payroll.status === 'final'
                          ? 'bg-[#00d27a]/10 text-[#00d27a]'
                          : 'bg-[#f5803e]/10 text-[#f5803e]'
                      }`}>
                        {payroll.status === 'final' ? 'Selesai' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <div className="p-6 border-b border-border">
            <h3>Tindakan Cepat</h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-2 md:space-y-3">
              <Button className="w-full justify-start gap-2 text-sm md:text-base" variant="default">
                <DollarSign size={18} />
                Proses Penggajian
              </Button>
              <Button className="w-full justify-start gap-2 text-sm md:text-base" variant="outline">
                <Users size={18} />
                Kelola Karyawan
              </Button>
              <Button className="w-full justify-start gap-2 text-sm md:text-base" variant="outline">
                <FileText size={18} />
                Buat Laporan
              </Button>
              <Button className="w-full justify-start gap-2 text-sm md:text-base" variant="outline">
                <Clock size={18} />
                Tinjau Cuti
              </Button>
            </div>
          </div>
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bulan Aktif</p>
              <span className="text-sm">{getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card className="shadow-sm">
        <div className="p-6 border-b border-border">
          <h3>Karyawan Terbaru</h3>
        </div>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">ID Karyawan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Nama</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Divisi</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Jabatan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-sm text-muted-foreground">
                    Belum ada data karyawan
                  </td>
                </tr>
              ) : (
                recentEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-mono text-sm">{employee.employee_id}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          {employee.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span>{employee.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground">{employee.division_name}</td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground">{employee.position_name}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                        employee.status === 'active'
                          ? 'bg-[#00d27a]/10 text-[#00d27a]'
                          : 'bg-[#e63757]/10 text-[#e63757]'
                      }`}>
                        {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
