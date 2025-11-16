import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Search, Edit2, Trash2, Plus, Layers, Loader2, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { useDivisions } from '../hooks/useDivisions';
import { useEstateSubdivisions } from '../hooks/useEstateSubdivisions';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

export function DivisionMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [expandedEstates, setExpandedEstates] = useState<Set<string>>(new Set());

  // Subdivision management
  const [isAddSubdivisionDialogOpen, setIsAddSubdivisionDialogOpen] = useState(false);
  const [isEditSubdivisionDialogOpen, setIsEditSubdivisionDialogOpen] = useState(false);
  const [selectedSubdivision, setSelectedSubdivision] = useState<any>(null);
  const [selectedEstateId, setSelectedEstateId] = useState<string>('');

  // Use Supabase hooks
  const { divisions, loading, error, addDivision, updateDivision, deleteDivision } = useDivisions();
  const {
    subdivisions,
    loading: subdivisionsLoading,
    error: subdivisionsError,
    fetchSubdivisions,
    addSubdivision,
    updateSubdivision,
    deleteSubdivision
  } = useEstateSubdivisions();

  // Store subdivision counts per estate
  const [subdivisionCounts, setSubdivisionCounts] = useState<Map<string, number>>(new Map());

  const [formData, setFormData] = useState({
    kode_divisi: '',
    nama_divisi: '',
    kepala_divisi: '',
  });

  const [subdivisionFormData, setSubdivisionFormData] = useState({
    kode_subdivisi: '',
    nama_subdivisi: '',
    kepala_subdivisi: '',
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

  const resetSubdivisionForm = () => {
    setSubdivisionFormData({
      kode_subdivisi: '',
      nama_subdivisi: '',
      kepala_subdivisi: '',
    });
  };

  const toggleEstateExpansion = async (estateId: string) => {
    const newExpanded = new Set(expandedEstates);
    if (newExpanded.has(estateId)) {
      newExpanded.delete(estateId);
    } else {
      newExpanded.add(estateId);
      // Fetch subdivisions when expanding
      await fetchSubdivisions(estateId);
    }
    setExpandedEstates(newExpanded);
  };

  // Fetch subdivision counts for all estates on initial load
  const fetchAllSubdivisionCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('estate_subdivisions')
        .select('estate_id, id');

      if (error) {
        console.error('Error fetching subdivision counts:', error);
        return;
      }

      // Count subdivisions per estate
      const countsMap = new Map<string, number>();
      if (data) {
        data.forEach((sub: any) => {
          const currentCount = countsMap.get(sub.estate_id) || 0;
          countsMap.set(sub.estate_id, currentCount + 1);
        });
      }

      setSubdivisionCounts(countsMap);
    } catch (err) {
      console.error('Error in fetchAllSubdivisionCounts:', err);
    }
  };

  // Fetch subdivision counts on component mount
  useEffect(() => {
    fetchAllSubdivisionCounts();
  }, []);

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
    if (!confirm('Apakah Anda yakin ingin menghapus estate ini?')) {
      return;
    }

    const { error } = await deleteDivision(id);

    if (!error) {
      toast.success('Estate berhasil dihapus');
    } else {
      toast.error('Gagal menghapus estate: ' + error);
    }
  };

  // Subdivision handlers
  const handleInputChangeSubdivision = (field: string, value: string) => {
    setSubdivisionFormData({ ...subdivisionFormData, [field]: value });
  };

  const handleAddSubdivision = async () => {
    if (!subdivisionFormData.kode_subdivisi || !subdivisionFormData.nama_subdivisi) {
      toast.error('Kode dan Nama Divisi harus diisi');
      return;
    }

    if (!selectedEstateId) {
      toast.error('Estate harus dipilih');
      return;
    }

    const { error } = await addSubdivision({
      estate_id: selectedEstateId,
      kode_subdivisi: subdivisionFormData.kode_subdivisi,
      nama_subdivisi: subdivisionFormData.nama_subdivisi,
      kepala_subdivisi: subdivisionFormData.kepala_subdivisi || '',
    });

    if (!error) {
      toast.success('Divisi berhasil ditambahkan');
      setIsAddSubdivisionDialogOpen(false);
      resetSubdivisionForm();
      // Refresh subdivisions for the selected estate
      await fetchSubdivisions(selectedEstateId);
      // Refresh subdivision counts
      await fetchAllSubdivisionCounts();
    } else {
      toast.error('Gagal menambahkan divisi: ' + error);
    }
  };

  const handleEditSubdivision = (subdivision: any) => {
    setSelectedSubdivision(subdivision);
    setSubdivisionFormData({
      kode_subdivisi: subdivision.kode_subdivisi,
      nama_subdivisi: subdivision.nama_subdivisi,
      kepala_subdivisi: subdivision.kepala_subdivisi || '',
    });
    setIsEditSubdivisionDialogOpen(true);
  };

  const handleUpdateSubdivision = async () => {
    if (!selectedSubdivision) return;

    if (!subdivisionFormData.kode_subdivisi || !subdivisionFormData.nama_subdivisi) {
      toast.error('Kode dan Nama Divisi harus diisi');
      return;
    }

    const { error } = await updateSubdivision(selectedSubdivision.id, {
      kode_subdivisi: subdivisionFormData.kode_subdivisi,
      nama_subdivisi: subdivisionFormData.nama_subdivisi,
      kepala_subdivisi: subdivisionFormData.kepala_subdivisi || '',
    });

    if (!error) {
      toast.success('Divisi berhasil diupdate');
      setIsEditSubdivisionDialogOpen(false);
      resetSubdivisionForm();
      setSelectedSubdivision(null);
      // Refresh subdivisions for the selected estate
      await fetchSubdivisions(selectedSubdivision.estate_id);
      // Refresh subdivision counts
      await fetchAllSubdivisionCounts();
    } else {
      toast.error('Gagal mengupdate divisi: ' + error);
    }
  };

  const handleDeleteSubdivision = async (id: string, estateId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus divisi ini?')) {
      return;
    }

    const { error } = await deleteSubdivision(id);

    if (!error) {
      toast.success('Divisi berhasil dihapus');
      // Refresh subdivisions for the estate
      await fetchSubdivisions(estateId);
      // Refresh subdivision counts
      await fetchAllSubdivisionCounts();
    } else {
      toast.error('Gagal menghapus divisi: ' + error);
    }
  };

  const openAddSubdivisionDialog = (estateId: string) => {
    setSelectedEstateId(estateId);
    resetSubdivisionForm();
    setIsAddSubdivisionDialogOpen(true);
  };

  // Get subdivisions for a specific estate
  const getEstateSubdivisions = (estateId: string) => {
    return subdivisions.filter(sub => sub.estate_id === estateId);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Master Estate dan Divisi</h1>
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
              placeholder="Cari Estate..."
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
                Tambah Estate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Estate Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi informasi estate baru
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
            Tidak ada estate ditemukan
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDivisions.map((division) => {
              const isExpanded = expandedEstates.has(division.id);
              const estateSubdivisions = getEstateSubdivisions(division.id);
              const subdivisionCount = subdivisionCounts.get(division.id) || 0;

              return (
                <Card key={division.id} className="overflow-hidden">
                  {/* Estate Header */}
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleEstateExpansion(division.id)}
                          className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 hover:bg-primary/20 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-6 w-6 text-primary" />
                          ) : (
                            <ChevronRight className="h-6 w-6 text-primary" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-medium truncate">{division.nama_divisi}</h3>
                            <Badge variant="outline">{division.kode_divisi}</Badge>
                          </div>
                          {division.kepala_divisi && (
                            <div className="text-sm text-muted-foreground">
                              Kepala Estate: {division.kepala_divisi}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {subdivisionCount} divisi • {division.jumlah_karyawan || 0} karyawan
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
                  </div>

                  {/* Subdivisions Section */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-sm">Divisi di Estate {division.nama_divisi}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddSubdivisionDialog(division.id)}
                        >
                          <Plus size={14} className="mr-1" />
                          Tambah Divisi
                        </Button>
                      </div>

                      {subdivisionsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : estateSubdivisions.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Belum ada divisi. Klik "Tambah Divisi" untuk menambahkan.
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {estateSubdivisions.map((subdivision) => (
                            <Card key={subdivision.id} className="p-3 bg-background">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Layers className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">{subdivision.nama_subdivisi}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {subdivision.kode_subdivisi}
                                      </Badge>
                                    </div>
                                    {subdivision.kepala_subdivisi && (
                                      <div className="text-xs text-muted-foreground">
                                        Kepala: {subdivision.kepala_subdivisi}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSubdivision(subdivision)}
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubdivision(subdivision.id, subdivision.estate_id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit Estate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Estate</DialogTitle>
            <DialogDescription>
              Update informasi estate
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
              <Label htmlFor="edit-kepala_divisi">Kepala Estate</Label>
              <Input
                id="edit-kepala_divisi"
                value={formData.kepala_divisi}
                onChange={(e) => handleInputChange('kepala_divisi', e.target.value)}
                placeholder="Nama Kepala Estate"
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

      {/* Add Subdivision Dialog */}
      <Dialog open={isAddSubdivisionDialogOpen} onOpenChange={setIsAddSubdivisionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Divisi Baru</DialogTitle>
            <DialogDescription>
              Tambahkan divisi baru untuk estate ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode_subdivisi">Kode Divisi *</Label>
                <Input
                  id="kode_subdivisi"
                  value={subdivisionFormData.kode_subdivisi}
                  onChange={(e) => handleInputChangeSubdivision('kode_subdivisi', e.target.value)}
                  placeholder="I, II, III, KK, KP"
                />
                <p className="text-xs text-muted-foreground">
                  Contoh: I, II, III, IV, V, VI, KK (Kantor Kebun), KP (Kantor Pabrik)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_subdivisi">Nama Divisi *</Label>
                <Input
                  id="nama_subdivisi"
                  value={subdivisionFormData.nama_subdivisi}
                  onChange={(e) => handleInputChangeSubdivision('nama_subdivisi', e.target.value)}
                  placeholder="Divisi I, Kantor Kebun"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kepala_subdivisi">Kepala Divisi</Label>
              <Input
                id="kepala_subdivisi"
                value={subdivisionFormData.kepala_subdivisi}
                onChange={(e) => handleInputChangeSubdivision('kepala_subdivisi', e.target.value)}
                placeholder="Nama Kepala Divisi"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddSubdivisionDialogOpen(false);
              resetSubdivisionForm();
            }}>
              Batal
            </Button>
            <Button onClick={handleAddSubdivision}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subdivision Dialog */}
      <Dialog open={isEditSubdivisionDialogOpen} onOpenChange={setIsEditSubdivisionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Divisi</DialogTitle>
            <DialogDescription>
              Update informasi divisi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-kode_subdivisi">Kode Divisi *</Label>
                <Input
                  id="edit-kode_subdivisi"
                  value={subdivisionFormData.kode_subdivisi}
                  onChange={(e) => handleInputChangeSubdivision('kode_subdivisi', e.target.value)}
                  placeholder="I, II, III, KK, KP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nama_subdivisi">Nama Divisi *</Label>
                <Input
                  id="edit-nama_subdivisi"
                  value={subdivisionFormData.nama_subdivisi}
                  onChange={(e) => handleInputChangeSubdivision('nama_subdivisi', e.target.value)}
                  placeholder="Divisi I, Kantor Kebun"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-kepala_subdivisi">Kepala Divisi</Label>
              <Input
                id="edit-kepala_subdivisi"
                value={subdivisionFormData.kepala_subdivisi}
                onChange={(e) => handleInputChangeSubdivision('kepala_subdivisi', e.target.value)}
                placeholder="Nama Kepala Divisi"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditSubdivisionDialogOpen(false);
              resetSubdivisionForm();
              setSelectedSubdivision(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdateSubdivision}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
