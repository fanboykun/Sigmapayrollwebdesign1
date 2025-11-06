/**
 * QueueSlip Component
 *
 * Print-ready queue slip / struk antrian klinik
 *
 * Features:
 * - Compact print layout (thermal printer friendly)
 * - QR code for registration number
 * - Patient info, queue number, date/time
 * - Print button with browser print dialog
 * - Responsive preview
 */

import { useRef } from 'react'
import { Printer, Calendar, Clock, User, Activity, QrCode } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { ClinicRegistration, Patient } from '../../types/clinic-registration'

interface Props {
  registration: ClinicRegistration
  patient: Patient
  onClose?: () => void
}

export function QueueSlip({ registration, patient, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'company':
        return 'Ditanggung Perusahaan'
      case 'bpjs':
        return 'BPJS Kesehatan'
      case 'cash':
        return 'Tunai'
      case 'insurance':
        return 'Asuransi'
      default:
        return '-'
    }
  }

  const getServiceTypeLabel = (type?: string) => {
    switch (type) {
      case 'consultation':
        return 'Konsultasi'
      case 'medical_checkup':
        return 'Medical Check-up'
      case 'emergency':
        return 'Darurat'
      case 'follow_up':
        return 'Kontrol'
      default:
        return type || '-'
    }
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #queue-slip, #queue-slip * {
            visibility: visible;
          }
          #queue-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Preview Card (Hidden on Print) */}
      <Card className="max-w-md mx-auto p-6 space-y-4 no-print">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview Slip Antrian</h3>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
        </div>

        {/* The actual slip content */}
        <div
          id="queue-slip"
          ref={printRef}
          className="border-2 border-dashed border-muted p-6 space-y-4 bg-white"
          style={{ fontFamily: 'monospace' }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3">
            <h1 className="text-xl font-bold">KLINIK PT. SOCFINDO</h1>
            <p className="text-sm">Jl. Perkebunan Raya No. 123</p>
            <p className="text-sm">Telp: (061) 1234567</p>
          </div>

          {/* Queue Number - BIG */}
          <div className="text-center py-4 border-2 border-black">
            <div className="text-xs text-muted-foreground mb-1">NOMOR ANTRIAN</div>
            <div className="text-5xl font-bold tracking-wider">
              {registration.queue_display}
            </div>
          </div>

          {/* Registration Info */}
          <div className="space-y-2 text-sm border-b border-dashed border-gray-400 pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Registrasi:</span>
              <span className="font-medium">{registration.registration_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span className="font-medium">
                {format(new Date(registration.registration_date), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu:</span>
              <span className="font-medium">
                {format(new Date(registration.registration_time), 'HH:mm', {
                  locale: localeId,
                })} WIB
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-2 text-sm border-b border-dashed border-gray-400 pb-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">PASIEN</div>
              <div className="font-bold">{patient.full_name}</div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Pasien:</span>
              <span className="font-medium">{patient.patient_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usia / JK:</span>
              <span className="font-medium">
                {patient.age} tahun / {patient.gender === 'male' ? 'L' : 'P'}
              </span>
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-2 text-sm border-b border-dashed border-gray-400 pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layanan:</span>
              <span className="font-medium">{getServiceTypeLabel(registration.service_type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pembayaran:</span>
              <span className="font-medium">{getPaymentMethodLabel(registration.payment_method)}</span>
            </div>
            {registration.estimated_wait_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Tunggu:</span>
                <span className="font-medium">~{registration.estimated_wait_time} menit</span>
              </div>
            )}
          </div>

          {/* Complaint */}
          {registration.complaint && (
            <div className="space-y-1 text-sm border-b border-dashed border-gray-400 pb-3">
              <div className="text-xs text-muted-foreground">KELUHAN</div>
              <div className="text-xs">{registration.complaint}</div>
            </div>
          )}

          {/* QR Code Placeholder */}
          <div className="flex justify-center py-3 border-b border-dashed border-gray-400">
            <div className="border-2 border-black p-2">
              <QrCode className="h-16 w-16" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs space-y-1 pt-2">
            <p className="font-semibold">Harap tunggu nomor antrian Anda dipanggil</p>
            <p className="text-muted-foreground">Terima kasih atas kunjungan Anda</p>
            <p className="text-muted-foreground mt-2">
              {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>

          {/* Barcode representation */}
          <div className="text-center">
            <div className="inline-block border-2 border-black px-3 py-1">
              <div className="text-xs font-mono tracking-widest">
                {registration.registration_number}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Cetak Slip
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Tutup
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded">
          <p className="font-semibold">Instruksi Cetak:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ukuran kertas: 80mm (thermal printer)</li>
            <li>Atau cetak pada A4/Letter, potong sesuai garis</li>
            <li>Pastikan printer terkoneksi dengan baik</li>
          </ul>
        </div>
      </Card>
    </>
  )
}
