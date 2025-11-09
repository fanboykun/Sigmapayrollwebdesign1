import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Edit2, Trash2, Plus, Wallet, Loader2 } from 'lucide-react';
import { usePotongan } from '../hooks/usePotongan';
import { toast } from 'sonner';

// Komponen form fields terpisah untuk menghindari lost focus issue
interface PotonganFormFieldsProps {
  formData: {
    code: string;
    name: string;
    type: string;
    coa_account_number: string;
    coa_account_name: string;
    description: string;
    is_active: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

function PotonganFormFields({ formData, handleInputChange }: PotonganFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Kode Potongan (3 Digit) *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="001"
            maxLength={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Potongan *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Kontanan/Extra"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipe Potongan *</Label>
        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="perusahaan">Perusahaan</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coa_account_number">No. Akun COA</Label>
          <Input
            id="coa_account_number"
            value={formData.coa_account_number}
            onChange={(e) => handleInputChange('coa_account_number', e.target.value)}
            placeholder="1234567890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coa_account_name">Nama Akun COA</Label>
          <Input
            id="coa_account_name"
            value={formData.coa_account_name}
            onChange={(e) => handleInputChange('coa_account_name', e.target.value)}
            placeholder="Nama Akun yang akan dikreditkan"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Deskripsi potongan..."
          rows={3}
        />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
          <div>
            <Label htmlFor="is_active" className="cursor-pointer">Status Aktif</Label>
            <p className="text-sm text-muted-foreground">Potongan dapat digunakan dalam perhitungan gaji</p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
        </div>
      </div>
    </div>
  );
}

export function PotonganMaster() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPotongan, setSelectedPotongan] = useState<any>(null);

  // Use Supabase hook
  const { potongan, loading, error, addPotongan, updatePotongan, deletePotongan } = usePotongan();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'perusahaan',
    coa_account_number: '',
    coa_account_name: '',
    description: '',
    is_active: true,
  });

  const filteredPotongan = potongan.filter((pot) => {
    const matchesSearch =
      pot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pot.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || pot.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'perusahaan',
      coa_account_number: '',
      coa_account_name: '',
      description: '',
      is_active: true,
    });
  };

  const handleAddPotongan = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Potongan harus diisi');
      return;
    }

    // Validate code is 3 digits
    if (formData.code.length !== 3) {
      toast.error('Kode Potongan harus 3 digit');
      return;
    }

    const { error } = await addPotongan({
      code: formData.code,
      name: formData.name,
      type: formData.type,
      coa_account_number: formData.coa_account_number || null,
      coa_account_name: formData.coa_account_name || null,
      description: formData.description || null,
      is_active: formData.is_active,
    });

    if (!error) {
      toast.success('Potongan berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error('Gagal menambahkan potongan: ' + error);
    }
  };

  const handleEditPotongan = (pot: any) => {
    setSelectedPotongan(pot);
    setFormData({
      code: pot.code,
      name: pot.name,
      type: pot.type,
      coa_account_number: pot.coa_account_number || '',
      coa_account_name: pot.coa_account_name || '',
      description: pot.description || '',
      is_active: pot.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePotongan = async () => {
    if (!selectedPotongan) return;

    if (!formData.code || !formData.name) {
      toast.error('Kode dan Nama Potongan harus diisi');
      return;
    }

    // Validate code is 3 digits
    if (formData.code.length !== 3) {
      toast.error('Kode Potongan harus 3 digit');
      return;
    }

    const { error } = await updatePotongan(selectedPotongan.id, {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      coa_account_number: formData.coa_account_number || null,
      coa_account_name: formData.coa_account_name || null,
      description: formData.description || null,
      is_active: formData.is_active,
    });

    if (!error) {
      toast.success('Potongan berhasil diupdate');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedPotongan(null);
    } else {
      toast.error('Gagal mengupdate potongan: ' + error);
    }
  };

  const handleDeletePotongan = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus potongan ini?')) {
      return;
    }

    const { error } = await deletePotongan(id);

    if (!error) {
      toast.success('Potongan berhasil dihapus');
    } else {
      toast.error('Gagal menghapus potongan: ' + error);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'external'
      ? <Badge variant="secondary" className="bg-[#2c7be5]/10 text-[#2c7be5] hover:bg-[#2c7be5]/10">External</Badge>
      : <Badge variant="secondary" className="bg-[#00d27a]/10 text-[#00d27a] hover:bg-[#00d27a]/10">Perusahaan</Badge>;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Master Potongan</h1>
        <p className="text-muted-foreground">
          Kelola daftar jenis-jenis potongan gaji karyawan
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Cari potongan..."
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
                  Tambah Potongan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Potongan Baru</DialogTitle>
                  <DialogDescription>
                    Lengkapi informasi jenis potongan baru
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <PotonganFormFields formData={formData} handleInputChange={handleInputChange} />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddPotongan}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={typeFilter === 'perusahaan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('perusahaan')}
            >
              Perusahaan
            </Button>
            <Button
              variant={typeFilter === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('external')}
            >
              External
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error: {error}
          </div>
        ) : filteredPotongan.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada potongan ditemukan
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPotongan.map((pot) => (
              <Card key={pot.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium">{pot.name}</h3>
                        <Badge variant="outline">{pot.code}</Badge>
                        {getTypeBadge(pot.type)}
                        {!pot.is_active && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Tidak Aktif
                          </Badge>
                        )}
                      </div>
                      {pot.description && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {pot.description}
                        </div>
                      )}
                      {pot.coa_account_number && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">COA:</span> {pot.coa_account_number}
                          {pot.coa_account_name && ` - ${pot.coa_account_name}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPotongan(pot)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePotongan(pot.id)}
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
            <DialogTitle>Edit Potongan</DialogTitle>
            <DialogDescription>
              Update informasi potongan
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <PotonganFormFields formData={formData} handleInputChange={handleInputChange} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedPotongan(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdatePotongan}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
