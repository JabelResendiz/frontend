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
import { Switch } from '@/app/components/ui/switch';
import { Plus, CheckCircle2, AlertCircle, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/app/services/api';
import { catalogService, VaccineCatalog, Manufacturer } from "@/app/services/catalog.service";
import { Loader2 } from "lucide-react";

interface Symptom {
  id: string;
  name: string;
  standardCode: string;
  codingSystem: string;
  category: string;
  description?: string;
  isActive: boolean;
}


interface Vaccine {
  id: string;
  name: string;
  type: string;
  code: string;
  approvalDate: string;
  isActive: boolean;
}

// interface Lot {
//   lotNumber: string;
//   vaccineId: string;
// }


interface PagedResultSymptoms {
  items: Symptom[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  nextPageUrl?: string;
  previousPageUrl?: string;
}

interface PagedResultVaccines {
  items: Vaccine[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  nextPageUrl?: string;
  previousPageUrl?: string;
}

interface SymptomFormData {
  name: string;
  standardCode: string;
  codingSystem: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface VaccineFormData {
  name: string;
  type: string;
  code: string;
  description: string;
  approvalDate: string;
  isActive: boolean;
  manufacturerDto: {
    id: string;
    name: string;
    country: string;
    isNew: boolean;
  };
}


interface LotFormData {
  lotNumber: string;
  vaccineId: string;
}



const vaccineTypes = [
  { id: 'mRNA', name: 'mRNA' },
  { id: 'ViralVector', name: 'Vector Viral' },
  { id: 'Subunit', name: 'Subunidad proteica' },
  { id: 'Inactivated', name: 'Virus inactivado' },
  { id: 'LiveAttenuated', name: 'Virus vivo atenuado' },
  { id: 'DNA', name: 'ADN' },
  { id: 'Conjugate', name: 'Conjugada' },
  { id: 'Other', name: 'Otra' },
];

const symptomCategories = ['General', 'Neurological', 'Muscular', 'Local', 'Respiratory', 'Gastrointestinal', 'Cardiac', 'Dermatological', 'Other'];

export const ManageCatalogPage = () => {
  // Estado de síntomas
  const [symptomsPaged, setSymptomsPaged] = useState<PagedResultSymptoms>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  });
  const [vaccinesPaged, setVaccinesPaged] = useState<PagedResultVaccines>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  });
  const [symSearchTerm, setSymSearchTerm] = useState('');
  const [symFilterActive, setSymFilterActive] = useState<string | null>(null);
  const [vacSearchTerm, setVacSearchTerm] = useState('');
  const [vacFilterActive, setVacFilterActive] = useState<string | null>(null);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);
  const [finlayVaccines, setFinlayVaccines] = useState<VaccineCatalog[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(false);
  const [showNewManufacturer, setShowNewManufacturer] = useState(false);

  const [loadingToggleVac, setLoadingToggleVac] = useState<Record<string, boolean>>({});
 


  // Estado de formularios
  const [symptomForm, setSymptomForm] = useState<SymptomFormData>({
    name: '',
    standardCode: '',
    codingSystem: '',
    description: '',
    category: 'General',
    isActive: true,
  });

  const [vaccineForm, setVaccineForm] = useState<VaccineFormData>({
    name: '',
    type: 'mRNA',
    code: '',
    description: '',
    approvalDate: new Date().toISOString().split('T')[0],
    isActive: true,
    manufacturerDto: {
      id: '',
      name: '',
      country: '',
      isNew: false
    }
  });

  const [lotForm, setLotForm] = useState<LotFormData>({
      lotNumber: '',
      vaccineId: ''
  });

  // Estado de UI
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSymForm, setLoadingSymForm] = useState(false);
  const [loadingVacForm, setLoadingVacForm] = useState(false);
  const [loadingLotForm, setLoadingLotForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchSymptoms(1);
    fetchVaccines(1);
    loadFinlayVaccines();
    loadManufacturers();
  }, []);

  const loadFinlayVaccines = async () => {
    setIsLoadingVaccines(true);
    try {
      const data = await catalogService.getFinlayVaccines();
      setFinlayVaccines(data);
    } catch (err) {
      console.error('Error cargando vacunas de Finlay:', err);
      setErrorMsg('Error al cargar vacunas del Instituto Finlay');
    } finally {
      setIsLoadingVaccines(false);
    }
  };

  const loadManufacturers = async () => {
    setIsLoadingManufacturers(true);
    try {
      const data = await catalogService.getManufacturers();
      setManufacturers(data);
    } catch (err) {
      console.error('Error cargando fabricantes:', err);
      setErrorMsg('Error al cargar fabricantes');
    } finally {
      setIsLoadingManufacturers(false);
    }
  };

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
        description: '',
        category: 'General',
        isActive: true,
      });
      // Recargar síntomas desde la primera página
      fetchSymptoms(1, symSearchTerm, symFilterActive);
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
      const payload = {
        ...vaccineForm,
        approvalDate: new Date(vaccineForm.approvalDate).toISOString(),
        manufacturerDto: vaccineForm.manufacturerDto.isNew
          ? {
              name: vaccineForm.manufacturerDto.name,
              country: vaccineForm.manufacturerDto.country,
              isNew: true
            }
          : vaccineForm.manufacturerDto
      };

      await api.post('/Catalog/register/vaccine', payload);

      await loadFinlayVaccines();

      await loadManufacturers();
      // ✅ mensaje de éxito
      setSuccessMsg(`✅ Vacuna "${vaccineForm.name}" registrada exitosamente`);

      // ✅ limpiar formulario
      setVaccineForm({
        name: '',
        type: 'mRNA',
        code: '',
        description: '',
        approvalDate: new Date().toISOString().split('T')[0],
        isActive: true,
        manufacturerDto: {
          id: '',
          name: '',
          country: '',
          isNew: false
        }
      });
      setShowNewManufacturer(false);
      // Recargar vacunas desde la primera página
      fetchVaccines(1, vacSearchTerm, vacFilterActive);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al registrar vacuna';
      setErrorMsg(errorMsg);
    } finally {
      setLoadingVacForm(false);
    }
  };


  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLotForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/Lot/register', lotForm);

      // ✅ mensaje de éxito
      setSuccessMsg(`✅ Lote "${lotForm.lotNumber}" registrado exitosamente`);

      // ✅ limpiar formulario
      setLotForm({
          lotNumber: '',
          vaccineId: ''
      });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al registrar lote';
      setErrorMsg(errorMsg);
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setLoadingLotForm(false);
    }
  };

  const fetchVaccines = async (pageNumber = 1, search = '', status: string | null = null) => {
    setLoadingData(true);
    try {
      const res = await api.get<PagedResultVaccines>('/GetCatalog/vaccine', {
        params: {
          pageNumber,
          pageSize: 10,
          search: search || undefined,
          status: 
            status === null
              ? undefined
              : status === 'active',
        },
      });

      setVaccinesPaged(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSymptoms = async (pageNumber = 1, search = '', status: string | null = null) => {
    setLoadingData(true);
    try {
      const res = await api.get<PagedResultSymptoms>('/GetCatalog/symptom', {
        params: {
          pageNumber,
          pageSize: 10,
          search: search || undefined,
          status: 
            status === null
              ? undefined
              : status === 'active',
        },
      });

      setSymptomsPaged(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // Actualizar estado de síntoma
  const updateSymptomStatus = async (symptomId: string, isActive: boolean) => {
    
    
    if (loadingToggleVac[symptomId]) return;

    setLoadingToggleVac(prev => ({ ...prev, [symptomId]: true }));


    setSymptomsPaged(prev => {
        let updatedItems = prev.items.map(s =>
          s.id === symptomId ? { ...s, isActive } : s
        );

        // 👇 aplicar filtro actual
        if (symFilterActive === 'active') {
          updatedItems = updatedItems.filter(s => s.isActive);
        } else if (symFilterActive === 'inactive') {
          updatedItems = updatedItems.filter(s => !s.isActive);
        }

        return {
          ...prev,
          items: updatedItems,
        };
      });
    
    try {
      const response = await api.post(`/Catalog/updateStatus/symptom`, null, {
        params: {
          symptomId,
          isActive,
        },
      });

      if (response.status === 200) {
        const message = isActive
          ? '✅ Síntoma activado exitosamente'
          : '✅ Síntoma desactivado exitosamente';
        setSuccessMsg(message);
  

      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al actualizar síntoma';
      setErrorMsg(errorMsg);

      // rollback si falla algo en el backend
      setSymptomsPaged(prev => ({
        ...prev,
        items: prev.items.map(s =>
          s.id === symptomId ? { ...s, isActive: !isActive } : s
        ),
      }));

      //setTimeout(() => setErrorMsg(null), 3000);
    } finally{
      setLoadingToggleVac(prev => ({ ...prev, [symptomId]: false }));
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  // Actualizar estado de vacuna
  const updateVaccineStatus = async (vaccineId: string, isActive: boolean) => {
    
    if (loadingToggleVac[vaccineId]) return;

    setLoadingToggleVac(prev => ({ ...prev, [vaccineId]: true }));


     setVaccinesPaged(prev => {
        let updatedItems = prev.items.map(v =>
          v.id === vaccineId ? { ...v, isActive } : v
        );

        // 👇 aplicar filtro actual
        if (vacFilterActive === 'active') {
          updatedItems = updatedItems.filter(v => v.isActive);
        } else if (vacFilterActive === 'inactive') {
          updatedItems = updatedItems.filter(v => !v.isActive);
        }

        return {
          ...prev,
          items: updatedItems,
        };
      });

    
    
    try {
      const response = await api.post(`/Catalog/updateStatus/vaccine`, null, {
        params: {
          vaccineId,
          isActive,
        },
      });

      if (response.status === 200) {
        const message = isActive
          ? '✅ Vacuna activada exitosamente'
          : '✅ Vacuna desactivada exitosamente';
        setSuccessMsg(message);
        //fetchVaccines(vaccinesPaged.pageNumber, vacSearchTerm, vacFilterActive);
        //setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al actualizar vacuna';
      setErrorMsg(errorMsg);

      // rollback si falla
      setVaccinesPaged(prev => ({
        ...prev,
        items: prev.items.map(v =>
          v.id === vaccineId ? { ...v, isActive: !isActive } : v
        ),
      }));

      // setTimeout(() => setErrorMsg(null), 3000);
    } finally{
      setLoadingToggleVac(prev => ({ ...prev, [vaccineId]: false }));
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  // Filtrar síntomas
  // const filteredSymptoms = symptoms.filter(s => {
  //   const matchesSearch = s.name.toLowerCase().includes(symSearchTerm.toLowerCase());
  //   const matchesActive = symFilterActive === null || (symFilterActive === 'active' ? s.isActive : !s.isActive);
  //   return matchesSearch && matchesActive;
  // });
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVaccines(1, vacSearchTerm, vacFilterActive);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [vacSearchTerm, vacFilterActive]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSymptoms(1, symSearchTerm, symFilterActive);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [symSearchTerm, symFilterActive]);

 
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="symptoms">Síntomas</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
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
                      placeholder="Ej: SYM001"
                      value={symptomForm.standardCode}
                      onChange={(e) => setSymptomForm({ ...symptomForm, standardCode: e.target.value })}
                      required
                      disabled={loadingSymForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sym-coding-system">Sistema de Codificación *</Label>
                    <Input
                      id="sym-coding-system"
                      placeholder="Ej: 12312312"
                      value={symptomForm.codingSystem}
                      onChange={(e) => setSymptomForm({ ...symptomForm, codingSystem: e.target.value })}
                      required
                      disabled={loadingSymForm}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sym-description">Descripción</Label>
                  <Textarea
                    id="sym-description"
                    placeholder="Elevación de la temperatura corporal por encima de lo normal..."
                    value={symptomForm.description}
                    onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                    disabled={loadingSymForm}
                    rows={3}
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
                {symptomsPaged.totalCount} síntoma(s) encontrado(s) - Página {symptomsPaged.pageNumber} de {Math.ceil(symptomsPaged.totalCount / symptomsPaged.pageSize)}
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
              ) : symptomsPaged.items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay síntomas registrados</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {symptomsPaged.items.map(sym => (
                          <TableRow key={sym.id}>
                            <TableCell className="font-medium">{sym.name}</TableCell>
                            <TableCell>{sym.category}</TableCell>
                            <TableCell className="text-sm text-gray-500">{sym.standardCode}</TableCell>
                            <TableCell>
                              <Badge variant={sym.isActive ? 'default' : 'secondary'}>
                                {sym.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={sym.isActive}
                                  disabled={loadingToggleVac[sym.id]}
                                  onCheckedChange={(checked) => updateSymptomStatus(sym.id, checked)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-gray-600">
                      Mostrando {((symptomsPaged.pageNumber - 1) * symptomsPaged.pageSize) + 1} a {Math.min(symptomsPaged.pageNumber * symptomsPaged.pageSize, symptomsPaged.totalCount)} de {symptomsPaged.totalCount}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSymptoms(symptomsPaged.pageNumber - 1, symSearchTerm, symFilterActive)}
                        disabled={symptomsPaged.pageNumber <= 1 || loadingData}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSymptoms(symptomsPaged.pageNumber + 1, symSearchTerm, symFilterActive)}
                        disabled={symptomsPaged.pageNumber >= Math.ceil(symptomsPaged.totalCount / symptomsPaged.pageSize) || loadingData}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
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
                      value={vaccineForm.type}
                      onValueChange={(v) => setVaccineForm({ ...vaccineForm, type: v })}
                      disabled={loadingVacForm}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vaccineTypes.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                  <div>
                    <Label htmlFor="vac-manufacturer">Fabricante *</Label>
                    {isLoadingManufacturers ? (
                      <div className="flex items-center justify-center h-10 bg-gray-100 rounded border border-gray-300">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <Select
                        value={showNewManufacturer ? 'new' : vaccineForm.manufacturerDto.id}
                        onValueChange={(value) => {
                          if (value === 'new') {
                            setShowNewManufacturer(true);
                            setVaccineForm({
                              ...vaccineForm,
                              manufacturerDto: {
                                id: '',
                                name: '',
                                country: '',
                                isNew: true
                              }
                            });
                          } else {
                            const selected = manufacturers.find(m => m.id === value);
                            if (selected) {
                              setShowNewManufacturer(false);
                              setVaccineForm({
                                ...vaccineForm,
                                manufacturerDto: {
                                  id: selected.id,
                                  name: selected.name,
                                  country: selected.country,
                                  isNew: false
                                }
                              });
                            }
                          }
                        }}
                        disabled={loadingVacForm}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un fabricante" />
                        </SelectTrigger>
                        <SelectContent>
                          {manufacturers.map(mfg => (
                            <SelectItem key={mfg.id} value={mfg.id}>
                              {mfg.name} - {mfg.country}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">+ Agregar otro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {showNewManufacturer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
                    <div>
                      <Label htmlFor="new-mfg-name">Nombre del Fabricante *</Label>
                      <Input
                        id="new-mfg-name"
                        placeholder="Ej: Instituto Finlay de Vacunas"
                        value={vaccineForm.manufacturerDto.name}
                        onChange={(e) => setVaccineForm({
                          ...vaccineForm,
                          manufacturerDto: {
                            ...vaccineForm.manufacturerDto,
                            name: e.target.value
                          }
                        })}
                        required={showNewManufacturer}
                        disabled={loadingVacForm}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-mfg-country">País *</Label>
                      <Input
                        id="new-mfg-country"
                        placeholder="Ej: Cuba"
                        value={vaccineForm.manufacturerDto.country}
                        onChange={(e) => setVaccineForm({
                          ...vaccineForm,
                          manufacturerDto: {
                            ...vaccineForm.manufacturerDto,
                            country: e.target.value
                          }
                        })}
                        required={showNewManufacturer}
                        disabled={loadingVacForm}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="vac-description">Descripción</Label>
                  <Textarea
                    id="vac-description"
                    placeholder="Descripción de la vacuna..."
                    value={vaccineForm.description}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, description: e.target.value })}
                    disabled={loadingVacForm}
                    rows={3}
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
                {vaccinesPaged.totalCount} vacuna(s) encontrada(s) - Página {vaccinesPaged.pageNumber} de {Math.ceil(vaccinesPaged.totalCount / vaccinesPaged.pageSize)}
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
              ) : vaccinesPaged.items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay vacunas registradas</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Aprobación</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vaccinesPaged.items.map(vac => (
                          <TableRow key={vac.id}>
                            <TableCell className="font-medium">{vac.name}</TableCell>
                            <TableCell>{vaccineTypes.find(t => t.id === vac.type)?.name || vac.type}</TableCell>
                            <TableCell className="text-sm text-gray-500">{vac.code}</TableCell>
                            <TableCell className="text-sm">{new Date(vac.approvalDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={vac.isActive ? 'default' : 'secondary'}>
                                {vac.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={vac.isActive}
                                  disabled={loadingToggleVac[vac.id]}
                                  onCheckedChange={(checked) => updateVaccineStatus(vac.id, checked)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-gray-600">
                      Mostrando {((vaccinesPaged.pageNumber - 1) * vaccinesPaged.pageSize) + 1} a {Math.min(vaccinesPaged.pageNumber * vaccinesPaged.pageSize, vaccinesPaged.totalCount)} de {vaccinesPaged.totalCount}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchVaccines(vaccinesPaged.pageNumber - 1, vacSearchTerm, vacFilterActive)}
                        disabled={vaccinesPaged.pageNumber <= 1 || loadingData}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchVaccines(vaccinesPaged.pageNumber + 1, vacSearchTerm, vacFilterActive)}
                        disabled={vaccinesPaged.pageNumber >= Math.ceil(vaccinesPaged.totalCount / vaccinesPaged.pageSize) || loadingData}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: LOTES */}
        <TabsContent value="lotes" className="space-y-6">
          {/* Formulario Agregar Lotes */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Lote</CardTitle>
              <CardDescription>Selecciona una vacuna del Instituto Finlay y registra el lote</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLot} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lot-number">Número de Lote *</Label>
                    <Input
                      id="lot-number"
                      placeholder="Ej: ABD-1223"
                      value={lotForm.lotNumber}
                      onChange={(e) => setLotForm({ ...lotForm, lotNumber: e.target.value })}
                      required
                      disabled={loadingLotForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lot-vaccine">Vacuna (Instituto Finlay) *</Label>
                    {isLoadingVaccines ? (
                      <div className="flex items-center justify-center h-10 bg-gray-100 rounded border border-gray-300">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <Select
                        value={lotForm.vaccineId}
                        onValueChange={(value) =>
                          setLotForm({ ...lotForm, vaccineId: value })
                        }
                        disabled={loadingLotForm}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Seleccione la vacuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {finlayVaccines.length > 0 ? (
                            finlayVaccines.map((vaccine) => (
                              <SelectItem key={vaccine.id} value={vaccine.id}>
                                {vaccine.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="otro" disabled>
                              No hay vacunas disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loadingLotForm || !lotForm.lotNumber || !lotForm.vaccineId}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#0A4B8F' }}
                >
                  <Plus className="w-4 h-4" />
                  {loadingLotForm ? 'Registrando...' : 'Registrar Lote'}
                </Button>
              </form>
            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>
    </div>
  );
};
























