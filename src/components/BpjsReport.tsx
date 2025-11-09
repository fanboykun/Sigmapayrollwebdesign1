import { useState } from 'react';
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Printer, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { MASTER_EMPLOYEES } from '../shared/employeeData';
import { calculateBPJSKesehatan, calculateBPJSKetenagakerjaan, BPJS_RATES } from '../shared/taxBpjsData';

interface BpjsEmployee {
  nik: string;
  name: string;
  division: string;
  position: string;
  dateOfBirth: string;
  dateJoined: string;
  bpjsKesehatanNo: string;
  baseSalary: number;
  // BPJS Kesehatan
  bpjsKesehatanEmployee: number;
  bpjsKesehatanEmployer: number;
  bpjsKesehatanTotal: number;
  // BPJS Ketenagakerjaan
  bpjsKetenagakerjaanEmployee: number;
  bpjsKetenagakerjaanEmployer: number;
  bpjsKetenagakerjaanTotal: number;
}

export function BpjsReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-10');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>(['Divisi 1', 'Divisi 2', 'Divisi 3']);

  // Generate BPJS data from master employees
  const bpjsData: BpjsEmployee[] = MASTER_EMPLOYEES.map(emp => {
    const kesehatan = calculateBPJSKesehatan(emp.baseSalary);
    const ketenagakerjaan = calculateBPJSKetenagakerjaan(emp.baseSalary);

    return {
      nik: emp.employeeId,
      name: emp.fullName,
      division: emp.division,
      position: emp.position,
      dateOfBirth: emp.dateOfBirth,
      dateJoined: emp.dateJoined,
      bpjsKesehatanNo: `0001491${Math.floor(Math.random() * 100000)}`,
      baseSalary: emp.baseSalary,
      bpjsKesehatanEmployee: kesehatan.employee,
      bpjsKesehatanEmployer: kesehatan.employer,
      bpjsKesehatanTotal: kesehatan.total,
      bpjsKetenagakerjaanEmployee: ketenagakerjaan.employee,
      bpjsKetenagakerjaanEmployer: ketenagakerjaan.employer,
      bpjsKetenagakerjaanTotal: ketenagakerjaan.total,
    };
  });

  // Filter data
  const filteredData = bpjsData.filter(emp =>
    selectedDivision === 'all' || emp.division === selectedDivision
  );

  // Get unique divisions
  const divisions = Array.from(new Set(bpjsData.map(emp => emp.division))).sort();

  // Toggle division expansion
  const toggleDivision = (division: string) => {
    setExpandedDivisions(prev =>
      prev.includes(division)
        ? prev.filter(d => d !== division)
        : [...prev, division]
    );
  };

  // Calculate totals for BPJS Kesehatan
  const totalKesehatanEmployee = filteredData.reduce((sum, emp) => sum + emp.bpjsKesehatanEmployee, 0);
  const totalKesehatanEmployer = filteredData.reduce((sum, emp) => sum + emp.bpjsKesehatanEmployer, 0);
  const totalKesehatan = totalKesehatanEmployee + totalKesehatanEmployer;

  // Calculate totals for BPJS Ketenagakerjaan
  const totalKetenagakerjaanEmployee = filteredData.reduce((sum, emp) => sum + emp.bpjsKetenagakerjaanEmployee, 0);
  const totalKetenagakerjaanEmployer = filteredData.reduce((sum, emp) => sum + emp.bpjsKetenagakerjaanEmployer, 0);
  const totalKetenagakerjaan = totalKetenagakerjaanEmployee + totalKetenagakerjaanEmployer;

  // Get BPJS rates info
  const bpjsKesehatanRate = BPJS_RATES.find(b => b.type === 'kesehatan');
  const bpjsJPRate = BPJS_RATES.find(b => b.type === 'ketenagakerjaan-jp');
  const bpjsJKKRate = BPJS_RATES.find(b => b.type === 'ketenagakerjaan-jkk');
  const bpjsJKMRate = BPJS_RATES.find(b => b.type === 'ketenagakerjaan-jkm');

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl font-bold mb-1">Laporan BPJS</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan kontribusi BPJS Kesehatan dan Ketenagakerjaan karyawan
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="shadow-sm mb-4">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-wrap gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-10">Oktober 2025</SelectItem>
                <SelectItem value="2025-09">September 2025</SelectItem>
                <SelectItem value="2025-08">Agustus 2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map(div => (
                  <SelectItem key={div} value={div}>{div}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="kesehatan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kesehatan">BPJS Kesehatan</TabsTrigger>
          <TabsTrigger value="ketenagakerjaan">BPJS Ketenagakerjaan</TabsTrigger>
        </TabsList>

        {/* BPJS Kesehatan Tab */}
        <TabsContent value="kesehatan">
          <Card className="shadow-sm">
            <div className="p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">BPJS Kesehatan</h3>
                  <p className="text-sm text-muted-foreground">
                    Iuran: Karyawan {bpjsKesehatanRate?.employeeRate}% | Perusahaan {bpjsKesehatanRate?.employerRate}%
                    {bpjsKesehatanRate?.maxSalary && ` | Max: Rp ${bpjsKesehatanRate.maxSalary.toLocaleString('id-ID')}`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold bg-muted/50">Divisi</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">NIK</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Nama Karyawan</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">No. BPJS Kes</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Tanggal Lahir</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Tanggal Masuk</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Jabatan</th>
                        <th className="text-right p-3 font-semibold bg-[#e3f2fd]">Gaji Pokok</th>
                        <th className="text-right p-3 font-semibold bg-[#e3f2fd]">Iuran Karyawan<br/>(1%)</th>
                        <th className="text-right p-3 font-semibold bg-[#fff3e0]">Iuran Perusahaan<br/>(4%)</th>
                        <th className="text-right p-3 font-semibold bg-[#e8f5e9]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisions.map(division => {
                        const divisionEmployees = filteredData.filter(emp => emp.division === division);
                        const isExpanded = expandedDivisions.includes(division);

                        if (divisionEmployees.length === 0) return null;

                        const divTotal = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKesehatanTotal, 0);
                        const divEmployee = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKesehatanEmployee, 0);
                        const divEmployer = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKesehatanEmployer, 0);

                        return (
                          <React.Fragment key={division}>
                            {/* Division Header */}
                            <tr
                              className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-y border-border"
                              onClick={() => toggleDivision(division)}
                            >
                              <td className="p-3 font-semibold" colSpan={7}>
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                  {division} ({divisionEmployees.length} karyawan)
                                </div>
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {divisionEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString('id-ID')}
                              </td>
                              <td className="p-3 text-right font-semibold">{divEmployee.toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right font-semibold">{divEmployer.toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right font-semibold">{divTotal.toLocaleString('id-ID')}</td>
                            </tr>

                            {/* Division Employees */}
                            {isExpanded && divisionEmployees.map((emp, idx) => (
                              <tr
                                key={emp.nik}
                                className={`border-b border-border/50 hover:bg-muted/20 ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}
                              >
                                <td className="p-3 text-sm"></td>
                                <td className="p-3 text-sm font-mono">{emp.nik}</td>
                                <td className="p-3 text-sm">{emp.name}</td>
                                <td className="p-3 text-sm font-mono">{emp.bpjsKesehatanNo}</td>
                                <td className="p-3 text-sm">{emp.dateOfBirth}</td>
                                <td className="p-3 text-sm">{emp.dateJoined}</td>
                                <td className="p-3 text-sm">{emp.position}</td>
                                <td className="p-3 text-sm text-right">{emp.baseSalary.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right">{emp.bpjsKesehatanEmployee.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right">{emp.bpjsKesehatanEmployer.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right font-semibold">{emp.bpjsKesehatanTotal.toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}

                      {/* Grand Total */}
                      <tr className="bg-primary text-primary-foreground font-bold border-t-2 border-border">
                        <td colSpan={7} className="p-3">TOTAL KESELURUHAN</td>
                        <td className="p-3 text-right">
                          {filteredData.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right">{totalKesehatanEmployee.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right">{totalKesehatanEmployer.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right">{totalKesehatan.toLocaleString('id-ID')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Cards for Kesehatan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Iuran Karyawan</p>
              <h3 className="text-2xl font-bold text-blue-600">
                Rp {totalKesehatanEmployee.toLocaleString('id-ID')}
              </h3>
            </Card>
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Iuran Perusahaan</p>
              <h3 className="text-2xl font-bold text-orange-600">
                Rp {totalKesehatanEmployer.toLocaleString('id-ID')}
              </h3>
            </Card>
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Keseluruhan</p>
              <h3 className="text-2xl font-bold text-green-600">
                Rp {totalKesehatan.toLocaleString('id-ID')}
              </h3>
            </Card>
          </div>
        </TabsContent>

        {/* BPJS Ketenagakerjaan Tab */}
        <TabsContent value="ketenagakerjaan">
          <Card className="shadow-sm">
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">BPJS Ketenagakerjaan</h3>
                <p className="text-sm text-muted-foreground">
                  Terdiri dari: JKK ({bpjsJKKRate?.employerRate}% perusahaan),
                  JKM ({bpjsJKMRate?.employerRate}% perusahaan),
                  JP ({bpjsJPRate?.employeeRate}% karyawan + {bpjsJPRate?.employerRate}% perusahaan)
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold bg-muted/50">Divisi</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">NIK</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Nama Karyawan</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Tanggal Lahir</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Tanggal Masuk</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">Jabatan</th>
                        <th className="text-right p-3 font-semibold bg-[#e3f2fd]">Gaji Pokok</th>
                        <th className="text-right p-3 font-semibold bg-[#e3f2fd]">Iuran Karyawan<br/>(JP 1%)</th>
                        <th className="text-right p-3 font-semibold bg-[#fff3e0]">Iuran Perusahaan<br/>(JKK+JKM+JP)</th>
                        <th className="text-right p-3 font-semibold bg-[#e8f5e9]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisions.map(division => {
                        const divisionEmployees = filteredData.filter(emp => emp.division === division);
                        const isExpanded = expandedDivisions.includes(division);

                        if (divisionEmployees.length === 0) return null;

                        const divTotal = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKetenagakerjaanTotal, 0);
                        const divEmployee = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKetenagakerjaanEmployee, 0);
                        const divEmployer = divisionEmployees.reduce((sum, emp) => sum + emp.bpjsKetenagakerjaanEmployer, 0);

                        return (
                          <React.Fragment key={division}>
                            {/* Division Header */}
                            <tr
                              className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-y border-border"
                              onClick={() => toggleDivision(division)}
                            >
                              <td className="p-3 font-semibold" colSpan={6}>
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                  {division} ({divisionEmployees.length} karyawan)
                                </div>
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {divisionEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString('id-ID')}
                              </td>
                              <td className="p-3 text-right font-semibold">{divEmployee.toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right font-semibold">{divEmployer.toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right font-semibold">{divTotal.toLocaleString('id-ID')}</td>
                            </tr>

                            {/* Division Employees */}
                            {isExpanded && divisionEmployees.map((emp, idx) => (
                              <tr
                                key={emp.nik}
                                className={`border-b border-border/50 hover:bg-muted/20 ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}
                              >
                                <td className="p-3 text-sm"></td>
                                <td className="p-3 text-sm font-mono">{emp.nik}</td>
                                <td className="p-3 text-sm">{emp.name}</td>
                                <td className="p-3 text-sm">{emp.dateOfBirth}</td>
                                <td className="p-3 text-sm">{emp.dateJoined}</td>
                                <td className="p-3 text-sm">{emp.position}</td>
                                <td className="p-3 text-sm text-right">{emp.baseSalary.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right">{emp.bpjsKetenagakerjaanEmployee.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right">{emp.bpjsKetenagakerjaanEmployer.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-sm text-right font-semibold">{emp.bpjsKetenagakerjaanTotal.toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}

                      {/* Grand Total */}
                      <tr className="bg-primary text-primary-foreground font-bold border-t-2 border-border">
                        <td colSpan={6} className="p-3">TOTAL KESELURUHAN</td>
                        <td className="p-3 text-right">
                          {filteredData.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right">{totalKetenagakerjaanEmployee.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right">{totalKetenagakerjaanEmployer.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right">{totalKetenagakerjaan.toLocaleString('id-ID')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Cards for Ketenagakerjaan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Iuran Karyawan</p>
              <h3 className="text-2xl font-bold text-blue-600">
                Rp {totalKetenagakerjaanEmployee.toLocaleString('id-ID')}
              </h3>
            </Card>
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Iuran Perusahaan</p>
              <h3 className="text-2xl font-bold text-orange-600">
                Rp {totalKetenagakerjaanEmployer.toLocaleString('id-ID')}
              </h3>
            </Card>
            <Card className="p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Keseluruhan</p>
              <h3 className="text-2xl font-bold text-green-600">
                Rp {totalKetenagakerjaan.toLocaleString('id-ID')}
              </h3>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
