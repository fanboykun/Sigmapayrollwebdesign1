/**
 * SickLetterForm Component
 *
 * Form for creating sick letters (Surat Sakit) from medical examination.
 * Automatically generates attendance records for the sick leave period.
 *
 * Features:
 * - Date range picker for sick leave period
 * - Auto-calculate total days
 * - Diagnosis input with ICD-10 code support
 * - Treatment summary and rest recommendation
 * - Validation for date range
 *
 * @module components/clinic/SickLetterForm
 */

import React, { useState, useEffect } from 'react';
import { Calendar, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

import { calculateTotalDays } from '../../types/sick-letter';
import type { SickLetterFormData } from '../../types/sick-letter';

interface SickLetterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SickLetterFormData) => Promise<void>;
  medicalRecordId: string;
  patientId: string;
  employeeId: string;
  doctorId: string;
  patientName: string;
  employeeName: string;
  employeeCode: string;
  defaultDiagnosis?: string;
}

export function SickLetterForm({
  open,
  onOpenChange,
  onSubmit,
  medicalRecordId,
  patientId,
  employeeId,
  doctorId,
  patientName,
  employeeName,
  employeeCode,
  defaultDiagnosis = '',
}: SickLetterFormProps) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalDays, setTotalDays] = useState(1);
  const [formData, setFormData] = useState({
    diagnosis: defaultDiagnosis,
    treatment_summary: '',
    rest_recommendation: 'Istirahat total di rumah',
    notes: '',
  });

  // Calculate total days when dates change
  useEffect(() => {
    const days = calculateTotalDays(startDate, endDate);
    setTotalDays(days);
  }, [startDate, endDate]);

  // Reset form when defaultDiagnosis changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      diagnosis: defaultDiagnosis,
    }));
  }, [defaultDiagnosis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.diagnosis.trim()) {
      alert('Diagnosis wajib diisi');
      return;
    }

    if (!formData.rest_recommendation.trim()) {
      alert('Rekomendasi istirahat wajib diisi');
      return;
    }

    if (endDate < startDate) {
      alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    setLoading(true);

    try {
      const submitData: SickLetterFormData = {
        medical_record_id: medicalRecordId,
        patient_id: patientId,
        employee_id: employeeId,
        doctor_id: doctorId,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        diagnosis: formData.diagnosis,
        treatment_summary: formData.treatment_summary || undefined,
        rest_recommendation: formData.rest_recommendation,
        notes: formData.notes || undefined,
      };

      await onSubmit(submitData);

      // Reset form
      setFormData({
        diagnosis: '',
        treatment_summary: '',
        rest_recommendation: 'Istirahat total di rumah',
        notes: '',
      });
      setStartDate(new Date());
      setEndDate(new Date());
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting sick letter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Buat Surat Sakit
          </DialogTitle>
          <DialogDescription>
            Buat surat keterangan sakit untuk karyawan. Presensi akan otomatis dibuat untuk periode sakit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Patient/Employee Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold mb-2">Informasi Pasien</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nama Pasien:</span>
                <span className="ml-2 font-medium">{patientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nama Karyawan:</span>
                <span className="ml-2 font-medium">{employeeName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ID Karyawan:</span>
                <span className="ml-2 font-mono font-medium">{employeeCode}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Tanggal Mulai Sakit *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(startDate, 'dd MMM yyyy', { locale: localeId })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Selesai Sakit *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(endDate, 'dd MMM yyyy', { locale: localeId })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      disabled={(date) => date < startDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Total Days Display */}
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Hari Sakit:</span>
                <Badge variant="default" className="text-lg px-4 py-1">
                  {totalDays} Hari
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dari {format(startDate, 'dd MMM yyyy', { locale: localeId })} sampai {format(endDate, 'dd MMM yyyy', { locale: localeId })}
              </p>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Masukkan diagnosis penyakit..."
                rows={3}
                required
              />
            </div>

            {/* Treatment Summary */}
            <div className="space-y-2">
              <Label htmlFor="treatment_summary">Ringkasan Pengobatan</Label>
              <Textarea
                id="treatment_summary"
                value={formData.treatment_summary}
                onChange={(e) => handleInputChange('treatment_summary', e.target.value)}
                placeholder="Masukkan ringkasan pengobatan yang diberikan..."
                rows={3}
              />
            </div>

            {/* Rest Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="rest_recommendation">Rekomendasi Istirahat *</Label>
              <Textarea
                id="rest_recommendation"
                value={formData.rest_recommendation}
                onChange={(e) => handleInputChange('rest_recommendation', e.target.value)}
                placeholder="Masukkan rekomendasi istirahat untuk pasien..."
                rows={2}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Catatan tambahan jika diperlukan..."
                rows={2}
              />
            </div>

            {/* Warning Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Perhatian:</strong> Setelah surat sakit dibuat, presensi dengan status "Sakit" akan
                otomatis dibuat untuk tanggal {format(startDate, 'dd MMM yyyy', { locale: localeId })} sampai {format(endDate, 'dd MMM yyyy', { locale: localeId })} ({totalDays} hari).
                Presensi ini tidak bisa diedit atau dihapus secara manual.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Membuat Surat Sakit...' : 'Buat Surat Sakit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
