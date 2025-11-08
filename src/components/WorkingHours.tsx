/**
 * WorkingHours.tsx
 *
 * Komponen untuk mengelola Jam Kerja per hari dalam sistem payroll.
 * Digunakan untuk mendefinisikan jumlah jam kerja efektif per hari
 * yang akan digunakan untuk membagi harga satu hari kerja menjadi jam kerja.
 *
 * Fitur utama:
 * - Konfigurasi jam kerja untuk setiap hari dalam seminggu
 * - Default: Senin-Kamis & Sabtu = 7 jam, Jumat = 5 jam, Minggu = 0 jam
 * - Validasi data input
 * - Perhitungan total jam kerja per minggu
 *
 * @module WorkingHours
 * @author Sistem ERP Perkebunan Sawit
 */

import { useState } from "react";
import {
  Clock,
  Save,
  RotateCcw,
  Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { PermissionGuard } from "./PermissionGuard";

/**
 * Interface untuk konfigurasi jam kerja per hari
 */
interface DayHours {
  day: string;
  dayIndonesia: string;
  hours: number;
  isWeekend: boolean;
}

/**
 * Komponen utama WorkingHours
 * Mengelola jam kerja per hari untuk perhitungan payroll
 */
export function WorkingHours() {
  const { user } = useAuth();

  // Default jam kerja sesuai requirement
  const defaultWorkingHours: DayHours[] = [
    { day: "monday", dayIndonesia: "Senin", hours: 7, isWeekend: false },
    { day: "tuesday", dayIndonesia: "Selasa", hours: 7, isWeekend: false },
    { day: "wednesday", dayIndonesia: "Rabu", hours: 7, isWeekend: false },
    { day: "thursday", dayIndonesia: "Kamis", hours: 7, isWeekend: false },
    { day: "friday", dayIndonesia: "Jumat", hours: 5, isWeekend: false },
    { day: "saturday", dayIndonesia: "Sabtu", hours: 7, isWeekend: false },
    { day: "sunday", dayIndonesia: "Minggu", hours: 0, isWeekend: true },
  ];

  const [workingHours, setWorkingHours] = useState<DayHours[]>(defaultWorkingHours);

  /**
   * Handle perubahan jam kerja untuk hari tertentu
   */
  const handleHoursChange = (index: number, value: string) => {
    const hours = parseInt(value) || 0;
    const newWorkingHours = [...workingHours];
    newWorkingHours[index].hours = Math.max(0, Math.min(24, hours)); // Max 24 jam
    setWorkingHours(newWorkingHours);
  };

  /**
   * Reset ke default values
   */
  const handleReset = () => {
    setWorkingHours(defaultWorkingHours);
  };

  /**
   * Simpan konfigurasi jam kerja
   */
  const handleSave = () => {
    // TODO: Implement save to backend/localStorage
    console.log("Saving working hours:", workingHours);
    alert("Konfigurasi jam kerja berhasil disimpan!");
  };

  // Hitung total jam kerja per minggu
  const totalWeeklyHours = workingHours.reduce((sum, day) => sum + day.hours, 0);
  const totalWorkingDays = workingHours.filter(day => day.hours > 0).length;
  const averageHoursPerDay = totalWorkingDays > 0 ? (totalWeeklyHours / totalWorkingDays).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Tentang Pengaturan Jam Kerja</h4>
              <p className="text-sm text-blue-800">
                Pengaturan ini digunakan untuk membagi harga satu hari kerja menjadi jam kerja.
                Konfigurasi default: <strong>Senin-Kamis & Sabtu = 7 jam</strong>, <strong>Jumat = 5 jam</strong>, <strong>Minggu = 0 jam (libur)</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jam Kerja/Minggu</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{totalWeeklyHours} Jam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Akumulasi jam dalam 1 minggu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hari Kerja Aktif</CardDescription>
            <CardTitle className="text-3xl text-green-600">{totalWorkingDays} Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Hari dengan jam kerja &gt; 0
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Jam/Hari</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{averageHoursPerDay} Jam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Jam kerja per hari aktif
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Konfigurasi Jam Kerja per Hari</CardTitle>
              <CardDescription>
                Atur jumlah jam kerja untuk setiap hari dalam seminggu
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Default
              </Button>
              <PermissionGuard module="working_days_master" action="edit">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workingHours.map((dayConfig, index) => (
              <div
                key={dayConfig.day}
                className={`p-4 rounded-lg border-2 ${
                  dayConfig.isWeekend
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-blue-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className={`h-5 w-5 ${dayConfig.isWeekend ? 'text-gray-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <Label className="text-base font-semibold">
                        {dayConfig.dayIndonesia}
                      </Label>
                      {dayConfig.isWeekend && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Libur
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={dayConfig.hours}
                      onChange={(e) => handleHoursChange(index, e.target.value)}
                      className="w-24 text-center text-lg font-semibold"
                    />
                    <span className="text-sm text-muted-foreground w-12">jam</span>

                    {/* Visual Indicator */}
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            dayConfig.hours === 0
                              ? 'bg-gray-400'
                              : dayConfig.hours <= 5
                              ? 'bg-yellow-500'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${(dayConfig.hours / 24) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {((dayConfig.hours / 24) * 100).toFixed(0)}% dari 24 jam
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{totalWeeklyHours}</div>
                <div className="text-sm text-blue-100 mt-1">Jam/Minggu</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{totalWorkingDays}</div>
                <div className="text-sm text-blue-100 mt-1">Hari Kerja</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{averageHoursPerDay}</div>
                <div className="text-sm text-blue-100 mt-1">Rata-rata Jam/Hari</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">Cara Penggunaan</h4>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Atur jumlah jam kerja untuk setiap hari sesuai dengan kebijakan perusahaan</li>
                <li>Nilai default sudah disesuaikan: Senin-Kamis & Sabtu (7 jam), Jumat (5 jam), Minggu (libur)</li>
                <li>Konfigurasi ini akan digunakan untuk menghitung upah per jam dari gaji harian</li>
                <li>Klik <strong>Simpan</strong> untuk menyimpan perubahan</li>
                <li>Klik <strong>Reset Default</strong> untuk mengembalikan ke konfigurasi awal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
