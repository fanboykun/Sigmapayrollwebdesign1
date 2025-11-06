import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Edit2, Trash2, Plus, Briefcase, Loader2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { usePositions } from '../hooks/usePositions';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function PositionMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [employeeCount, setEmployeeCount] = useState<Record<string, number>>({});

  // Use Supabase hook
  const { positions, loading, error, fetchPositions, addPosition, updatePosition, deletePosition } = usePositions();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'staff' as 'managerial' | 'staff' | 'operator' | 'labor',
    description: '',
    is_active: true,
  });

  // Load employee count for each position
  useEffect(() => {
    const loadEmployeeCounts = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('position_id');

      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((emp: any) => {
          if (emp.position_id) {
            counts[emp.position_id] = (counts[emp.position_id] || 0) + 1;
          }
        });
        setEmployeeCount(counts);
      }
    };

    loadEmployeeCounts();
  }, [positions]);

  const filteredPositions = positions.filter((pos) => {
    const matchesSearch = pos.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pos.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || pos.category === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'staff' as 'managerial' | 'staff' | 'operator' | 'labor',
      description: '',
      is_active: true,
    });
  };

  const handleAddPosition = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Jabatan harus diisi');
      return;
    }

    const { error } = await addPosition({
      code: formData.code,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      is_active: formData.is_active,
    });

    if (!error) {
      toast.success('Jabatan berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error('Gagal menambahkan jabatan: ' + error);
    }
  };

  const handleEditPosition = (position: any) => {
    setSelectedPosition(position);
    setFormData({
      code: position.code,
      name: position.name,
      category: position.category || 'staff',
      description: position.description || '',
      is_active: position.is_active !== false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePosition = async () => {
    if (!selectedPosition) return;

    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Jabatan harus diisi');
      return;
    }

    const { error } = await updatePosition(selectedPosition.id, {
      code: formData.code,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      is_active: formData.is_active,
    });

    if (!error) {
      toast.success('Jabatan berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedPosition(null);
    } else {
      toast.error('Gagal mengupdate jabatan: ' + error);
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
      return;
    }

    const { error } = await deletePosition(id);

    if (!error) {
      toast.success('Jabatan berhasil dihapus');
    } else {
      toast.error('Gagal menghapus jabatan: ' + error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Master Jabatan</h1>
        <p className="text-muted-foreground">
          Kelola daftar jabatan/posisi
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Cari jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="managerial">Managerial</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}>
                <Plus size={16} className="mr-2" />
                Tambah Jabatan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Jabatan Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi informasi jabatan/posisi baru
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="MDR-PMN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Jabatan *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Mandor Panen"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="managerial">Managerial</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Deskripsi jabatan"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddPosition}>
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
        ) : filteredPositions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada jabatan ditemukan
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPositions.map((position) => (
              <Card key={position.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{position.name}</h3>
                        <Badge variant="outline">{position.code}</Badge>
                      </div>
                      {position.category && (
                        <div className="mb-2">
                          <Badge variant="secondary" className="capitalize">
                            {position.category}
                          </Badge>
                        </div>
                      )}
                      {position.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {position.description}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {employeeCount[position.id] || 0} karyawan
                      </div>
                      <div className="mt-2">
                        <Badge variant={position.is_active !== false ? "default" : "secondary"}>
                          {position.is_active !== false ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPosition(position)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePosition(position.id)}
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
            <DialogTitle>Edit Jabatan</DialogTitle>
            <DialogDescription>
              Update informasi jabatan/posisi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Kode *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="MDR-PMN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Jabatan *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Mandor Panen"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="managerial">Managerial</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Deskripsi jabatan"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="edit-is_active">Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedPosition(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdatePosition}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
