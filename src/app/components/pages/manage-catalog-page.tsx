import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Plus, CheckCircle2, AlertCircle, Search, X } from 'lucide-react';
import { api } from '@/app/services/api';

interface Symptom {
  id: string;
  name: string;
  standardCode: string;
  codingSystem: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

interface Vaccine {
  id: string;
  name: string;
  type: number;
  code: string;
  description: string;
  approvalDate: string;
  isActive: boolean;
  createdAt?: string;
}

interface SymptomFormData {
  name: string;
  standardCode: string;
  codingSystem: string;
  category: string;
  description: string;
  isActive: boolean;
}

interface VaccineFormData {
  name: string;
  type: number;
  code: string;
  description: string;
  approvalDate: string;
  isActive: boolean;
}

const vaccineTypes = [
  { id: 0, name: 'mRNA' },
  { id: 1, name: 'Vector Viral' },
  { id: 2, name: 'Subunidad proteica' },
  { id: 3, name: 'Virus inactivado' },
  { id: 4, name: 'Virus vivo atenuado' },
  { id: 5, name: 'ADN' },
  { id: 6, name: 'Conjugada' },
  { id: 7, name: 'Otra' },
];

const symptomCategories = ['General', 'Respiratorio', 'Gastrointestinal', 'Neurológico', 'Cardiaco', 'Dermatológico', 'Otro'];

export const ManageCatalogPage = () => {
  // Estado de síntomas
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [symSearchTerm, setSymSearchTerm] = useState('');
  const [symFilterActive, setSymFilterActive] = useState<string | null>(null);
  const [vacSearchTerm, setVacSearchTerm] = useState('');
  const [vacFilterActive, setVacFilterActive] = useState<string | null>(null);

  // Estado de formularios
  const [symptomForm, setSymptomForm] = useState<SymptomFormData>({
    name: '',
    standardCode: '',
    codingSystem: '',
    category: 'General',
    description: '',
    isActive: true,
  });

  const [vaccineForm, setVaccineForm] = useState<VaccineFormData>({
    name: '',
    type: 0,
    code: '',
    description: '',
    approvalDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  // Estado de UI
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSymForm, setLoadingSymForm] = useState(false);
  const [loadingVacForm, setLoadingVacForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Aquí deberías tener endpoints GET si el backend los proporciona
        // Por ahora, los arrays estarán vacíos
        // await api.get('/Catalog/symptoms');
        // await api.get('/Catalog/vaccines');
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Manejar agregar síntoma
  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSymForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/Catalog/register/symptom', symptomForm);

      setSuccessMsg(`✅ Síntoma "${symptomForm.name}" registrado exitosamente`);
      setSymptomForm({
        name: '',
        standardCode: '',
        codingSystem: '',
        category: 'General',
        description: '',
        isActive: true,
      });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al registrar síntoma';
      setErrorMsg(errorMsg);
    } finally {
      setLoadingSymForm(false);
    }
  };

  // Manejar agregar vacuna
  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingVacForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/Catalog/register/vaccine', {
        ...vaccineForm,
        approvalDate: new Date(vaccineForm.approvalDate).toISOString(),
      });

      // ✅ mensaje de éxito
    setSuccessMsg(`✅ Vacuna "${vaccineForm.name}" registrada exitosamente`);

    // ✅ limpiar formulario
    setVaccineForm({
      name: '',
      type: 0,
      code: '',
      description: '',
      approvalDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
     //await fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al registrar vacuna';
      setErrorMsg(errorMsg);
    } finally {
      setLoadingVacForm(false);
    }
  };

  // Filtrar síntomas
  const filteredSymptoms = symptoms.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(symSearchTerm.toLowerCase());
    const matchesActive = symFilterActive === null || (symFilterActive === 'active' ? s.isActive : !s.isActive);
    return matchesSearch && matchesActive;
  });

  // Filtrar vacunas
  const filteredVaccines = vaccines.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(vacSearchTerm.toLowerCase());
    const matchesActive = vacFilterActive === null || (vacFilterActive === 'active' ? v.isActive : !v.isActive);
    return matchesSearch && matchesActive;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A4B8F' }}>
          Gestionar Catálogo
        </h1>
        <p className="text-gray-600">
          Administra síntomas y vacunas del sistema
        </p>
      </div>

      {/* Mensajes */}
      {successMsg && (
        <Alert className="mb-6 bg-green-50 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 ml-2">
            {successMsg}
          </AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert className="mb-6 bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">
            ❌ {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="symptoms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="symptoms">Síntomas</TabsTrigger>
          <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
        </TabsList>

        {/* TAB 1: SÍNTOMAS */}
        <TabsContent value="symptoms" className="space-y-6">
          {/* Formulario Agregar Síntoma */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Síntoma</CardTitle>
              <CardDescription>Completa los campos para registrar un síntoma</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSymptom} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sym-name">Nombre *</Label>
                    <Input
                      id="sym-name"
                      placeholder="Ej: Fiebre"
                      value={symptomForm.name}
                      onChange={(e) => setSymptomForm({ ...symptomForm, name: e.target.value })}
                      required
                      disabled={loadingSymForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sym-category">Categoría *</Label>
                    <Select
                      value={symptomForm.category}
                      onValueChange={(v) => setSymptomForm({ ...symptomForm, category: v })}
                      disabled={loadingSymForm}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {symptomCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sym-code">Código Estándar *</Label>
                    <Input
                      id="sym-code"
                      placeholder="Ej: 12121223"
                      value={symptomForm.standardCode}
                      onChange={(e) => setSymptomForm({ ...symptomForm, standardCode: e.target.value })}
                      required
                      disabled={loadingSymForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sym-system">Sistema de Codificación *</Label>
                    <Input
                      id="sym-system"
                      placeholder="Ej: 12312312"
                      value={symptomForm.codingSystem}
                      onChange={(e) => setSymptomForm({ ...symptomForm, codingSystem: e.target.value })}
                      required
                      disabled={loadingSymForm}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sym-desc">Descripción *</Label>
                  <Textarea
                    id="sym-desc"
                    placeholder="Descripción detallada..."
                    value={symptomForm.description}
                    onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                    rows={3}
                    required
                    disabled={loadingSymForm}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <input
                    type="checkbox"
                    id="sym-active"
                    checked={symptomForm.isActive}
                    onChange={(e) => setSymptomForm({ ...symptomForm, isActive: e.target.checked })}
                    disabled={loadingSymForm}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="sym-active" className="mb-0 cursor-pointer">Activo</Label>
                </div>

                <Button
                  type="submit"
                  disabled={loadingSymForm}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#0A4B8F' }}
                >
                  <Plus className="w-4 h-4" />
                  {loadingSymForm ? 'Registrando...' : 'Registrar Síntoma'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tabla Síntomas */}
          <Card>
            <CardHeader>
              <CardTitle>Síntomas Registrados</CardTitle>
              <CardDescription>
                {filteredSymptoms.length} síntoma(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda y Filtros */}
              <div className="flex gap-3 flex-col md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={symSearchTerm}
                    onChange={(e) => setSymSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {symSearchTerm && (
                    <button
                      onClick={() => setSymSearchTerm('')}
                      className="absolute right-2 top-2.5"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <Select
                  value={symFilterActive ?? 'all'}
                  onValueChange={(v) => setSymFilterActive(v === 'all' ? null : v)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla */}
              {loadingData ? (
                <p className="text-center text-gray-500 py-4">Cargando síntomas...</p>
              ) : filteredSymptoms.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay síntomas registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSymptoms.map(sym => (
                        <TableRow key={sym.id}>
                          <TableCell className="font-medium">{sym.name}</TableCell>
                          <TableCell>{sym.category}</TableCell>
                          <TableCell className="text-sm text-gray-500">{sym.standardCode}</TableCell>
                          <TableCell>
                            <Badge variant={sym.isActive ? 'default' : 'secondary'}>
                              {sym.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: VACUNAS */}
        <TabsContent value="vaccines" className="space-y-6">
          {/* Formulario Agregar Vacuna */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Vacuna</CardTitle>
              <CardDescription>Completa los campos para registrar una vacuna</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVaccine} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vac-name">Nombre *</Label>
                    <Input
                      id="vac-name"
                      placeholder="Ej: Soberana 02"
                      value={vaccineForm.name}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                      required
                      disabled={loadingVacForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vac-type">Tipo *</Label>
                    <Select
                      value={vaccineForm.type.toString()}
                      onValueChange={(v) => setVaccineForm({ ...vaccineForm, type: parseInt(v) })}
                      disabled={loadingVacForm}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vaccineTypes.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vac-code">Código *</Label>
                    <Input
                      id="vac-code"
                      placeholder="Ej: TC12323"
                      value={vaccineForm.code}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, code: e.target.value })}
                      required
                      disabled={loadingVacForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vac-date">Fecha de Aprobación *</Label>
                    <Input
                      id="vac-date"
                      type="date"
                      value={vaccineForm.approvalDate}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, approvalDate: e.target.value })}
                      required
                      disabled={loadingVacForm}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vac-desc">Descripción *</Label>
                  <Textarea
                    id="vac-desc"
                    placeholder="Descripción detallada..."
                    value={vaccineForm.description}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, description: e.target.value })}
                    rows={3}
                    required
                    disabled={loadingVacForm}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <input
                    type="checkbox"
                    id="vac-active"
                    checked={vaccineForm.isActive}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, isActive: e.target.checked })}
                    disabled={loadingVacForm}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="vac-active" className="mb-0 cursor-pointer">Activa</Label>
                </div>

                <Button
                  type="submit"
                  disabled={loadingVacForm}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#0A4B8F' }}
                >
                  <Plus className="w-4 h-4" />
                  {loadingVacForm ? 'Registrando...' : 'Registrar Vacuna'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tabla Vacunas */}
          <Card>
            <CardHeader>
              <CardTitle>Vacunas Registradas</CardTitle>
              <CardDescription>
                {filteredVaccines.length} vacuna(s) encontrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda y Filtros */}
              <div className="flex gap-3 flex-col md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={vacSearchTerm}
                    onChange={(e) => setVacSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {vacSearchTerm && (
                    <button
                      onClick={() => setVacSearchTerm('')}
                      className="absolute right-2 top-2.5"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <Select
                  value={vacFilterActive ?? 'all'}
                  onValueChange={(v) => setVacFilterActive(v === 'all' ? null : v)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla */}
              {loadingData ? (
                <p className="text-center text-gray-500 py-4">Cargando vacunas...</p>
              ) : filteredVaccines.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay vacunas registradas</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Aprobación</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVaccines.map(vac => (
                        <TableRow key={vac.id}>
                          <TableCell className="font-medium">{vac.name}</TableCell>
                          <TableCell>{vaccineTypes.find(t => t.id === vac.type)?.name || 'Otra'}</TableCell>
                          <TableCell className="text-sm text-gray-500">{vac.code}</TableCell>
                          <TableCell className="text-sm">{new Date(vac.approvalDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={vac.isActive ? 'default' : 'secondary'}>
                              {vac.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
