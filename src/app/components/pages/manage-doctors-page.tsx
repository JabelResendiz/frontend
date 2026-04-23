import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Plus, Trash2, Users, ChevronDown, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { doctorService, type Doctor, type DoctorRegistrationData, type MedicalReviewer, type PaginatedResponse } from "@/app/services/doctor.service";
import { getMunicipalityNameById, getProvinceNameById } from "../../data/municipalities";



interface ManageDoctorsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

const generatePassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function ManageDoctorsPage({ onNavigate }: ManageDoctorsPageProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicalReviewers, setMedicalReviewers] = useState<MedicalReviewer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(true);
  const [expandedReviewers, setExpandedReviewers] = useState<Set<number>>(new Set());
  const [expandedDoctors, setExpandedDoctors] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(3);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    institution: "",
    professionalLicense: "",
    identityNumber: "",
    dateOfBirth: "",
    specialty: "",
  });

  // Load medical reviewers on mount and when page changes
  useEffect(() => {
    const fetchMedicalReviewers = async () => {
      try {
        setIsLoadingReviewers(true);
        const response = await doctorService.getMedicalReviewersByCurrentUserMunicipality(currentPage, pageSize);
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
  }, [currentPage, pageSize]);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData({ ...formData, password: newPassword });
    toast.success("Contraseña generada");
  };

  const handleAddDoctor = async () => {
    if (!formData.userName || !formData.email || !formData.password || !formData.phoneNumber || 
        !formData.institution || !formData.professionalLicense || !formData.identityNumber || 
        !formData.dateOfBirth || !formData.specialty) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsLoading(true);
      const registrationData: DoctorRegistrationData = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        institution: formData.institution,
        professionalLicense: formData.professionalLicense,
        identityNumber: formData.identityNumber,
        dateOfBirth: formData.dateOfBirth,
        specialty: formData.specialty,
      };

      const response = await doctorService.registerMedicalReviewer(registrationData);

      // Determinar si es éxito o error basado en la respuesta
      if (response.success === true || response.type === 'OperationSuccess' || response.type?.toLowerCase().includes('success')) {
        toast.success(response.message || "Médico registrado exitosamente");
        
        // Agregar a la lista local
        setDoctors([...doctors, { 
          id: Date.now().toString(),
          ...formData 
        } as Doctor]);

        setFormData({
          userName: "",
          email: "",
          password: "",
          phoneNumber: "",
          institution: "",
          professionalLicense: "",
          identityNumber: "",
          dateOfBirth: "",
          specialty: "",
        });
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

  const handleDelete = () => {
    if (deleteConfirm) {
      setDoctors(doctors.filter((_, idx) => idx.toString() !== deleteConfirm));
      toast.success("Médico eliminado");
      setDeleteConfirm(null);
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
      dateOfBirth: "",
      specialty: "",
    });
    setShowForm(false);
  };

  const toggleExpandDoctor = (index: number) => {
    const newExpanded = new Set(expandedDoctors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDoctors(newExpanded);
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

        {/* Form */}
        {showForm && (
          <Card className="border-0 shadow-lg mb-8">
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      placeholder="Generar o escribir contraseña"
                      value={formData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      onClick={handleGeneratePassword}
                      type="button"
                    >
                      Generar
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Teléfono *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="55664266"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution">Institución *</Label>
                  <Input
                    id="institution"
                    placeholder="Hospital Provincial"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad *</Label>
                  <Input
                    id="specialty"
                    placeholder="Medicina General"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="professionalLicense">Cédula Profesional *</Label>
                  <Input
                    id="professionalLicense"
                    placeholder="334324eref"
                    value={formData.professionalLicense}
                    onChange={(e) => setFormData({ ...formData, professionalLicense: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="identityNumber">Cédula de Identidad *</Label>
                  <Input
                    id="identityNumber"
                    placeholder="03040712121"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                <Input
                  id="dateOfBirth"
                  type="datetime-local"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleAddDoctor}
                  disabled={isLoading}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Nombre Completo</p>
                                <p className="text-sm text-gray-900">{reviewer.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                                <p className="text-sm text-gray-900">{reviewer.email}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</p>
                                <p className="text-sm text-gray-900">{reviewer.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Institución</p>
                                <p className="text-sm text-gray-900">{reviewer.institution}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Provincia</p>
                                <p className="text-sm text-gray-900">{getProvinceNameById(reviewer.provinceId)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Municipio</p>
                                <p className="text-sm text-gray-900">{getMunicipalityNameById(reviewer.provinceId,reviewer.municipalityId)}</p>
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
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{Math.ceil(totalCount / pageSize)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!previousPageUrl}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!nextPageUrl}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctors List */}
        
        {doctors.length === 0 && !showForm ? (
          <Card className="border border-dashed">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No hay médicos registrados aún</p>
              <Button
                className="text-white font-semibold"
                style={{ backgroundColor: "#0A4B8F" }}
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Primer Médico
              </Button>
            </CardContent>
          </Card>
        ) : doctors.length > 0 && (
          <div className="space-y-2">
            {doctors.map((doctor, index) => {
              const isExpanded = expandedDoctors.has(index);

              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    {/* Compact View */}
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpandDoctor(index)}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {doctor.userName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doctor.specialty} • {doctor.institution}
                          </p>
                        </div>

                        <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700">
                          Registrado
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(index.toString());
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Usuario</p>
                            <p className="text-sm text-gray-900">{doctor.userName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                            <p className="text-sm text-gray-900">{doctor.email}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</p>
                            <p className="text-sm text-gray-900">{doctor.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Institución</p>
                            <p className="text-sm text-gray-900">{doctor.institution}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Especialidad</p>
                            <p className="text-sm text-gray-900">{doctor.specialty}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cédula Profesional</p>
                            <p className="text-sm text-gray-900">{doctor.professionalLicense}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cédula de Identidad</p>
                            <p className="text-sm text-gray-900">{doctor.identityNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fecha de Nacimiento</p>
                            <p className="text-sm text-gray-900">
                              {new Date(doctor.dateOfBirth).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Médico</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este médico? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
