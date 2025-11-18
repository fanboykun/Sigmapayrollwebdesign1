/**
 * ==========================================================================
 * WELCOME PAGE - HALAMAN SELAMAT DATANG
 * ==========================================================================
 *
 * Halaman selamat datang default untuk semua user dengan panduan ringkas
 * tentang sistem Sigma Payroll.
 *
 * #WelcomePage #Introduction #GettingStarted
 *
 * @author Sistem Payroll Team
 * @version 1.0.0
 * @since 2025-11-18
 * ==========================================================================
 */

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Shield,
  TrendingUp,
  Sparkles,
  BookOpen,
  Zap,
  Target
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function WelcomePage() {
  const { user } = useAuth();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const keyFeatures = [
    {
      icon: Zap,
      title: "Otomatis & Cepat",
      description: "Kalkulasi gaji otomatis dengan PPh 21, BPJS, dan tunjangan"
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Data terenkripsi dengan sistem otorisasi berbasis role"
    },
    {
      icon: TrendingUp,
      title: "Analitik Real-time",
      description: "Dashboard interaktif dengan data terkini"
    },
    {
      icon: Target,
      title: "Compliance",
      description: "Sesuai dengan peraturan perpajakan dan ketenagakerjaan"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-[#09773A]" />
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name}!
          </h1>
        </div>
        <p className="text-base text-gray-600">
          Selamat datang di <span className="font-semibold text-[#09773A]">Sigma Payroll</span> -
          Socfindo Integrated Governance & Management Application
        </p>
      </div>

      {/* Introduction Card */}
      <Card className="mb-6 border-l-4 border-l-[#09773A]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#09773A]" />
            <CardTitle className="text-lg">Tentang Sigma Payroll</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            Sigma Payroll adalah sistem informasi manajemen penggajian yang dirancang khusus
            untuk industri perkebunan kelapa sawit. Sistem ini mengintegrasikan seluruh proses
            dari manajemen karyawan, perhitungan gaji, hingga pelaporan pajak dan BPJS.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-[#09773A] mt-0.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
