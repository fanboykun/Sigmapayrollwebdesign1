import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Search, Edit2, Trash2, Plus, Layers, Loader2 } from 'lucide-react';
import { useDivisions } from '../hooks/useDivisions';
import { toast } from 'sonner';

export function DivisionMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);

  // Use Supabase hook
  const { divisions, loading, error, addDivision, updateDivision, deleteDivision } = useDivisions();

  const [formData, setFormData] = useState({
    kode_divisi: '',
    nama_divisi: '',
    kepala_divisi: '',
  });

  const filteredDivisions = divisions.filter((div) =>
    div.nama_divisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    div.kode_divisi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      kode_divisi: '',
      nama_divisi: '',
      kepala_divisi: '',
    });
  };

  const handleAddDivision = async () => {
    if (!formData.kode_divisi || !formData.nama_divisi) {
      toast.error('Kode dan Nama Estate harus diisi');
      return;
    }

    const { error } = await addDivision({
      kode_divisi: formData.kode_divisi,
      nama_divisi: formData.nama_divisi,
      kepala_divisi: formData.kepala_divisi || '',
    });

    if (!error) {
      toast.success('Divisi berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error('Gagal menambahkan divisi: ' + error);
    }
  };

  const handleEditDivision = (division: any) => {
    setSelectedDivision(division);
    setFormData({
      kode_divisi: division.kode_divisi,
      nama_divisi: division.nama_divisi,
      kepala_divisi: division.kepala_divisi || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDivision = async () => {
    if (!selectedDivision) return;

    if (!formData.kode_divisi || !formData.nama_divisi) {
      toast.error('Kode dan Nama Estate harus diisi');
      return;
    }

    const { error } = await updateDivision(selectedDivision.id, {
      kode_divisi: formData.kode_divisi,
      nama_divisi: formData.nama_divisi,
      kepala_divisi: formData.kepala_divisi || '',
    });

    if (!error) {
      toast.success('Divisi berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedDivision(null);
    } else {
      toast.error('Gagal mengupdate divisi: ' + error);
    }
  };

  const handleDeleteDivision = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus divisi ini?')) {
      return;
    }

    const { error } = await deleteDivision(id);

    if (!error) {
      toast.success('Divisi berhasil dihapus');
    } else {
      toast.error('Gagal menghapus divisi: ' + error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Master Divisi (Estate)</h1>
        <p className="text-muted-foreground">
          Kelola daftar divisi/estate perkebunan
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Cari divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}>
                <Plus size={16} className="mr-2" />
                Tambah Divisi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Divisi Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi informasi divisi/estate baru
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode_divisi">Kode *</Label>
                    <Input
                      id="kode_divisi"
                      value={formData.kode_divisi}
                      onChange={(e) => handleInputChange('kode_divisi', e.target.value)}
                      placeholder="AL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_divisi">Nama Estate *</Label>
                    <Input
                      id="nama_divisi"
                      value={formData.nama_divisi}
                      onChange={(e) => handleInputChange('nama_divisi', e.target.value)}
                      placeholder="Aek Loba"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kepala_divisi">Kepala Divisi</Label>
                  <Input
                    id="kepala_divisi"
                    value={formData.kepala_divisi}
                    onChange={(e) => handleInputChange('kepala_divisi', e.target.value)}
                    placeholder="Nama Kepala Divisi"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddDivision}>
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error: {error}
          </div>
        ) : filteredDivisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada divisi ditemukan
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDivisions.map((division) => (
              <Card key={division.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{division.nama_divisi}</h3>
                        <Badge variant="outline">{division.kode_divisi}</Badge>
                      </div>
                      {division.kepala_divisi && (
                        <div className="text-sm text-muted-foreground">
                          Kepala: {division.kepala_divisi}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {division.jumlah_karyawan || 0} karyawan
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDivision(division)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDivision(division.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Divisi</DialogTitle>
            <DialogDescription>
              Update informasi divisi/estate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-kode_divisi">Kode *</Label>
                <Input
                  id="edit-kode_divisi"
                  value={formData.kode_divisi}
                  onChange={(e) => handleInputChange('kode_divisi', e.target.value)}
                  placeholder="AL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nama_divisi">Nama Estate *</Label>
                <Input
                  id="edit-nama_divisi"
                  value={formData.nama_divisi}
                  onChange={(e) => handleInputChange('nama_divisi', e.target.value)}
                  placeholder="Aek Loba"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-kepala_divisi">Kepala Divisi</Label>
              <Input
                id="edit-kepala_divisi"
                value={formData.kepala_divisi}
                onChange={(e) => handleInputChange('kepala_divisi', e.target.value)}
                placeholder="Nama Kepala Divisi"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedDivision(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdateDivision}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
