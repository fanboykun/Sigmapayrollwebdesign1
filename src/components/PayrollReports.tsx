import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { MASTER_EMPLOYEES } from "../shared/employeeData";
import { useMemo } from "react";

export function PayrollReports() {
  // Hitung data dari MASTER_EMPLOYEES
  const analytics = useMemo(() => {
    const activeEmployees = MASTER_EMPLOYEES.filter(emp => emp.status === 'active');
    const totalMonthlySalary = activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0);
    
    // Group by department
    const deptMap = new Map<string, number>();
    activeEmployees.forEach(emp => {
      const current = deptMap.get(emp.department) || 0;
      deptMap.set(emp.department, current + emp.baseSalary);
    });
    
    // Convert to array dan sort by value
    const deptData = Array.from(deptMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return {
      totalEmployees: activeEmployees.length,
      totalMonthlySalary,
      avgSalaryPerEmployee: totalMonthlySalary / activeEmployees.length,
      departmentData: deptData,
    };
  }, []);

  // Generate monthly data (Apr - Okt 2025) dengan variasi kecil
  const monthlyData = useMemo(() => {
    const baseAmount = analytics.totalMonthlySalary;
    return [
      { month: "Apr", amount: Math.round(baseAmount * 0.93) },
      { month: "Mei", amount: Math.round(baseAmount * 0.96) },
      { month: "Jun", amount: Math.round(baseAmount * 0.94) },
      { month: "Jul", amount: Math.round(baseAmount * 0.97) },
      { month: "Agu", amount: Math.round(baseAmount * 0.99) },
      { month: "Sep", amount: Math.round(baseAmount * 0.98) },
      { month: "Okt", amount: baseAmount },
    ];
  }, [analytics.totalMonthlySalary]);

  // Assign colors to departments
  const colors = ["#2c7be5", "#00d27a", "#f5803e", "#27bcfd", "#e63757", "#95aac9", "#6f42c1", "#fd7e14"];
  const departmentData = analytics.departmentData.map((dept, index) => ({
    ...dept,
    color: colors[index % colors.length],
  }));

  // Calculate expense breakdown
  const expenseBreakdown = useMemo(() => {
    const totalGross = analytics.totalMonthlySalary;
    const gajiPokok = totalGross; // 100% dari base salary
    const tunjangan = Math.round(totalGross * 0.20); // 20% tunjangan
    const bonus = Math.round(totalGross * 0.10); // 10% bonus
    const benefit = Math.round(totalGross * 0.06); // 6% benefit
    const totalBruto = gajiPokok + tunjangan + bonus + benefit;
    const pajak = Math.round(totalBruto * 0.15); // 15% pajak estimasi
    
    return [
      {
        category: "Gaji Pokok",
        amount: gajiPokok,
        percentage: 85,
      },
      {
        category: "Tunjangan",
        amount: tunjangan,
        percentage: 20,
      },
      { category: "Bonus", amount: bonus, percentage: 10 },
      { category: "Benefit", amount: benefit, percentage: 6 },
      { category: "Pajak", amount: pajak, percentage: 21 },
    ];
  }, [analytics.totalMonthlySalary]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}M`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${(value / 1000).toFixed(0)}rb`;
  };

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate YTD (7 months Apr-Okt)
  const totalYTD = useMemo(() => {
    return monthlyData.reduce((sum, month) => sum + month.amount, 0);
  }, [monthlyData]);

  const avgMonthlyCost = useMemo(() => {
    return totalYTD / monthlyData.length;
  }, [totalYTD, monthlyData.length]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-1">Analitik Penggajian</h1>
          <p className="text-muted-foreground">
            Analitik dan wawasan komprehensif
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="2025">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Ekspor Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <Card className="p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">
            Total Penggajian YTD
          </p>
          <h2 className="text-3xl mb-3">{formatCurrency(totalYTD)}</h2>
          <div className="flex items-center gap-1 text-sm text-[#00d27a]">
            <TrendingUp size={16} />
            <span>8,5% vs tahun lalu</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">
            Rata-rata Biaya Bulanan
          </p>
          <h2 className="text-3xl mb-3">{formatCurrency(avgMonthlyCost)}</h2>
          <div className="flex items-center gap-1 text-sm text-[#00d27a]">
            <TrendingUp size={16} />
            <span>3,2% vs bulan lalu</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">
            Biaya per Karyawan
          </p>
          <h2 className="text-3xl mb-3">{formatCurrency(analytics.avgSalaryPerEmployee)}</h2>
          <div className="flex items-center gap-1 text-sm text-[#e63757]">
            <TrendingDown size={16} />
            <span>1,5% vs bulan lalu</span>
          </div>
        </Card>
      </div>

      <Tabs
        defaultValue="monthly"
        className="space-y-4 md:space-y-6"
      >
        <TabsList>
          <TabsTrigger value="monthly">
            Tren Bulanan
          </TabsTrigger>
          <TabsTrigger value="department">
            Per Departemen
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            Rincian Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card className="p-4 md:p-6 shadow-sm">
            <h3 className="mb-4 md:mb-6">
              Tren Penggajian Bulanan
            </h3>
            <ResponsiveContainer
              width="100%"
              height={300}
              className="md:h-[400px]"
            >
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e3e6ed"
                />
                <XAxis
                  dataKey="month"
                  stroke="#748194"
                  style={{ fontSize: "14px" }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  stroke="#748194"
                  style={{ fontSize: "14px" }}
                />
                <Tooltip
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e3e6ed",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2c7be5"
                  strokeWidth={3}
                  dot={{ fill: "#2c7be5", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="department">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-4 md:p-6 shadow-sm">
              <h3 className="mb-4 md:mb-6">
                Distribusi Penggajian
              </h3>
              <ResponsiveContainer
                width="100%"
                height={300}
                className="md:h-[400px]"
              >
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4 md:p-6 shadow-sm">
              <h3 className="mb-4 md:mb-6">
                Perbandingan Departemen
              </h3>
              <ResponsiveContainer
                width="100%"
                height={300}
                className="md:h-[400px]"
              >
                <BarChart
                  data={departmentData}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e3e6ed"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={formatCurrency}
                    stroke="#748194"
                    style={{ fontSize: "14px" }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke="#748194"
                    style={{ fontSize: "14px" }}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e6ed",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#2c7be5"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card className="p-4 md:p-6 shadow-sm">
            <h3 className="mb-4 md:mb-6">
              Rincian Pengeluaran
            </h3>
            <div className="space-y-6">
              {expenseBreakdown.map((expense) => (
                <div
                  key={expense.category}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span>{expense.category}</span>
                    <span className="text-primary">
                      {formatFullCurrency(expense.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${expense.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-muted/30 rounded">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Bruto
                  </p>
                  <p className="text-2xl">
                    {formatFullCurrency(
                      expenseBreakdown[0].amount + 
                      expenseBreakdown[1].amount + 
                      expenseBreakdown[2].amount + 
                      expenseBreakdown[3].amount
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Potongan
                  </p>
                  <p className="text-2xl text-[#e63757]">
                    {formatFullCurrency(expenseBreakdown[4].amount)}
                  </p>
                </div>
                <div className="col-span-2 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Penggajian Bersih
                  </p>
                  <p className="text-3xl text-primary">
                    {formatFullCurrency(
                      expenseBreakdown[0].amount + 
                      expenseBreakdown[1].amount + 
                      expenseBreakdown[2].amount + 
                      expenseBreakdown[3].amount - 
                      expenseBreakdown[4].amount
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}