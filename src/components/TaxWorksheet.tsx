import { useState, useMemo, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Printer, FileSpreadsheet, Calendar, Move } from 'lucide-react';
import { MASTER_EMPLOYEES } from '../shared/employeeData';
import { MASTER_DIVISIONS } from '../shared/divisionData';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface TaxEmployee {
  no: number;
  branch: string; // No. Cabang
  name: string;
  npwp: string;
  address: string;
  gender: string; // L/P
  maritalStatus: 'K' | 'TK'; // K=Kawin, TK=Tidak Kawin
  dependents: number; // Jumlah tanggungan
  division: string; // Estate/Division
  // Masa Perolehan PPh
  period: {
    from: string;
    to: string;
    days: number;
    monthYear: string; // Format: YYYY-MM
  };
  // Penghasilan yang PPh 21 nya dipotong oleh Pemberi Kerja
  incomeByCompany: {
    fixedIncome: number; // Gaji tetap
    overtimeBenefit: number; // Lembur & benefit
    bonus: number;
    thr: number;
    totalGross: number; // Total bruto
    positionCost: number; // Biaya jabatan
    pensionFund: number; // Iuran pensiun
    netIncome: number; // Penghasilan netto
  };
  // Penghasilan yang PPh 21 nya dibayar sendiri
  selfPaidIncome: {
    grossIncome: number;
    deduction: number;
    netIncome: number;
  };
  // Perhitungan PPh
  yearlyNetIncome: number;
  ptkp: number;
  pkp: number;
  pph21Yearly: number;
  pph21Monthly: number;
  pph21Withheld: number;
  pph21Payable: number;
}

export function TaxWorksheet() {
  const [filterMode, setFilterMode] = useState<'single' | 'range'>('single');
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [startMonth, setStartMonth] = useState('2025-09');
  const [endMonth, setEndMonth] = useState('2025-10');
  const [selectedDivision, setSelectedDivision] = useState('all');
  
  // Drag to scroll functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Helper untuk determine PTKP based on marital status and dependents
  const getPTKP = (status: 'K' | 'TK', dependents: number): number => {
    if (status === 'TK') {
      if (dependents === 0) return 54000000;
      if (dependents === 1) return 58500000;
      if (dependents === 2) return 63000000;
      return 67500000; // 3 or more
    } else {
      if (dependents === 0) return 58500000;
      if (dependents === 1) return 63000000;
      if (dependents === 2) return 67500000;
      return 72000000; // 3 or more
    }
  };

  // Helper function to generate tax data
  const generateTaxData = (): TaxEmployee[] => {
    const employees: TaxEmployee[] = [];
    let counter = 1;
    
    // Employee templates with various profiles
    const employeeTemplates = [
      { name: 'Ahmad Hidayat', gender: 'L', maritalStatus: 'K' as const, dependents: 1, baseSalary: 5500000 },
      { name: 'Siti Nurhaliza', gender: 'P', maritalStatus: 'TK' as const, dependents: 0, baseSalary: 8500000 },
      { name: 'Budi Santoso', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 4200000 },
      { name: 'Dewi Kartika', gender: 'P', maritalStatus: 'K' as const, dependents: 1, baseSalary: 7200000 },
      { name: 'Eko Prasetyo', gender: 'L', maritalStatus: 'K' as const, dependents: 3, baseSalary: 6800000 },
      { name: 'Fitri Handayani', gender: 'P', maritalStatus: 'TK' as const, dependents: 0, baseSalary: 5900000 },
      { name: 'Gunawan Susanto', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 9500000 },
      { name: 'Hesti Wulandari', gender: 'P', maritalStatus: 'K' as const, dependents: 1, baseSalary: 8200000 },
      { name: 'Indra Wijaya', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 7500000 },
      { name: 'Joko Susilo', gender: 'L', maritalStatus: 'TK' as const, dependents: 0, baseSalary: 4800000 },
      { name: 'Kartini Sari', gender: 'P', maritalStatus: 'K' as const, dependents: 2, baseSalary: 6500000 },
      { name: 'Lukman Hakim', gender: 'L', maritalStatus: 'K' as const, dependents: 1, baseSalary: 10200000 },
      { name: 'Maya Anggraini', gender: 'P', maritalStatus: 'TK' as const, dependents: 0, baseSalary: 5200000 },
      { name: 'Nur Azizah', gender: 'P', maritalStatus: 'K' as const, dependents: 3, baseSalary: 7800000 },
      { name: 'Oki Firmansyah', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 8900000 },
      { name: 'Putri Damayanti', gender: 'P', maritalStatus: 'TK' as const, dependents: 0, baseSalary: 6200000 },
      { name: 'Rahmat Hidayat', gender: 'L', maritalStatus: 'K' as const, dependents: 1, baseSalary: 5600000 },
      { name: 'Sukarman', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 4500000 },
      { name: 'Taufik Rahman', gender: 'L', maritalStatus: 'K' as const, dependents: 2, baseSalary: 9800000 },
      { name: 'Umi Kalsum', gender: 'P', maritalStatus: 'K' as const, dependents: 1, baseSalary: 7400000 },
    ];
    
    const divisions = [
      { name: 'Aek Loba', code: '1' },
      { name: 'Bangun Bandar', code: '3' },
      { name: 'Tanah Gambus', code: '5' },
      { name: 'Aek Pamienke', code: '2' },
    ];
    
    const months = [
      { month: 1, days: 31, monthYear: '2025-01' },
      { month: 2, days: 28, monthYear: '2025-02' },
      { month: 3, days: 31, monthYear: '2025-03' },
      { month: 4, days: 30, monthYear: '2025-04' },
      { month: 5, days: 31, monthYear: '2025-05' },
      { month: 6, days: 30, monthYear: '2025-06' },
      { month: 7, days: 31, monthYear: '2025-07' },
      { month: 8, days: 31, monthYear: '2025-08' },
      { month: 9, days: 30, monthYear: '2025-09' },
      { month: 10, days: 31, monthYear: '2025-10' },
      { month: 11, days: 30, monthYear: '2025-11' },
      { month: 12, days: 31, monthYear: '2025-12' },
    ];
    
    // Generate data for each division
    divisions.forEach((division) => {
      // Each division has 15 employees
      for (let empIndex = 0; empIndex < 15; empIndex++) {
        const template = employeeTemplates[empIndex % employeeTemplates.length];
        
        // Each employee appears in 1 specific month (distributed across the year)
        const monthIndex = empIndex % 12;
        const monthData = months[monthIndex];
        
        const fixedIncome = template.baseSalary;
        const hasOvertime = empIndex % 4 === 0;
        const hasBonus = empIndex % 7 === 0;
        const overtimeBenefit = hasOvertime ? Math.floor(fixedIncome * 0.15) : 0;
        const bonus = hasBonus ? Math.floor(fixedIncome * 0.2) : 0;
        const thr = Math.floor(fixedIncome * 0.01);
        
        const totalGross = fixedIncome + overtimeBenefit + bonus + thr;
        const positionCost = Math.min(totalGross * 0.05, 500000);
        const pensionFund = Math.floor(fixedIncome * 0.04);
        const netIncome = totalGross - positionCost - pensionFund;
        
        const yearlyNetIncome = netIncome * 12;
        const ptkp = getPTKP(template.maritalStatus, template.dependents);
        const pkp = Math.max(0, yearlyNetIncome - ptkp);
        
        // Calculate PPh 21
        let pph21Yearly = 0;
        if (pkp > 0) {
          if (pkp <= 60000000) {
            pph21Yearly = pkp * 0.05;
          } else if (pkp <= 250000000) {
            pph21Yearly = 3000000 + (pkp - 60000000) * 0.15;
          } else if (pkp <= 500000000) {
            pph21Yearly = 31500000 + (pkp - 250000000) * 0.25;
          } else {
            pph21Yearly = 94000000 + (pkp - 500000000) * 0.30;
          }
        }
        
        const pph21Monthly = Math.floor(pph21Yearly / 12);
        
        employees.push({
          no: counter++,
          branch: '10',
          name: `${template.name} (${division.name})`,
          npwp: `${10 + empIndex}.${234 + empIndex}.${567 + empIndex}.${counter % 10}-${100 + parseInt(division.code)}.000`,
          address: `Jl. Raya ${division.name} No. ${counter * 10}, Medan`,
          gender: template.gender,
          maritalStatus: template.maritalStatus,
          dependents: template.dependents,
          division: division.name,
          period: {
            from: `01/${monthData.month.toString().padStart(2, '0')}/2025`,
            to: `${monthData.days}/${monthData.month.toString().padStart(2, '0')}/2025`,
            days: monthData.days,
            monthYear: monthData.monthYear,
          },
          incomeByCompany: {
            fixedIncome,
            overtimeBenefit,
            bonus,
            thr,
            totalGross,
            positionCost,
            pensionFund,
            netIncome,
          },
          selfPaidIncome: {
            grossIncome: 0,
            deduction: 0,
            netIncome: 0,
          },
          yearlyNetIncome,
          ptkp,
          pkp,
          pph21Yearly,
          pph21Monthly,
          pph21Withheld: 0,
          pph21Payable: pph21Monthly,
        });
      }
    });
    
    return employees;
  };

  const taxData: TaxEmployee[] = generateTaxData();

  // Filter data based on mode, period, and division
  const filteredData = useMemo(() => {
    return taxData.filter(emp => {
      // Filter by period
      if (filterMode === 'single') {
        if (emp.period.monthYear !== selectedMonth) return false;
      } else {
        // Range mode
        if (emp.period.monthYear < startMonth || emp.period.monthYear > endMonth) return false;
      }
      
      // Filter by division
      if (selectedDivision !== 'all' && emp.division !== selectedDivision) return false;
      
      return true;
    });
  }, [taxData, filterMode, selectedMonth, startMonth, endMonth, selectedDivision]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', { minimumFractionDigits: 0 });
  };

  const calculateTotal = (field: string) => {
    return filteredData.reduce((sum, emp) => {
      // Handle nested fields
      if (field.includes('.')) {
        const keys = field.split('.');
        let value: any = emp;
        for (const key of keys) {
          value = value?.[key];
        }
        return sum + (Number(value) || 0);
      }
      return sum + (Number(emp[field as keyof TaxEmployee]) || 0);
    }, 0);
  };

  // Generate month options
  const monthOptions = [
    { value: '2025-01', label: 'Januari 2025' },
    { value: '2025-02', label: 'Februari 2025' },
    { value: '2025-03', label: 'Maret 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-05', label: 'Mei 2025' },
    { value: '2025-06', label: 'Juni 2025' },
    { value: '2025-07', label: 'Juli 2025' },
    { value: '2025-08', label: 'Agustus 2025' },
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-10', label: 'Oktober 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-12', label: 'Desember 2025' },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Tax Worksheet</h1>
        <p className="text-muted-foreground">PT. Socfin Indonesia - Bangun Bandar</p>
        <p className="text-xs text-muted-foreground mt-1">Daftar Pemotongan Pajak Penghasilan Pasal 21</p>
      </div>

      <Card className="shadow-sm mb-4">
        <div className="p-4 md:p-6 border-b border-border">
          {/* Filter Mode Selection */}
          <div className="mb-4 pb-4 border-b border-border">
            <Label className="mb-3 block">Mode Filter Periode:</Label>
            <RadioGroup 
              value={filterMode} 
              onValueChange={(value: 'single' | 'range') => setFilterMode(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="cursor-pointer">1 Bulan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="range" id="range" />
                <Label htmlFor="range" className="cursor-pointer">Periode (Bulan Awal - Akhir)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-4">
            {/* Period Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block flex items-center gap-2">
                  <Calendar size={14} />
                  {filterMode === 'single' ? 'Pilih Bulan' : 'Bulan Awal'}
                </Label>
                {filterMode === 'single' ? (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {filterMode === 'range' && (
                <div className="flex-1 min-w-[200px]">
                  <Label className="mb-2 block flex items-center gap-2">
                    <Calendar size={14} />
                    Bulan Akhir
                  </Label>
                  <Select value={endMonth} onValueChange={setEndMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Division Filter */}
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block">Filter Divisi/Estate</Label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Divisi</SelectItem>
                    {MASTER_DIVISIONS.filter(d => d.isActive).map(division => (
                      <SelectItem key={division.id} value={division.name}>
                        {division.shortname} - {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Info */}
            <div className="bg-muted/50 p-3 rounded-md space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Menampilkan:</span>{' '}
                <span className="font-medium">{filteredData.length} karyawan</span>
                {filterMode === 'single' && (
                  <span className="text-muted-foreground">
                    {' '}untuk bulan {monthOptions.find(m => m.value === selectedMonth)?.label}
                  </span>
                )}
                {filterMode === 'range' && (
                  <span className="text-muted-foreground">
                    {' '}untuk periode {monthOptions.find(m => m.value === startMonth)?.label} - {monthOptions.find(m => m.value === endMonth)?.label}
                  </span>
                )}
                {selectedDivision !== 'all' && (
                  <span className="text-muted-foreground"> di {selectedDivision}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                <Move size={12} className="inline" />
                Tip: Klik dan drag pada tabel untuk menggeser ke kiri/kanan
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer size={16} />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet size={16} />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button size="sm" className="gap-2">
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          <div className="min-w-[3800px]">
            <table className="w-full text-[10px] border-collapse">
              <thead className="sticky top-0 bg-muted/50">
                <tr>
                  {/* Basic Info */}
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[35px]">No</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[60px]">No. Cabang</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[160px]">N A M A</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[120px]">N P W P</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[180px]">Alamat</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[35px]">L/P</th>
                  
                  {/* Status Kawin */}
                  <th colSpan={2} rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#e3f2fd]">Status Kawin</th>
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-muted min-w-[50px]">ANAK/<br/>TAN</th>
                  
                  {/* Masa Perolehan PPh */}
                  <th colSpan={4} className="px-2 py-2 text-center border border-border bg-[#fff3e0]">Masa Perolehan PPh</th>
                  
                  {/* Penghasilan Yang PPh 21 nya dipotong oleh Pemberi Kerja */}
                  <th colSpan={7} className="px-2 py-2 text-center border border-border bg-[#e8f5e9]">Penghasilan Yang PPh 21 nya dipotong oleh Pemberi Kerja</th>
                  
                  {/* Penghasilan Yang PPh 21 nya dibayar/disetor Sendiri */}
                  <th colSpan={3} className="px-2 py-2 text-center border border-border bg-[#f3e5f5]">Penghasilan Yang PPh 21 nya<br/>dibayar/disetor Sendiri</th>
                  
                  {/* Jumlah Kum. Penghasilan Netto (Total PPh) */}
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-[#ffeb3b]/30 min-w-[100px]">Jumlah Kum.<br/>Penghasilan<br/>Netto (RP)<br/>Setahun/Diset...</th>
                  
                  {/* PTKP */}
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-[#ffebee] min-w-[100px]">PTKP</th>
                  
                  {/* PKP */}
                  <th rowSpan={3} className="px-2 py-3 text-center border border-border bg-[#e0f2f1] min-w-[100px]">PKP</th>
                  
                  {/* PPh 21 Terutang */}
                  <th colSpan={4} className="px-2 py-2 text-center border border-border bg-[#ffcdd2]">PPh 21 Dipotong</th>
                </tr>
                
                {/* Row 2 */}
                <tr>
                  {/* Masa Perolehan PPh - Row 2 */}
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#fff3e0] min-w-[60px]">Dari</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#fff3e0] min-w-[60px]">s/d</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#fff3e0] min-w-[45px]">L/D<br/>(hari)</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#fff3e0] min-w-[60px]">Gaji</th>
                  
                  {/* Penghasilan Pemberi Kerja - Row 2 */}
                  <th colSpan={4} className="px-2 py-2 text-center border border-border bg-[#e8f5e9]">yang menjadi Dasar Pengenaan Tarif PPh</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Bruto</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Pengurang</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Netto</th>
                  
                  {/* Penghasilan Sendiri - Row 2 */}
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#f3e5f5] min-w-[95px]">Bruto</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#f3e5f5] min-w-[95px]">Pengurang</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#f3e5f5] min-w-[95px]">Netto</th>
                  
                  {/* PPh 21 Dipotong - Row 2 */}
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#ffcdd2] min-w-[95px]">PPh 21<br/>Setahun</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#ffcdd2] min-w-[95px]">PPh 21<br/>Sebulan</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#ffcdd2] min-w-[95px]">PPh 21<br/>Dipotong</th>
                  <th rowSpan={2} className="px-2 py-2 text-center border border-border bg-[#ffcdd2] min-w-[95px]">PPh 21<br/>Terutang</th>
                </tr>
                
                {/* Row 3 */}
                <tr>
                  {/* Status Kawin - Row 3 */}
                  <th className="px-2 py-2 text-center border border-border bg-[#e3f2fd] min-w-[35px]">K</th>
                  <th className="px-2 py-2 text-center border border-border bg-[#e3f2fd] min-w-[35px]">TK</th>
                  
                  {/* Dasar Pengenaan - Row 3 */}
                  <th className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Gaji Tetap</th>
                  <th className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Lembur &<br/>Benefit</th>
                  <th className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">Bonus</th>
                  <th className="px-2 py-2 text-center border border-border bg-[#e8f5e9] min-w-[95px]">THR</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={28} className="px-4 py-8 text-center text-muted-foreground">
                      Tidak ada data untuk filter yang dipilih
                    </td>
                  </tr>
                ) : (
                  filteredData.map((emp, index) => (
                  <tr 
                    key={emp.no} 
                    className="border-b border-border hover:bg-muted/30"
                  >
                    {/* Basic Info */}
                    <td className="px-2 py-2 text-center border border-border">{index + 1}</td>
                    <td className="px-2 py-2 text-center border border-border">{emp.branch}</td>
                    <td className="px-2 py-2 border border-border">{emp.name}</td>
                    <td className="px-2 py-2 text-center border border-border text-[9px]">{emp.npwp}</td>
                    <td className="px-2 py-2 border border-border text-[9px]">{emp.address}</td>
                    <td className="px-2 py-2 text-center border border-border">{emp.gender}</td>
                    
                    {/* Status Kawin */}
                    <td className="px-2 py-2 text-center border border-border bg-[#e3f2fd]/10">
                      {emp.maritalStatus === 'K' ? '√' : ''}
                    </td>
                    <td className="px-2 py-2 text-center border border-border bg-[#e3f2fd]/10">
                      {emp.maritalStatus === 'TK' ? '√' : ''}
                    </td>
                    <td className="px-2 py-2 text-center border border-border">{emp.dependents}</td>
                    
                    {/* Masa Perolehan */}
                    <td className="px-2 py-2 text-center border border-border bg-[#fff3e0]/10 text-[9px]">
                      {emp.period.from}
                    </td>
                    <td className="px-2 py-2 text-center border border-border bg-[#fff3e0]/10 text-[9px]">
                      {emp.period.to}
                    </td>
                    <td className="px-2 py-2 text-center border border-border bg-[#fff3e0]/10">
                      {emp.period.days}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#fff3e0]/10">
                      {formatCurrency(emp.incomeByCompany.fixedIncome)}
                    </td>
                    
                    {/* Penghasilan Pemberi Kerja */}
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/10">
                      {formatCurrency(emp.incomeByCompany.fixedIncome)}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/10">
                      {emp.incomeByCompany.overtimeBenefit > 0 ? formatCurrency(emp.incomeByCompany.overtimeBenefit) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/10">
                      {emp.incomeByCompany.bonus > 0 ? formatCurrency(emp.incomeByCompany.bonus) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/10">
                      {formatCurrency(emp.incomeByCompany.thr)}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/20 font-medium">
                      {formatCurrency(emp.incomeByCompany.totalGross)}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/10">
                      {formatCurrency(emp.incomeByCompany.positionCost + emp.incomeByCompany.pensionFund)}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#e8f5e9]/20 font-medium">
                      {formatCurrency(emp.incomeByCompany.netIncome)}
                    </td>
                    
                    {/* Penghasilan Sendiri */}
                    <td className="px-2 py-2 text-right border border-border bg-[#f3e5f5]/10">
                      {emp.selfPaidIncome.grossIncome > 0 ? formatCurrency(emp.selfPaidIncome.grossIncome) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#f3e5f5]/10">
                      {emp.selfPaidIncome.deduction > 0 ? formatCurrency(emp.selfPaidIncome.deduction) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#f3e5f5]/10">
                      {emp.selfPaidIncome.netIncome > 0 ? formatCurrency(emp.selfPaidIncome.netIncome) : '-'}
                    </td>
                    
                    {/* Penghasilan Netto Setahun */}
                    <td className="px-2 py-2 text-right border border-border bg-[#ffeb3b]/20 font-medium">
                      {formatCurrency(emp.yearlyNetIncome)}
                    </td>
                    
                    {/* PTKP */}
                    <td className="px-2 py-2 text-right border border-border bg-[#ffebee]/10">
                      {formatCurrency(emp.ptkp)}
                    </td>
                    
                    {/* PKP */}
                    <td className="px-2 py-2 text-right border border-border bg-[#e0f2f1]/20 font-medium">
                      {emp.pkp > 0 ? formatCurrency(emp.pkp) : '-'}
                    </td>
                    
                    {/* PPh 21 */}
                    <td className="px-2 py-2 text-right border border-border bg-[#ffcdd2]/10">
                      {emp.pph21Yearly > 0 ? formatCurrency(emp.pph21Yearly) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#ffcdd2]/10">
                      {emp.pph21Monthly > 0 ? formatCurrency(emp.pph21Monthly) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#ffcdd2]/10">
                      {emp.pph21Withheld > 0 ? formatCurrency(emp.pph21Withheld) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right border border-border bg-[#ffcdd2]/30 font-semibold">
                      {emp.pph21Payable > 0 ? formatCurrency(emp.pph21Payable) : '-'}
                    </td>
                  </tr>
                  ))
                )}
                
                {/* Total Row */}
                {filteredData.length > 0 && (
                <tr className="bg-primary/10 border-t-2 border-primary">
                  <td colSpan={9} className="px-2 py-3 border border-border font-semibold text-center">
                    J U M L A H
                  </td>
                  
                  {/* Periode totals - skip dates */}
                  <td colSpan={3} className="px-2 py-3 border border-border"></td>
                  <td className="px-2 py-3 text-right border border-border bg-[#fff3e0]/30 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.fixedIncome'))}
                  </td>
                  
                  {/* Penghasilan Pemberi Kerja Totals */}
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/30 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.fixedIncome'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/30 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.overtimeBenefit'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/30 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.bonus'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/30 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.thr'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/40 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.totalGross'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/30 font-semibold">
                    {formatCurrency(filteredData.reduce((sum, emp) => 
                      sum + emp.incomeByCompany.positionCost + emp.incomeByCompany.pensionFund, 0
                    ))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e8f5e9]/40 font-semibold">
                    {formatCurrency(calculateTotal('incomeByCompany.netIncome'))}
                  </td>
                  
                  {/* Penghasilan Sendiri Totals */}
                  <td className="px-2 py-3 text-right border border-border bg-[#f3e5f5]/30 font-semibold">
                    {formatCurrency(calculateTotal('selfPaidIncome.grossIncome'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#f3e5f5]/30 font-semibold">
                    {formatCurrency(calculateTotal('selfPaidIncome.deduction'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#f3e5f5]/30 font-semibold">
                    {formatCurrency(calculateTotal('selfPaidIncome.netIncome'))}
                  </td>
                  
                  {/* Total Netto & PTKP */}
                  <td className="px-2 py-3 text-right border border-border bg-[#ffeb3b]/40 font-semibold">
                    {formatCurrency(calculateTotal('yearlyNetIncome'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#ffebee]/30 font-semibold">
                    {formatCurrency(calculateTotal('ptkp'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#e0f2f1]/40 font-semibold">
                    {formatCurrency(calculateTotal('pkp'))}
                  </td>
                  
                  {/* PPh 21 Totals */}
                  <td className="px-2 py-3 text-right border border-border bg-[#ffcdd2]/30 font-semibold">
                    {formatCurrency(calculateTotal('pph21Yearly'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#ffcdd2]/30 font-semibold">
                    {formatCurrency(calculateTotal('pph21Monthly'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#ffcdd2]/30 font-semibold">
                    {formatCurrency(calculateTotal('pph21Withheld'))}
                  </td>
                  <td className="px-2 py-3 text-right border border-border bg-[#ffcdd2]/50 font-semibold">
                    {formatCurrency(calculateTotal('pph21Payable'))}
                  </td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Footer Notes */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p className="mb-2">Keterangan:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>K = Kawin, TK = Tidak Kawin</li>
          <li>ANAK/TAN = Jumlah Anak/Tanggungan (maksimal 3)</li>
          <li>L/D = Lama hari kerja dalam periode</li>
          <li>Biaya Jabatan = 5% dari penghasilan bruto (maksimal Rp 500.000/bulan atau Rp 6.000.000/tahun)</li>
          <li>PTKP dihitung berdasarkan status perkawinan dan jumlah tanggungan</li>
        </ul>
      </div>
    </div>
  );
}
