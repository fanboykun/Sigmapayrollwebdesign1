/**
 * ==========================================================================
 * CLINIC MODULE - DASHBOARD
 * ==========================================================================
 *
 * Dashboard utama modul Clinic dengan statistik dan overview.
 * Menampilkan: visits, patients, medicines, low stock alerts, recent activities
 *
 * #ClinicModule #Dashboard #Statistics
 *
 * @author Sigma Development Team
 * @version 1.0.0
 * @since 2025-11-03
 * ==========================================================================
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Heart,
  Users,
  Pill,
  Activity,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface DashboardStats {
  total_visits_today: number;
  total_visits_month: number;
  total_patients: number;
  total_medicines: number;
  low_stock_count: number;
  pending_visits: number;
}

interface RecentVisit {
  id: string;
  visit_number: string;
  patient_name: string;
  visit_date: string;
  visit_time: string;
  chief_complaint: string;
  status: string;
}

interface TopDisease {
  disease_name: string;
  count: number;
}

interface LowStockMedicine {
  medicine_name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
}

export function ClinicDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_visits_today: 0,
    total_visits_month: 0,
    total_patients: 0,
    total_medicines: 0,
    low_stock_count: 0,
    pending_visits: 0,
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<LowStockMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentVisits(),
        loadTopDiseases(),
        loadLowStockMedicines(),
      ]);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const monthStart = firstDayOfMonth.toISOString().split('T')[0];

      // Total visits today
      const { count: visitsToday } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .eq('visit_date', today);

      // Total visits this month
      const { count: visitsMonth } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', monthStart);

      // Total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total medicines
      const { count: totalMedicines } = await supabase
        .from('clinic_medicines')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Pending visits (waiting status)
      const { count: pendingVisits } = await supabase
        .from('clinic_visits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting');

      // Load medicines for stock check
      const { data: medicines } = await supabase
        .from('clinic_medicines')
        .select('id, min_stock')
        .eq('is_active', true);

      // Load stock data
      const { data: stockData } = await supabase
        .from('clinic_medicine_stock')
        .select('medicine_id, quantity')
        .eq('status', 'available');

      // Calculate low stock count
      const stockMap = new Map<string, number>();
      stockData?.forEach(stock => {
        const current = stockMap.get(stock.medicine_id) || 0;
        stockMap.set(stock.medicine_id, current + stock.quantity);
      });

      let lowStockCount = 0;
      medicines?.forEach(med => {
        const currentStock = stockMap.get(med.id) || 0;
        if (currentStock < med.min_stock) {
          lowStockCount++;
        }
      });

      setStats({
        total_visits_today: visitsToday || 0,
        total_visits_month: visitsMonth || 0,
        total_patients: totalPatients || 0,
        total_medicines: totalMedicines || 0,
        low_stock_count: lowStockCount,
        pending_visits: pendingVisits || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_visits')
        .select(`
          id,
          visit_number,
          visit_date,
          visit_time,
          chief_complaint,
          status,
          patient:patients(full_name)
        `)
        .order('visit_date', { ascending: false })
        .order('visit_time', { ascending: false })
        .limit(5);

      if (error) throw error;

      const visits: RecentVisit[] = data?.map(v => ({
        id: v.id,
        visit_number: v.visit_number,
        patient_name: v.patient?.full_name || 'N/A',
        visit_date: v.visit_date,
        visit_time: v.visit_time,
        chief_complaint: v.chief_complaint,
        status: v.status,
      })) || [];

      setRecentVisits(visits);
    } catch (error: any) {
      console.error('Error loading recent visits:', error);
    }
  };

  const loadTopDiseases = async () => {
    try {
      // Get medical records with primary and secondary diagnosis
      const { data, error } = await supabase
        .from('clinic_medical_records')
        .select(`
          diagnosis_primary:clinic_diseases!clinic_medical_records_diagnosis_primary_fkey(name),
          diagnosis_secondary:clinic_diseases!clinic_medical_records_diagnosis_secondary_fkey(name)
        `)
        .not('diagnosis_primary', 'is', null)
        .limit(100);

      if (error) throw error;

      // Count diseases
      const diseaseCount = new Map<string, number>();
      data?.forEach(record => {
        // Count primary diagnosis
        const primaryName = record.diagnosis_primary?.name;
        if (primaryName) {
          diseaseCount.set(primaryName, (diseaseCount.get(primaryName) || 0) + 1);
        }

        // Count secondary diagnosis
        const secondaryName = record.diagnosis_secondary?.name;
        if (secondaryName) {
          diseaseCount.set(secondaryName, (diseaseCount.get(secondaryName) || 0) + 1);
        }
      });

      // Convert to array and sort
      const topDiseases: TopDisease[] = Array.from(diseaseCount.entries())
        .map(([disease_name, count]) => ({ disease_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopDiseases(topDiseases);
    } catch (error: any) {
      console.error('Error loading top diseases:', error);
    }
  };

  const loadLowStockMedicines = async () => {
    try {
      // Load medicines
      const { data: medicines } = await supabase
        .from('clinic_medicines')
        .select('id, name, min_stock, unit')
        .eq('is_active', true);

      // Load stock data
      const { data: stockData } = await supabase
        .from('clinic_medicine_stock')
        .select('medicine_id, quantity')
        .eq('status', 'available');

      // Calculate stock per medicine
      const stockMap = new Map<string, number>();
      stockData?.forEach(stock => {
        const current = stockMap.get(stock.medicine_id) || 0;
        stockMap.set(stock.medicine_id, current + stock.quantity);
      });

      // Find low stock medicines
      const lowStock: LowStockMedicine[] = [];
      medicines?.forEach(med => {
        const currentStock = stockMap.get(med.id) || 0;
        if (currentStock < med.min_stock) {
          lowStock.push({
            medicine_name: med.name,
            current_stock: currentStock,
            min_stock: med.min_stock,
            unit: med.unit,
          });
        }
      });

      // Sort by urgency (lowest stock percentage first)
      lowStock.sort((a, b) => {
        const aPercent = a.current_stock / a.min_stock;
        const bPercent = b.current_stock / b.min_stock;
        return aPercent - bPercent;
      });

      setLowStockMedicines(lowStock.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading low stock medicines:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-blue-100 text-blue-800">Menunggu</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Pemeriksaan</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard Klinik</h1>
            <p className="text-sm text-gray-500">Overview statistik dan aktivitas klinik</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kunjungan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_visits_today}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pending_visits} pending
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kunjungan Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_visits_month}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Total bulan ini
                </p>
              </div>
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pasien</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_patients}</p>
                <p className="text-xs text-gray-500 mt-1">Pasien aktif</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stok Obat Rendah</p>
                <p className="text-2xl font-bold text-red-600">{stats.low_stock_count}</p>
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Perlu restock
                </p>
              </div>
              <Pill className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Visits */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Kunjungan Terbaru</h3>
            </div>
            <div className="p-4">
              {recentVisits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Belum ada kunjungan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {visit.patient_name}
                          </span>
                          {getStatusBadge(visit.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{visit.chief_complaint}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(visit.visit_date)} • {visit.visit_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Top Diseases */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Penyakit Terbanyak</h3>
            </div>
            <div className="p-4">
              {topDiseases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Belum ada data penyakit</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topDiseases.map((disease, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {disease.disease_name}
                        </span>
                      </div>
                      <Badge variant="outline">{disease.count} kasus</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Low Stock Medicines Alert */}
        {lowStockMedicines.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  Peringatan: Obat Stok Rendah
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockMedicines.map((med, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg border border-red-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{med.medicine_name}</p>
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Stok:</span>
                      <span className={`font-semibold ${
                        med.current_stock === 0 ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {med.current_stock} {med.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">Min. stok:</span>
                      <span className="text-gray-900">{med.min_stock} {med.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
