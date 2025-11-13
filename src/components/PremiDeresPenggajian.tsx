import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Droplets, Upload, CheckCircle, Calculator } from 'lucide-react';

const PremiDeresPenggajian = () => {
  const [activeTab, setActiveTab] = useState('input-produksi');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Penggajian Premi Deres
          </h1>
          <p className="text-muted-foreground">Input produksi harian dan perhitungan premi deres</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <TabsTrigger value="input-produksi" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Upload className="mr-2 h-4 w-4" />
              Input Produksi
            </TabsTrigger>
            <TabsTrigger value="quality-check" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <CheckCircle className="mr-2 h-4 w-4" />
              Quality Check
            </TabsTrigger>
            <TabsTrigger value="perhitungan" className="whitespace-nowrap px-3 py-2 min-w-fit">
              <Calculator className="mr-2 h-4 w-4" />
              Perhitungan Premi
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input-produksi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Produksi Harian</CardTitle>
              <CardDescription>Modul input produksi deres - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Droplets className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur input produksi harian deres sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality-check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pemeriksaan Kualitas Deres</CardTitle>
              <CardDescription>Modul quality check - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur pemeriksaan kualitas deres sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perhitungan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perhitungan Premi Deres</CardTitle>
              <CardDescription>Modul perhitungan premi - Dalam Pengembangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Modul Dalam Pengembangan</h3>
                <p className="text-muted-foreground">
                  Fitur perhitungan premi deres sedang dalam tahap pengembangan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiDeresPenggajian;
