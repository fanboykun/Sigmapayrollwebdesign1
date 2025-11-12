/**
 * ==========================================================================
 * CLINIC MODULE - PLACEHOLDER COMPONENT
 * ==========================================================================
 *
 * Temporary placeholder component untuk modul Clinic
 * Akan diganti dengan komponen yang sebenarnya
 *
 * #ClinicModule #Placeholder #UnderDevelopment
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-03
 * ==========================================================================
 */

import React from 'react';
import { Heart, Construction, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface ClinicPlaceholderProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

export function ClinicPlaceholder({ title, description, onBack }: ClinicPlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-emerald-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Modul Clinic
          </h2>

          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {title}
          </h3>

          <p className="text-gray-600 mb-6">
            Modul ini sedang dalam pengembangan. Database schema dan struktur menu sudah siap.
            Komponen UI akan segera dibuat.
          </p>

          <div className="bg-white rounded-lg border border-gray-200 p-4 text-left space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Status Implementasi:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database Migration - Selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Menu Structure - Selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Routing - Selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">UI Components - Dalam Progress</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Anda dapat mulai menguji navigasi menu Clinic di sidebar.
              Database tables sudah siap untuk menerima data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export specific placeholder components untuk setiap view
export function ClinicDashboard() {
  return (
    <ClinicPlaceholder
      title="Dashboard Klinik"
      description="Overview statistik dan aktivitas klinik"
    />
  );
}

export function ClinicMedicines() {
  return (
    <ClinicPlaceholder
      title="Master Data Obat"
      description="Kelola data obat dan kategorinya"
    />
  );
}

export function ClinicSuppliers() {
  return (
    <ClinicPlaceholder
      title="Master Data Supplier"
      description="Kelola data supplier obat"
    />
  );
}

export function ClinicDoctors() {
  return (
    <ClinicPlaceholder
      title="Master Data Dokter"
      description="Kelola data dokter yang bertugas"
    />
  );
}

export function ClinicNurses() {
  return (
    <ClinicPlaceholder
      title="Master Data Perawat"
      description="Kelola data perawat yang bertugas"
    />
  );
}

export function ClinicDiseases() {
  return (
    <ClinicPlaceholder
      title="Master Data Penyakit"
      description="Kelola data penyakit dan diagnosa (ICD-10)"
    />
  );
}

export function ClinicRegistration() {
  return (
    <ClinicPlaceholder
      title="Pendaftaran Pasien"
      description="Registrasi pasien untuk kunjungan"
    />
  );
}

export function ClinicExamination() {
  return (
    <ClinicPlaceholder
      title="Pemeriksaan & Diagnosa"
      description="Rekam medis pemeriksaan dokter"
    />
  );
}

export function ClinicPrescription() {
  return (
    <ClinicPlaceholder
      title="Resep Obat"
      description="Kelola resep obat dari dokter"
    />
  );
}

export function ClinicDispensing() {
  return (
    <ClinicPlaceholder
      title="Penyerahan Obat"
      description="Proses penyerahan obat ke pasien"
    />
  );
}

export function ClinicStock() {
  return (
    <ClinicPlaceholder
      title="Stok Obat"
      description="Monitor dan kelola stok obat"
    />
  );
}

export function ClinicReceiving() {
  return (
    <ClinicPlaceholder
      title="Penerimaan Obat"
      description="Input penerimaan obat dari supplier"
    />
  );
}

// ClinicOpname sudah diimplementasikan di ClinicOpname.tsx
// export function ClinicOpname() {
//   return (
//     <ClinicPlaceholder
//       title="Opname Stok"
//       description="Stock opname periodik"
//     />
//   );
// }

export function ClinicReportVisits() {
  return (
    <ClinicPlaceholder
      title="Laporan Kunjungan"
      description="Laporan data kunjungan pasien"
    />
  );
}

export function ClinicReportDiseases() {
  return (
    <ClinicPlaceholder
      title="Laporan Penyakit Terbanyak"
      description="Analisis penyakit yang sering terjadi"
    />
  );
}

export function ClinicReportMedicines() {
  return (
    <ClinicPlaceholder
      title="Laporan Pemakaian Obat"
      description="Laporan penggunaan obat"
    />
  );
}

export function ClinicReportCosts() {
  return (
    <ClinicPlaceholder
      title="Laporan Biaya Operasional"
      description="Laporan biaya operasional klinik"
    />
  );
}
