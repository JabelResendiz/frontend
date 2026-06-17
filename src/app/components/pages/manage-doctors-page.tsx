import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Plus, Users, ChevronDown, Loader2, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { doctorService, type DoctorRegistrationData, type MedicalReviewer } from "@/app/services/doctor.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";



interface ManageDoctorsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}


export default function ManageDoctorsPage({ onNavigate }: ManageDoctorsPageProps) {
  void onNavigate;
  const [medicalReviewers, setMedicalReviewers] = useState<MedicalReviewer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(true);
  const [expandedReviewers, setExpandedReviewers] = useState<Set<number>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    institution: "",
    professionalLicense: "",
    identityNumber: "",
    specialty: "",
  });

  // Load medical reviewers on mount and when filters/pagination changes
  useEffect(() => {
    const fetchMedicalReviewers = async () => {
      try {
        setIsLoadingReviewers(true);
        const response = await doctorService.getMedicalReviewersByCurrentUserMunicipality(
          currentPage,
          pageSize,
          searchTerm,
          specialityFilter,
          sortBy,
          order
        );
        setMedicalReviewers(response.items);
        setTotalCount(response.totalCount);
        setNextPageUrl(response.nextPageUrl || null);
        setPreviousPageUrl(response.previousPageUrl || null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al obtener médicos revisores';
        toast.error(errorMessage);
        console.error(error);
      } finally {
        setIsLoadingReviewers(false);
      }
    };

    fetchMedicalReviewers();
  }, [currentPage, pageSize, searchTerm, specialityFilter, sortBy, order]);

  const SPECIALTY_OPTIONS = [
    "Medicina General",
    "Pediatría",
    "Ginecología",
    "Cardiología",
    "Neurología",
    "Ortopedia",
    "Dermatología",
    "Psiquiatría",
    "Endocrinología",
    "Gastroenterología",
    "Urología",
    "Neumología",
    "Oncología",
    "Obstetricia",
    "Cirugía General",
  ];

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

  const validateIdentityNumber = (identityNumber: string): boolean =>/^\d{11}$/.test(identityNumber);

  const validatePhoneNumber = (phoneNumber: string): boolean => /^\d+$/.test(phoneNumber);

  const validateInstitution = (institution: string): boolean => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(institution.trim());

  const validateIdentityMatchesDate = (identityNumber: string): boolean => {
    if (!validateIdentityNumber(identityNumber)) return false;
    const yy = identityNumber.substring(0, 2);
    const mm = identityNumber.substring(2, 4);
    const dd = identityNumber.substring(4, 6);
    const year = parseInt(yy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);


    const currentYearTwoDigits = new Date().getFullYear() % 100;

    console.log(currentYearTwoDigits);

    const fullYear = year > currentYearTwoDigits ? 1900 + year : 2000 + year;
    
    console.log(fullYear);
    if(month > 12 || month < 1)return false;
    if(day > 31 || day <1) return false;
    if([4,6,9,11].includes(month))return day<31;

    if(fullYear % 4 == 0)
    {
      if(month==2) return day<30;
      
      return true;

    }

    if(month==2) return day<29;

    return true;
     
  };

  
  const assignmentChartColors = ["#10B981", "#F59E0B", "#EF4444"];

  const getAssignmentDistribution = (reviewer: MedicalReviewer) => {
    const completed = reviewer.completedAssignments ?? 0;
    const pending = reviewer.pendingAssignments ?? 0;
    const expired = reviewer.expiredAssignments ?? 0;

    return [
      { name: "Completadas", value: completed, fill: assignmentChartColors[0] },
      { name: "Pendientes", value: pending, fill: assignmentChartColors[1] },
      { name: "Expiradas", value: expired, fill: assignmentChartColors[2] },
    ];
  };

  const getAssignmentTotal = (reviewer: MedicalReviewer) => {
    return (
      (reviewer.completedAssignments ?? 0) +
      (reviewer.pendingAssignments ?? 0) +
      (reviewer.expiredAssignments ?? 0)
    );
  };

  function CustomAssignmentPieTooltip({ active, payload, total }: any) {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0];
    const value = point?.value ?? 0;
    const name = point?.name ?? point?.payload?.name ?? 'Elemento';
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    return (
      <div className="bg-slate-900 text-white rounded-lg p-3 shadow-lg border border-slate-700 text-sm">
        <div className="font-semibold">{name}</div>
        <div className="text-slate-200 mt-1">{value} reportes</div>
        <div className="text-emerald-400 font-medium mt-1">{percent}% del total</div>
      </div>
    );
  }

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = "Formato de email inválido.";
        } else {
          delete errors.email;
        }
        break;
      case 'phoneNumber':
        if (value && !validatePhoneNumber(value)) {
          errors.phoneNumber = "Solo se permiten dígitos sin espacios.";
        } else {
          delete errors.phoneNumber;
        }
        break;
      case 'institution':
        if (value && !validateInstitution(value)) {
          errors.institution = "Debe comenzar con una letra.";
        } else {
          delete errors.institution;
        }
        break;
      case 'identityNumber':
        if (value && !validateIdentityNumber(value)) {
          errors.identityNumber = "Debe contener exactamente 11 dígitos.";
        } 
        if(!validateIdentityMatchesDate(value))
        {
          errors.identityNumber = "Rectifica el número de identidad";
        }
        // if(!validateAge(value))
        // {
        //   errors.identityNumber = "Debe ser mayor a 17 años";
        // }
        else {
          delete errors.identityNumber;
        }
        break;
      
    }
    setFieldErrors(errors);
    setHasValidationErrors(Object.keys(errors).length > 0);
  };

  const handleAddDoctor = async () => {
    // Clear previous errors
    setFieldErrors({});

    if (!formData.userName || !formData.email || !formData.phoneNumber ||
        !formData.institution || !formData.professionalLicense || !formData.identityNumber || !formData.specialty) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validate all fields
    const errors: Record<string, string> = {};
    if (!validateEmail(formData.email)) errors.email = "Email inválido";
    if (!validatePhoneNumber(formData.phoneNumber)) errors.phoneNumber = "Teléfono inválido. Solo se permiten dígitos sin espacios.";
    if (!validateInstitution(formData.institution)) errors.institution = "La institución debe comenzar con una letra.";
    if (!validateIdentityNumber(formData.identityNumber)) errors.identityNumber = "La cédula de identidad debe contener exactamente 11 dígitos sin espacios.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setHasValidationErrors(true);
      return;
    }

    try {
      setIsLoading(true);
      const registrationData: DoctorRegistrationData = {
        userName: formData.userName,
        email: formData.email.trim(),
        password: "Passwrod_123!",
        phoneNumber: formData.phoneNumber,
        institution: formData.institution.trim(),
        professionalLicense: formData.professionalLicense.trim(),
        identityNumber: formData.identityNumber,
        specialty: formData.specialty,
      };

      const response = await doctorService.registerMedicalReviewer(registrationData);

      // Determinar si es éxito o error basado en la respuesta
      if (response.success === true || response.type === 'OperationSuccess' || response.type?.toLowerCase().includes('success')) {
        toast.success(response.message || "Médico registrado exitosamente");

        setFormData({
          userName: "",
          email: "",
          password: "",
          phoneNumber: "",
          institution: "",
          professionalLicense: "",
          identityNumber: "",
          specialty: "",
        });
        setFieldErrors({});
        setHasValidationErrors(false);

        // Recargar la lista de médicos revisores
        const refreshed = await doctorService.getMedicalReviewersByCurrentUserMunicipality(
          currentPage,
          pageSize,
          searchTerm,
          specialityFilter,
          sortBy,
          order
        );
        setMedicalReviewers(refreshed.items);
        setTotalCount(refreshed.totalCount);

        setShowForm(false);
      } else {
        toast.error(response.message || "Error al registrar el médico");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar médico';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      phoneNumber: "",
      institution: "",
      professionalLicense: "",
      identityNumber: "",
      specialty: "",
    });
    setFieldErrors({});
    setHasValidationErrors(false);
    setShowForm(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialityFilter("");
    setSortBy("createdAt");
    setOrder("desc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
                Gestionar Médicos Revisores
              </h1>
              <p className="text-gray-600">
                Total de médicos revisores en el municipio: {totalCount}
              </p>
            </div>
            {!showForm && (
              <Button
                className="text-white font-semibold px-6 py-3"
                style={{ backgroundColor: "#0A4B8F" }}
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Médico
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        {!showForm && (
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre de usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleSearch}
                  disabled={isLoadingReviewers}
                >
                  Buscar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-end">
                <div>
                  <Label htmlFor="speciality-filter" className="text-sm font-medium text-gray-700">
                    Filtrar por especialidad
                  </Label>
                  <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                    <SelectTrigger id="speciality-filter">
                      <SelectValue placeholder="Selecciona especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort-by" className="text-sm font-medium text-gray-700">
                    Ordenar por
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by">
                      <SelectValue placeholder="Selecciona campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Fecha de Registro</SelectItem>
                      <SelectItem value="fullName">Nombre</SelectItem>
                      <SelectItem value="totalassignments">Total Asignaciones</SelectItem>
                      <SelectItem value="averagetimereview">Tiempo promedio de Revisión</SelectItem>
                      <SelectItem value="expiredassignments">Asignaciones Expiradas</SelectItem>
                      <SelectItem value="completedassignments">Asignaciones Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order" className="text-sm font-medium text-gray-700">
                    Orden
                  </Label>
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger id="order">
                      <SelectValue placeholder="Selecciona orden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascendente</SelectItem>
                      <SelectItem value="desc">Descendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleFilterChange}
                  disabled={isLoadingReviewers}
                >
                  Aplicar
                </Button>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={isLoadingReviewers}
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {showForm && (
          <Card className="border-0 shadow-lg mb-8">
            {hasValidationErrors && (
              <div className="bg-red-50 border border-red-200 rounded-t-lg p-4 mb-0">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">Hay errores en el formulario</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Por favor, corrige los problemas marcados antes de enviar el formulario.
                </p>
              </div>
            )}
            <CardHeader>
              <CardTitle>Agregar Nuevo Médico Revisor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Nombre de Usuario *</Label>
                  <Input
                    id="userName"
                    placeholder="juan.perez"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      validateField('email', e.target.value);
                    }}
                  />
                  {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Teléfono *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Solo números, ej: 55664266"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phoneNumber: value });
                      validateField('phoneNumber', value);
                    }}
                  />
                  {fieldErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution">Institución *</Label>
                  <Input
                    id="institution"
                    placeholder="Debe comenzar con letra, ej: Hospital Provincial"
                    value={formData.institution}
                    onChange={(e) => {
                      setFormData({ ...formData, institution: e.target.value });
                      validateField('institution', e.target.value);
                    }}
                  />
                  {fieldErrors.institution && <p className="text-red-500 text-sm mt-1">{fieldErrors.institution}</p>}
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad *</Label>
                  <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Selecciona especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="professionalLicense">Número de Registro Profesional *</Label>
                  <Input
                    id="professionalLicense"
                    placeholder="334324eref"
                    value={formData.professionalLicense}
                    onChange={(e) => setFormData({ ...formData, professionalLicense: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="identityNumber">Número de Identidad *</Label>
                  <Input
                    id="identityNumber"
                    placeholder="Solo números, 11 dígitos, ej: 80040712121"
                    maxLength={11}
                    value={formData.identityNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, identityNumber: value });
                      validateField('identityNumber', value);
                    }}
                  />
                  {fieldErrors.identityNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.identityNumber}</p>}
                </div>
              </div>

              

              <div className="flex gap-3 pt-4">
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleAddDoctor}
                  disabled={isLoading || hasValidationErrors}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Médico"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical Reviewers Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#0A4B8F" }}>
            Médicos Revisores del Municipio
          </h2>
          
          {isLoadingReviewers ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Cargando médicos revisores...</p>
              </CardContent>
            </Card>
          ) : medicalReviewers.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay médicos revisores registrados para este municipio</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="space-y-2">
                {medicalReviewers.map((reviewer, index) => {
                  const isExpanded = expandedReviewers.has(index);

                  return (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        {/* Compact View */}
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => {
                          const newExpanded = new Set(expandedReviewers);
                          if (newExpanded.has(index)) {
                            newExpanded.delete(index);
                          } else {
                            newExpanded.add(index);
                          }
                          setExpandedReviewers(newExpanded);
                        }}>
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {reviewer.fullName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {reviewer.institution}
                              </p>
                            </div>

                            <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700">
                              Registrado
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-2">
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Expanded View */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div className="grid gap-4 lg:grid-cols-[220px_1fr] items-center">
                              <div className="h-40 w-full rounded-lg bg-slate-50 border border-slate-200 p-3">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={getAssignmentDistribution(reviewer)}
                                      dataKey="value"
                                      nameKey="name"
                                      innerRadius={30}
                                      outerRadius={60}
                                      paddingAngle={2}
                                    >
                                      {getAssignmentDistribution(reviewer).map((item) => (
                                        <Cell key={item.name} fill={item.fill} />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip content={(props) => <CustomAssignmentPieTooltip {...props} total={getAssignmentTotal(reviewer)} />} />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-2 text-center text-xs text-slate-500">Distribución de asignaciones</div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {(() => {
                                  const total = getAssignmentTotal(reviewer);
                                  const completed = reviewer.completedAssignments ?? 0;
                                  const pending = reviewer.pendingAssignments ?? 0;
                                  const expired = reviewer.expiredAssignments ?? 0;
                                  const avg = reviewer.averageTimeReview ?? 0;
                                  const tiles = [
                                    { title: 'Nombre', value: reviewer.fullName || '-' },
                                    { title: 'Teléfono', value: reviewer.phoneNumber || '-' },
                                    { title: 'Institución', value: reviewer.institution || '-' },
                                    { title: 'Total', value: total, isTotal: true },
                                    { title: 'Completadas', value: `${completed}${total>0 ? ` (${((completed/total)*100).toFixed(1)}%)` : ' (0.0%)'}` },
                                    { title: 'Pendientes', value: `${pending}${total>0 ? ` (${((pending/total)*100).toFixed(1)}%)` : ' (0.0%)'}` },
                                    { title: 'Expiradas', value: `${expired}${total>0 ? ` (${((expired/total)*100).toFixed(1)}%)` : ' (0.0%)'}` },
                                    { title: 'Tiempo Promedio', value: `${avg} horas` },
                                  ];

                                  return tiles.map((t) => (
                                    <div
                                      key={t.title}
                                      className={`rounded-xl border p-3 text-sm ${t.isTotal && t.value === 0 ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                    >
                                      <div className="font-semibold text-slate-800">{t.title}</div>
                                      <div className="text-slate-600 mt-1">{t.value}</div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalCount > pageSize && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{Math.ceil(totalCount / pageSize)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!previousPageUrl}
                      onClick={() => previousPageUrl && setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                      ← Anterior
                    </Button>
                    <Button
                      className="text-white font-semibold"
                      style={{ 
                        backgroundColor: nextPageUrl ? "#0A4B8F" : "#93A4B5",
                      }}
                      disabled={!nextPageUrl}
                      onClick={() => nextPageUrl && setCurrentPage(currentPage + 1)}
                    >
                      Siguiente →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      </div>


    </div>
  );
}
