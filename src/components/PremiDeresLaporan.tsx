import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Droplets, FileText, BarChart3, TrendingUp } from 'lucide-react';

const PremiDeresLaporan = () => {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Laporan Premi Deres
          </h1>
          <p className="text-muted-foreground">Analisis dan laporan premi deres</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="summary" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <FileText className="mr-2 h-4 w-4" />
              Summary Premi
            </TabsTrigger>
            <TabsTrigger value="detail" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <BarChart3 className="mr-2 h-4 w-4" />
              Detail Produksi
            </TabsTrigger>
            <TabsTrigger value="analisis" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analisis
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary Premi Per Karyawan</CardTitle>
              <CardDescription>Modul laporan summary - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur laporan summary premi deres sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Produksi Harian</CardTitle>
              <CardDescription>Modul detail produksi - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur detail produksi harian sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analisis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Produktivitas Deres</CardTitle>
              <CardDescription>Modul analisis - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur analisis produktivitas deres sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiDeresLaporan;
