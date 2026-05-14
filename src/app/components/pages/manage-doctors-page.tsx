import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Plus, Users, ChevronDown, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { doctorService, type DoctorRegistrationData, type MedicalReviewer } from "@/app/services/doctor.service";
import { getMunicipalityNameById, getProvinceNameById } from "../../data/municipalities";



interface ManageDoctorsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

const generatePassword = (): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%";
  const allChars = upper + lower + digits + symbols;

  const required = [
    digits.charAt(Math.floor(Math.random() * digits.length)),
    symbols.charAt(Math.floor(Math.random() * symbols.length)),
  ];

  let password = [...required];
  for (let i = 0; i < 10; i++) {
    password.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  return password.sort(() => Math.random() - 0.5).join("");
};

export function ManageDoctorsPage({ onNavigate }: ManageDoctorsPageProps) {
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
  const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  const formatDateToMidnight = (date: string) => `${date}T00:00:00`;

  const getNewYorkToday = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  };

  const validateMinimumAge = (dateOfBirth: string, minAge: number): boolean => {
    const todayNY = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    todayNY.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${dateOfBirth}T00:00:00`);
    selectedDate.setHours(0, 0, 0, 0);

    const cutoff = new Date(todayNY);
    cutoff.setFullYear(cutoff.getFullYear() - minAge);
    return selectedDate <= cutoff;
  };

  const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

  const validatePassword = (password: string): boolean => {
    const hasDigit = /\d/.test(password);
    const hasSpecial = SPECIAL_CHAR_REGEX.test(password);
    return password.length >= 8 && hasDigit && hasSpecial;
  };

  const validateIdentityNumber = (identityNumber: string): boolean => /^\d{11}$/.test(identityNumber);

  const validatePhoneNumber = (phoneNumber: string): boolean => /^\d+$/.test(phoneNumber);

  const validateInstitution = (institution: string): boolean => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(institution.trim());

  const validateIdentityMatchesDate = (identityNumber: string, dateOfBirth: string): boolean => {
    if (!validateIdentityNumber(identityNumber) || !dateOfBirth) return false;
    const yy = identityNumber.substring(0, 2);
    const mm = identityNumber.substring(2, 4);
    const dd = identityNumber.substring(4, 6);
    const year = parseInt(yy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);
    const currentYearTwoDigits = new Date().getFullYear() % 100;
    const fullYear = year > currentYearTwoDigits ? 1900 + year : 2000 + year;
    const extractedDate = new Date(fullYear, month - 1, day);
    if (isNaN(extractedDate.getTime())) return false;
    return extractedDate.toISOString().slice(0, 10) === dateOfBirth;
  };

  const validateDateOfBirth = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return false;
    const todayNY = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    todayNY.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${dateOfBirth}T00:00:00`);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate <= todayNY && validateMinimumAge(dateOfBirth, 18);
  };

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
      case 'password':
        if (value && !validatePassword(value)) {
          errors.password = "Debe tener al menos 8 caracteres, un número y un carácter especial.";
        } else {
          delete errors.password;
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
        } else if (value && formData.dateOfBirth && !validateIdentityMatchesDate(value, formData.dateOfBirth)) {
          errors.identityNumber = "La fecha de nacimiento no coincide con la cédula de identidad.";
        } else {
          delete errors.identityNumber;
        }
        break;
      case 'dateOfBirth':
        if (value && !validateDateOfBirth(value)) {
          errors.dateOfBirth = "La fecha debe ser anterior a hoy y corresponder a mayores de 17 años.";
        } else if (value && formData.identityNumber && !validateIdentityMatchesDate(formData.identityNumber, value)) {
          errors.dateOfBirth = "La fecha de nacimiento no coincide con la cédula de identidad.";
        } else {
          delete errors.dateOfBirth;
        }
        break;
    }
    setFieldErrors(errors);
    setHasValidationErrors(Object.keys(errors).length > 0);
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData({ ...formData, password: newPassword });
    validateField('password', newPassword);
    toast.success("Contraseña generada");
  };

  const handleAddDoctor = async () => {
    // Clear previous errors
    setFieldErrors({});

    if (!formData.userName || !formData.email || !formData.password || !formData.phoneNumber ||
        !formData.institution || !formData.professionalLicense || !formData.identityNumber ||
        !formData.dateOfBirth || !formData.specialty) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validate all fields
    const errors: Record<string, string> = {};
    if (!validateEmail(formData.email)) errors.email = "Email inválido";
    if (!validatePassword(formData.password)) errors.password = "La contraseña debe tener al menos 8 caracteres, incluir al menos un número y un carácter especial.";
    if (!validatePhoneNumber(formData.phoneNumber)) errors.phoneNumber = "Teléfono inválido. Solo se permiten dígitos sin espacios.";
    if (!validateInstitution(formData.institution)) errors.institution = "La institución debe comenzar con una letra.";
    if (!validateIdentityNumber(formData.identityNumber)) errors.identityNumber = "La cédula de identidad debe contener exactamente 11 dígitos sin espacios.";
    if (!validateDateOfBirth(formData.dateOfBirth)) errors.dateOfBirth = "La fecha de nacimiento debe ser anterior a hoy y corresponder a mayores de 17 años.";
    if (!validateIdentityMatchesDate(formData.identityNumber, formData.dateOfBirth)) {
      errors.identityNumber = "La fecha de nacimiento no coincide con la cédula de identidad.";
      errors.dateOfBirth = "La fecha de nacimiento no coincide con la cédula de identidad.";
    }

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
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        institution: formData.institution.trim(),
        professionalLicense: formData.professionalLicense.trim(),
        identityNumber: formData.identityNumber,
        dateOfBirth: formatDateToMidnight(formData.dateOfBirth),
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
          dateOfBirth: "",
          specialty: "",
        });
        setFieldErrors({});
        setHasValidationErrors(false);

        // Recargar la lista de médicos revisores
        const refreshed = await doctorService.getMedicalReviewersByCurrentUserMunicipality(currentPage, pageSize);
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
      dateOfBirth: "",
      specialty: "",
    });
    setFieldErrors({});
    setHasValidationErrors(false);
    setShowForm(false);
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
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      placeholder="Generar o escribir contraseña"
                      value={formData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, password: e.target.value });
                        validateField('password', e.target.value);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={handleGeneratePassword}
                      type="button"
                    >
                      Generar
                    </Button>
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
                </div>
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

              <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  max={getNewYorkToday()}
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    validateField('dateOfBirth', e.target.value);
                  }}
                />
                {fieldErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{fieldErrors.dateOfBirth}</p>}
                {formData.identityNumber && formData.identityNumber.length === 11 && (
                  <p className="text-blue-600 text-sm mt-1">
                    La fecha debe coincidir con los primeros 6 dígitos de la cédula de identidad (YYMMDD).
                  </p>
                )}
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


      </div>


    </div>
  );
}
