import { useState, useMemo, useCallback } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DatePicker } from './ui/date-picker';
import { Search, Filter, Download, Edit2, Trash2, UserPlus, Eye, Users, UserMinus, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MASTER_EMPLOYEES, MasterEmployee } from '../shared/employeeData';
import { MASTER_DIVISIONS } from '../shared/divisionData';
import { Recruitment } from './Recruitment';
import { Termination } from './Termination';
import { Probasi } from './Probasi';

interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  loanStartDate: Date | undefined;
  loanEndDate: Date | undefined;
  licenseManager: string;
  personInCharge: string;
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female';
  religion: string;
  address: string;
  division: string;
  position: string;
  gradeLevel: 'pegawai' | 'karyawan' | 'pkwt';
  joinDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
  bankName: string;
  bankAccount: string;
  emergencyContact: string;
  emergencyPhone: string;
  // Additional fields
  nationalId?: string; // KTP/National ID
  height?: number; // Height in cm
  weight?: number; // Weight in kg
  drivingLicenseNumber?: string; // SIM Number
  drivingLicenseExpiry?: Date; // SIM expiry date
  nationality?: string; // Nationality
  bloodGroup?: string; // Blood type (A+, B+, O+, AB+, etc)
  assets?: Asset[];
}

export function EmployeeManagement() {
  const [mainTab, setMainTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [joinDate, setJoinDate] = useState<Date | undefined>();
  const [drivingLicenseExpiry, setDrivingLicenseExpiry] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('personal');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    religion: '',
    address: '',
    division: '',
    position: '',
    gradeLevel: 'pegawai',
    bankName: '',
    bankAccount: '',
    emergencyContact: '',
    emergencyPhone: '',
    // Additional fields
    nationalId: '',
    height: '',
    weight: '',
    drivingLicenseNumber: '',
    nationality: 'Indonesian',
    bloodGroup: '',
  });

  // Asset state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAsset, setCurrentAsset] = useState({
    assetCode: '',
    assetName: '',
    licenseManager: '',
    personInCharge: '',
  });
  const [loanStartDate, setLoanStartDate] = useState<Date | undefined>();
  const [loanEndDate, setLoanEndDate] = useState<Date | undefined>();

  const [employees, setEmployees] = useState<Employee[]>(MASTER_EMPLOYEES);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = departmentFilter === 'all' || emp.division === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDivision && matchesStatus;
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullName: '',
      email: '',
      phone: '',
      gender: 'male',
      religion: '',
      address: '',
      division: '',
      position: '',
      gradeLevel: 'pegawai',
      bankName: '',
      bankAccount: '',
      emergencyContact: '',
      emergencyPhone: '',
      nationalId: '',
      height: '',
      weight: '',
      drivingLicenseNumber: '',
      nationality: 'Indonesian',
      bloodGroup: '',
    });
    setBirthDate(undefined);
    setJoinDate(undefined);
    setDrivingLicenseExpiry(undefined);
    setAssets([]);
    setCurrentAsset({
      assetCode: '',
      assetName: '',
      licenseManager: '',
      personInCharge: '',
    });
    setLoanStartDate(undefined);
    setLoanEndDate(undefined);
    setActiveTab('personal');
  };

  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: String(employees.length + 1),
      employeeId: formData.employeeId,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      birthDate: birthDate || new Date(),
      gender: formData.gender as 'male' | 'female',
      religion: formData.religion,
      address: formData.address,
      division: formData.division,
      position: formData.position,
      gradeLevel: formData.gradeLevel as 'pegawai' | 'karyawan' | 'pkwt',
      joinDate: joinDate || new Date(),
      status: 'active',
      bankName: formData.bankName,
      bankAccount: formData.bankAccount,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      // Additional fields
      nationalId: formData.nationalId,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      drivingLicenseNumber: formData.drivingLicenseNumber,
      drivingLicenseExpiry: drivingLicenseExpiry,
      nationality: formData.nationality,
      bloodGroup: formData.bloodGroup,
      assets: assets,
    };

    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender,
      religion: employee.religion,
      address: employee.address,
      division: employee.division,
      position: employee.position,
      gradeLevel: employee.gradeLevel,
      bankName: employee.bankName,
      bankAccount: employee.bankAccount,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      nationalId: employee.nationalId || '',
      height: employee.height?.toString() || '',
      weight: employee.weight?.toString() || '',
      drivingLicenseNumber: employee.drivingLicenseNumber || '',
      nationality: employee.nationality || 'Indonesian',
      bloodGroup: employee.bloodGroup || '',
    });
    setBirthDate(employee.birthDate);
    setJoinDate(employee.joinDate);
    setDrivingLicenseExpiry(employee.drivingLicenseExpiry);
    setAssets(employee.assets || []);
    setActiveTab('personal');
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;

    const updatedEmployees = employees.map(emp =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            employeeId: formData.employeeId,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            birthDate: birthDate || emp.birthDate,
            gender: formData.gender as 'male' | 'female',
            religion: formData.religion,
            address: formData.address,
            division: formData.division,
            position: formData.position,
            gradeLevel: formData.gradeLevel as 'pegawai' | 'karyawan' | 'pkwt',
            joinDate: joinDate || emp.joinDate,
            bankName: formData.bankName,
            bankAccount: formData.bankAccount,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
            nationalId: formData.nationalId,
            height: formData.height ? parseFloat(formData.height) : undefined,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            drivingLicenseNumber: formData.drivingLicenseNumber,
            drivingLicenseExpiry: drivingLicenseExpiry,
            nationality: formData.nationality,
            bloodGroup: formData.bloodGroup,
            assets: assets,
          }
        : emp
    );

    setEmployees(updatedEmployees);
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleAssetInputChange = (field: string, value: string) => {
    setCurrentAsset({ ...currentAsset, [field]: value });
  };

  const handleAddAsset = () => {
    if (!currentAsset.assetCode || !currentAsset.assetName) {
      alert('Kode Aset dan Nama Aset harus diisi!');
      return;
    }

    const newAsset: Asset = {
      id: String(Date.now()),
      assetCode: currentAsset.assetCode,
      assetName: currentAsset.assetName,
      loanStartDate: loanStartDate,
      loanEndDate: loanEndDate,
      licenseManager: currentAsset.licenseManager,
      personInCharge: currentAsset.personInCharge,
    };

    setAssets([...assets, newAsset]);
    setCurrentAsset({
      assetCode: '',
      assetName: '',
      licenseManager: '',
      personInCharge: '',
    });
    setLoanStartDate(undefined);
    setLoanEndDate(undefined);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', className: 'bg-[#00d27a]/10 text-[#00d27a]' },
      inactive: { label: 'Tidak Aktif', className: 'bg-muted text-muted-foreground' },
      'on-leave': { label: 'Cuti', className: 'bg-[#f5803e]/10 text-[#f5803e]' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant="secondary" className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
  };

  const getGradeLevelBadge = (grade: string) => {
    const gradeConfig = {
      pegawai: { label: 'Pegawai', className: 'bg-[#2c7be5]/10 text-[#2c7be5]' },
      karyawan: { label: 'Karyawan', className: 'bg-[#00d27a]/10 text-[#00d27a]' },
      pkwt: { label: 'PKWT', className: 'bg-[#f5803e]/10 text-[#f5803e]' },
    };
    
    const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.pegawai;
    return <Badge variant="secondary" className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
  };

  const employeeFormFields = useMemo(() => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
        <TabsTrigger value="employment">Data Pekerjaan</TabsTrigger>
        <TabsTrigger value="financial">Data Keuangan</TabsTrigger>
        <TabsTrigger value="assets">Aset</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Nomor Karyawan *</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              placeholder="1504951"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Imran I"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationalId">National ID / KTP *</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleInputChange('nationalId', e.target.value)}
              placeholder="02.1504.101085.0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Kewarganegaraan</Label>
            <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
              <SelectTrigger id="nationality">
                <SelectValue placeholder="Pilih kewarganegaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indonesian">Indonesian</SelectItem>
                <SelectItem value="Malaysian">Malaysian</SelectItem>
                <SelectItem value="Singaporean">Singaporean</SelectItem>
                <SelectItem value="Other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="imran@sigma.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="081234567890"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tanggal Lahir *</Label>
            <DatePicker
              date={birthDate}
              onDateChange={setBirthDate}
              placeholder="Pilih tanggal lahir"
              fromYear={1940}
              toYear={new Date().getFullYear() - 17}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Tinggi Badan (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder="165"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Berat Badan (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="55"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Golongan Darah</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Pilih golongan darah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Agama *</Label>
            <Select value={formData.religion} onValueChange={(value) => handleInputChange('religion', value)}>
              <SelectTrigger id="religion">
                <SelectValue placeholder="Pilih agama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="islam">Islam</SelectItem>
                <SelectItem value="kristen">Kristen</SelectItem>
                <SelectItem value="katolik">Katolik</SelectItem>
                <SelectItem value="hindu">Hindu</SelectItem>
                <SelectItem value="buddha">Buddha</SelectItem>
                <SelectItem value="konghucu">Konghucu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseNumber">Nomor SIM</Label>
            <Input
              id="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={(e) => handleInputChange('drivingLicenseNumber', e.target.value)}
              placeholder="1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label>Tanggal Berlaku SIM</Label>
            <DatePicker
              date={drivingLicenseExpiry}
              onDateChange={setDrivingLicenseExpiry}
              placeholder="Pilih tanggal berlaku"
              fromYear={2000}
              toYear={new Date().getFullYear() + 20}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Jl. Sudirman No. 123, Jakarta"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Kontak Darurat</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Nama kontak darurat"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Nomor Kontak Darurat</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              placeholder="081234567890"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="employment" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="division">Divisi *</Label>
            <Select value={formData.division} onValueChange={(value) => handleInputChange('division', value)}>
              <SelectTrigger id="division">
                <SelectValue placeholder="Pilih divisi" />
              </SelectTrigger>
              <SelectContent>
                {MASTER_DIVISIONS.filter(div => div.isActive).map((division) => (
                  <SelectItem key={division.id} value={division.name}>
                    {division.shortname} - {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Jabatan *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Mandor Panen"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Golongan *</Label>
            <Select value={formData.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
              <SelectTrigger id="gradeLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pegawai">Pegawai</SelectItem>
                <SelectItem value="karyawan">Karyawan</SelectItem>
                <SelectItem value="pkwt">PKWT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tanggal Bergabung *</Label>
            <DatePicker
              date={joinDate}
              onDateChange={setJoinDate}
              placeholder="Pilih tanggal bergabung"
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank *</Label>
            <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
              <SelectTrigger id="bankName">
                <SelectValue placeholder="Pilih bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BCA">BCA</SelectItem>
                <SelectItem value="Mandiri">Mandiri</SelectItem>
                <SelectItem value="BNI">BNI</SelectItem>
                <SelectItem value="BRI">BRI</SelectItem>
                <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                <SelectItem value="Permata">Permata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Nomor Rekening *</Label>
            <Input
              id="bankAccount"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="1234567890"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="assets" className="space-y-4 mt-4">
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <h4 className="mb-3">Tambah Aset Baru</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetCode">Kode Aset *</Label>
              <Input
                id="assetCode"
                value={currentAsset.assetCode}
                onChange={(e) => handleAssetInputChange('assetCode', e.target.value)}
                placeholder="AST-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetName">Nama Aset *</Label>
              <Input
                id="assetName"
                value={currentAsset.assetName}
                onChange={(e) => handleAssetInputChange('assetName', e.target.value)}
                placeholder="Laptop Dell XPS 15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai Peminjaman</Label>
              <DatePicker
                date={loanStartDate}
                onDateChange={setLoanStartDate}
                placeholder="Pilih tanggal mulai"
                fromYear={2000}
                toYear={new Date().getFullYear() + 5}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Akhir Peminjaman</Label>
              <DatePicker
                date={loanEndDate}
                onDateChange={setLoanEndDate}
                placeholder="Pilih tanggal akhir"
                fromYear={2000}
                toYear={new Date().getFullYear() + 10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseManager">Pengurus Lisensi</Label>
              <Input
                id="licenseManager"
                value={currentAsset.licenseManager}
                onChange={(e) => handleAssetInputChange('licenseManager', e.target.value)}
                placeholder="Nama pengurus lisensi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personInCharge">Penanggung Jawab</Label>
              <Input
                id="personInCharge"
                value={currentAsset.personInCharge}
                onChange={(e) => handleAssetInputChange('personInCharge', e.target.value)}
                placeholder="Nama penanggung jawab"
              />
            </div>
          </div>

          <Button type="button" onClick={handleAddAsset} className="w-full">
            Tambah Aset
          </Button>
        </div>

        {assets.length > 0 && (
          <div className="space-y-3">
            <h4>Daftar Aset ({assets.length})</h4>
            {assets.map((asset) => (
              <Card key={asset.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{asset.assetCode}</Badge>
                      <p className="mb-0">{asset.assetName}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {asset.loanStartDate && (
                        <div>
                          <span>Mulai: </span>
                          <span>{format(asset.loanStartDate, 'PPP', { locale: id })}</span>
                        </div>
                      )}
                      {asset.loanEndDate && (
                        <div>
                          <span>Akhir: </span>
                          <span>{format(asset.loanEndDate, 'PPP', { locale: id })}</span>
                        </div>
                      )}
                      {asset.licenseManager && (
                        <div>
                          <span>Pengurus Lisensi: </span>
                          <span>{asset.licenseManager}</span>
                        </div>
                      )}
                      {asset.personInCharge && (
                        <div>
                          <span>Penanggung Jawab: </span>
                          <span>{asset.personInCharge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAsset(asset.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  ), [activeTab, formData, birthDate, joinDate, assets, currentAsset, loanStartDate, loanEndDate]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1">Manajemen Karyawan & HR</h1>
        <p className="text-muted-foreground">Kelola data karyawan, probasi, rekrutmen, dan terminasi</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
          <TabsTrigger value="employees" className="gap-2">
            <Users size={16} />
            Data Karyawan
          </TabsTrigger>
          <TabsTrigger value="probasi" className="gap-2">
            <UserCheck size={16} />
            Probasi
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="gap-2">
            <UserPlus size={16} />
            Rekrutmen
          </TabsTrigger>
          <TabsTrigger value="termination" className="gap-2">
            <UserMinus size={16} />
            Terminasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Karyawan</p>
              <h3 className="text-2xl">{employees.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <UserPlus size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Karyawan Aktif</p>
              <h3 className="text-2xl">{employees.filter(e => e.status === 'active').length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
              <UserPlus size={24} className="text-[#00d27a]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Golongan Pegawai</p>
              <h3 className="text-2xl">{employees.filter(e => e.gradeLevel === 'pegawai').length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#2c7be5]/10 rounded flex items-center justify-center">
              <UserPlus size={24} className="text-[#2c7be5]" />
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Golongan Karyawan</p>
              <h3 className="text-2xl">{employees.filter(e => e.gradeLevel === 'karyawan').length}</h3>
            </div>
            <div className="w-12 h-12 bg-[#00d27a]/10 rounded flex items-center justify-center">
              <UserPlus size={24} className="text-[#00d27a]" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari berdasarkan nama, ID, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  {MASTER_DIVISIONS.filter(div => div.isActive).map((division) => (
                    <SelectItem key={division.id} value={division.name}>
                      {division.shortname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="on-leave">Cuti</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Download size={16} />
                <span className="hidden sm:inline">Ekspor</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 flex-1 sm:flex-none" onClick={resetForm}>
                    <UserPlus size={16} />
                    Tambah Karyawan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Karyawan Baru</DialogTitle>
                    <DialogDescription>
                      Isi formulir di bawah untuk menambahkan data karyawan baru
                    </DialogDescription>
                  </DialogHeader>
                  {employeeFormFields}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Batal</Button>
                    <Button onClick={handleAddEmployee}>Simpan Data</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">NIK</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Karyawan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Divisi</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Jabatan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Golongan</th>
                <th className="text-left px-4 md:px-6 py-3 text-sm text-muted-foreground">Status</th>
                <th className="text-center px-4 md:px-6 py-3 text-sm text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-medium">{employee.employeeId}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="mb-0">{employee.fullName}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">{employee.division}</td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground">{employee.position}</td>
                  <td className="px-4 md:px-6 py-4">{getGradeLevelBadge(employee.gradeLevel)}</td>
                  <td className="px-4 md:px-6 py-4">{getStatusBadge(employee.status)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Sebelumnya</Button>
            <Button variant="outline" size="sm">Berikutnya</Button>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Karyawan</DialogTitle>
            <DialogDescription>
              Perbarui informasi karyawan yang dipilih
            </DialogDescription>
          </DialogHeader>
          {employeeFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleUpdateEmployee}>Update Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Karyawan</DialogTitle>
            <DialogDescription>
              Informasi lengkap data karyawan
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3>{selectedEmployee.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employeeId} • {selectedEmployee.position}</p>
                  <div className="flex gap-2 mt-2">
                    {getGradeLevelBadge(selectedEmployee.gradeLevel)}
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEmployee.nationalId && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">National ID / KTP</p>
                    <p>{selectedEmployee.nationalId}</p>
                  </div>
                )}
                {selectedEmployee.nationality && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Kewarganegaraan</p>
                    <p>{selectedEmployee.nationality}</p>
                  </div>
                )}
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p>{selectedEmployee.email}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Telepon</p>
                  <p>{selectedEmployee.phone}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Lahir</p>
                  <p>{format(selectedEmployee.birthDate, 'PPP', { locale: id })}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Jenis Kelamin</p>
                  <p>{selectedEmployee.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                {selectedEmployee.height && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Tinggi Badan</p>
                    <p>{selectedEmployee.height} cm</p>
                  </div>
                )}
                {selectedEmployee.weight && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Berat Badan</p>
                    <p>{selectedEmployee.weight} kg</p>
                  </div>
                )}
                {selectedEmployee.bloodGroup && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Golongan Darah</p>
                    <p>{selectedEmployee.bloodGroup}</p>
                  </div>
                )}
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Agama</p>
                  <p className="capitalize">{selectedEmployee.religion}</p>
                </div>
                {selectedEmployee.drivingLicenseNumber && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Nomor SIM</p>
                    <p>{selectedEmployee.drivingLicenseNumber}</p>
                  </div>
                )}
                {selectedEmployee.drivingLicenseExpiry && (
                  <div className="p-4 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Tanggal Berlaku SIM</p>
                    <p>{format(selectedEmployee.drivingLicenseExpiry, 'PPP', { locale: id })}</p>
                  </div>
                )}
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Divisi</p>
                  <p>{selectedEmployee.division}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Alamat</p>
                  <p>{selectedEmployee.address}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Bergabung</p>
                  <p>{format(selectedEmployee.joinDate, 'PPP', { locale: id })}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Golongan</p>
                  <p className="capitalize">{selectedEmployee.gradeLevel}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Bank</p>
                  <p>{selectedEmployee.bankName} - {selectedEmployee.bankAccount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">Kontak Darurat</p>
                  <p>{selectedEmployee.emergencyContact}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded">
                  <p className="text-sm text-muted-foreground mb-1">No. Kontak Darurat</p>
                  <p>{selectedEmployee.emergencyPhone}</p>
                </div>
              </div>

              {selectedEmployee.assets && selectedEmployee.assets.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4>Aset Karyawan ({selectedEmployee.assets.length})</h4>
                  {selectedEmployee.assets.map((asset) => (
                    <Card key={asset.id} className="p-4 bg-muted/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{asset.assetCode}</Badge>
                          <p className="mb-0">{asset.assetName}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {asset.loanStartDate && (
                            <div>
                              <span className="text-xs">Mulai Peminjaman: </span>
                              <span>{format(asset.loanStartDate, 'PPP', { locale: id })}</span>
                            </div>
                          )}
                          {asset.loanEndDate && (
                            <div>
                              <span className="text-xs">Akhir Peminjaman: </span>
                              <span>{format(asset.loanEndDate, 'PPP', { locale: id })}</span>
                            </div>
                          )}
                          {asset.licenseManager && (
                            <div>
                              <span className="text-xs">Pengurus Lisensi: </span>
                              <span>{asset.licenseManager}</span>
                            </div>
                          )}
                          {asset.personInCharge && (
                            <div>
                              <span className="text-xs">Penanggung Jawab: </span>
                              <span>{asset.personInCharge}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="probasi" className="mt-0">
          <Probasi />
        </TabsContent>

        <TabsContent value="recruitment" className="mt-0">
          <Recruitment />
        </TabsContent>

        <TabsContent value="termination" className="mt-0">
          <Termination />
        </TabsContent>
      </Tabs>
    </div>
  );
}
