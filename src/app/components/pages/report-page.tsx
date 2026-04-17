import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Shield, FileJson } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { FormData, UpdateFormData } from "./report-page/types";
import { PatientInfoSection } from "./report-page/patient-info-section";
import { VaccineInfoSection } from "./report-page/vaccine-info-section";
import { AdverseEventSection } from "./report-page/adverse-event-section";
import { ReporterInfoSection } from "./report-page/reporter-info-section";
import ReCAPTCHA from "react-google-recaptcha";

interface ReportPageProps {
  onNavigate: (page: string) => void;
}

const initialFormData: FormData = {
  reporterFullName: "",
  reporterDateOfBirth: "",
  reporterGender: "",
  reporterProvince: "",
  reporterMunicipality: "",
  reporterPhoneNumber: "",
  reporterEmail: "",
  reporterRelationship: "",
  patientFullName: "",
  patientIdentityNumber: "",
  patientDateOfBirth: "",
  patientGender: "",
  patientProvince: "",
  patientMunicipality: "",
  patientAddress: "",
  patientPhoneNumber: "",
  patientEmail: "",
  patientIsPregnant: "",
  patientAge: "",
  vaccinations: [
    {
      vaccineName: "",
      vaccineManufacturer: "",
      vaccineBatchNumber: "",
      vaccinationDate: "",
      vaccinationSite: "",
      doseNumber: ""
    }
  ],
  eventDate: "",
  eventTime: "",
  eventDescription: "",
  eventSymptoms: [],
  eventOutcome: "",
  eventHospitalization: "",
  eventMedicalAttention: "",
  eventSeverity: "",
  patientMedicalHistory: "",
  currentMedications: "",
  allergies: "",
  otherVaccinesLastMonth: "",
  professionalDiagnosis: "",
  medicalTerminology: "",
  retClassification: "",
  laboratoryResults: "",
  clinicalSignificance: "",
  vaccinationFacilityType: "",
  contraindicationCriterion: "",
  reporterType: "",
  reporterCI: ""
};

export function ReportPage({ onNavigate }: ReportPageProps) {
  const { user } = useAuth();
  const isDoctor = user?.role === "MedicalReviewer" || user?.role === "Admin";
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const reporterFieldsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData: UpdateFormData = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "reporterRelationship") {
        const isChangingToPaciente = value === "paciente" && prev.reporterRelationship !== "paciente";
        const isChangingFromPaciente = prev.reporterRelationship === "paciente" && value !== "paciente";

        if (isChangingToPaciente) {
          if (updated.patientFullName || updated.patientDateOfBirth) {
            updated.reporterFullName = updated.patientFullName;
            updated.reporterDateOfBirth = updated.patientDateOfBirth;
            updated.reporterGender = updated.patientGender;
            updated.reporterProvince = updated.patientProvince;
            updated.reporterMunicipality = updated.patientMunicipality;
            updated.reporterPhoneNumber = updated.patientPhoneNumber;
            updated.reporterEmail = updated.patientEmail;
            setIsAutoFilled(true);

            setTimeout(() => {
              reporterFieldsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);

            toast.success("Información auto-completada", {
              description: "Se han llenado los datos del reportante con la información del sujeto vacunado."
            });
          }
        } else if (isChangingFromPaciente) {
          updated.reporterFullName = "";
          updated.reporterDateOfBirth = "";
          updated.reporterGender = "";
          updated.reporterProvince = "";
          updated.reporterMunicipality = "";
          updated.reporterPhoneNumber = "";
          updated.reporterEmail = "";
          setIsAutoFilled(false);

          toast.info("Campos limpiados", {
            description: "Por favor, completa los datos del nuevo reportante."
          });
        }
      }

      if (String(field).startsWith("reporter") && field !== "reporterRelationship") {
        setIsAutoFilled(false);
      }

      return updated;
    });
  };

  useEffect(() => {
    if (isAutoFilled) {
      const timer = setTimeout(() => setIsAutoFilled(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoFilled]);

  // Validación dinámica de fechas en tiempo real
  const validateDatesDynamic = (data: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar fecha de nacimiento del paciente
    if (data.patientDateOfBirth) {
      const patientBirthDate = new Date(data.patientDateOfBirth);
      patientBirthDate.setHours(0, 0, 0, 0);

      if (patientBirthDate > today) {
        errors.patientDateOfBirth = "La fecha de nacimiento no puede ser en el futuro";
      }

      // Validar contra evento si existe
      if (data.eventDate) {
        const eventDateObj = new Date(data.eventDate);
        eventDateObj.setHours(0, 0, 0, 0);
        if (patientBirthDate >= eventDateObj) {
          errors.patientDateOfBirth = "Debe ser anterior a la fecha del evento adverso";
        }
      }

      // Validar contra vacunaciones
      for (let i = 0; i < data.vaccinations.length; i++) {
        if (data.vaccinations[i].vaccinationDate) {
          const vaccinationDate = new Date(data.vaccinations[i].vaccinationDate);
          vaccinationDate.setHours(0, 0, 0, 0);
          if (patientBirthDate >= vaccinationDate) {
            errors[`vaccination_${i}_date`] = "La vacunación debe ser posterior al nacimiento";
            break;
          }
        }
      }
    }

    // Validar fechas de vacunación
    for (let i = 0; i < data.vaccinations.length; i++) {
      const vaccination = data.vaccinations[i];

      if (vaccination.vaccinationDate) {
        const vaccinationDate = new Date(vaccination.vaccinationDate);
        vaccinationDate.setHours(0, 0, 0, 0);

        if (vaccinationDate > today) {
          errors[`vaccination_${i}_date`] = "No puede ser en el futuro";
        }

        if (data.eventDate) {
          const eventDateObj = new Date(data.eventDate);
          eventDateObj.setHours(0, 0, 0, 0);
          if (vaccinationDate >= eventDateObj) {
            errors[`vaccination_${i}_date`] = "Debe ser anterior al evento adverso";
          }
        }
      }
    }

    // Validar fecha del evento
    if (data.eventDate) {
      const eventDateObj = new Date(data.eventDate);
      eventDateObj.setHours(0, 0, 0, 0);

      if (eventDateObj > today) {
        errors.eventDate = "No puede ser en el futuro";
      }

      // Validar que sea posterior a la fecha de nacimiento del paciente
      if (data.patientDateOfBirth) {
        const patientBirthDate = new Date(data.patientDateOfBirth);
        patientBirthDate.setHours(0, 0, 0, 0);
        if (eventDateObj <= patientBirthDate) {
          errors.eventDate = "Debe ser posterior a la fecha de nacimiento del paciente";
        }
      }

      // Validar que sea posterior a todas las fechas de vacunación
      for (let i = 0; i < data.vaccinations.length; i++) {
        if (data.vaccinations[i].vaccinationDate) {
          const vaccinationDate = new Date(data.vaccinations[i].vaccinationDate);
          vaccinationDate.setHours(0, 0, 0, 0);
          if (eventDateObj <= vaccinationDate) {
            errors.eventDate = "Debe ser posterior a todas las fechas de vacunación";
            break;
          }
        }
      }
    }

    // Validar fecha de nacimiento del reportante
    if (!isDoctor && data.reporterRelationship !== "paciente" && data.reporterDateOfBirth) {
      const reporterBirthDate = new Date(data.reporterDateOfBirth);
      reporterBirthDate.setHours(0, 0, 0, 0);

      if (reporterBirthDate > today) {
        errors.reporterDateOfBirth = "La fecha de nacimiento no puede ser en el futuro";
      } else {
        // Validar edad mínima: debe ser mayor de 18 años
        let age = today.getFullYear() - reporterBirthDate.getFullYear();
        const monthDiff = today.getMonth() - reporterBirthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < reporterBirthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          errors.reporterDateOfBirth = "El reportante debe ser mayor de 18 años";
        }
      }
    }

    return errors;
  };

  // Actualizar errores dinámicamente cuando formData cambie
  useEffect(() => {
    const errors = validateDatesDynamic(formData);
    setDateErrors(errors);
  }, [formData, isDoctor]);

  const validateDates = (): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar que fecha de nacimiento del paciente sea válida
    if (!formData.patientDateOfBirth) {
      return "La fecha de nacimiento del paciente es obligatoria";
    }

    const patientBirthDate = new Date(formData.patientDateOfBirth);
    patientBirthDate.setHours(0, 0, 0, 0);

    // Validar que la fecha de nacimiento del paciente sea anterior a hoy
    if (patientBirthDate > today) {
      return "La fecha de nacimiento del paciente no puede ser en el futuro";
    }

    // Validar que la fecha de nacimiento sea anterior a la fecha del evento
    const eventDateObj = new Date(formData.eventDate);
    eventDateObj.setHours(0, 0, 0, 0);

    if (patientBirthDate >= eventDateObj) {
      return "La fecha de nacimiento del paciente debe ser anterior a la fecha del evento adverso";
    }

    // Validar que el evento sea anterior a hoy
    if (eventDateObj > today) {
      return "La fecha del evento adverso no puede ser en el futuro";
    }

    // Validar cada vacunación
    for (let i = 0; i < formData.vaccinations.length; i++) {
      const vaccination = formData.vaccinations[i];

      if (!vaccination.vaccinationDate) {
        return `La fecha de vacunación #${i + 1} es obligatoria`;
      }

      const vaccinationDate = new Date(vaccination.vaccinationDate);
      vaccinationDate.setHours(0, 0, 0, 0);

      // Validar que la vacunación sea anterior a hoy
      if (vaccinationDate > today) {
        return `La fecha de vacunación #${i + 1} no puede ser en el futuro`;
      }

      // Validar que fecha de nacimiento sea anterior a vacunación
      if (patientBirthDate >= vaccinationDate) {
        return `La fecha de nacimiento del paciente debe ser anterior a la fecha de vacunación #${i + 1}`;
      }

      // Validar que vacunación sea anterior al evento
      if (vaccinationDate >= eventDateObj) {
        return `La fecha de vacunación #${i + 1} debe ser anterior a la fecha del evento adverso`;
      }
    }

    // Validar edad del reportante si no es doctor y no es autollenado
    if (!isDoctor && formData.reporterRelationship !== "paciente") {
      if (formData.reporterDateOfBirth) {
        const reporterBirthDate = new Date(formData.reporterDateOfBirth);
        reporterBirthDate.setHours(0, 0, 0, 0);

        // Validar que la fecha de nacimiento del reportante sea anterior a hoy
        if (reporterBirthDate > today) {
          return "La fecha de nacimiento del reportante no puede ser en el futuro";
        }

        let age = today.getFullYear() - reporterBirthDate.getFullYear();
        const monthDiff = today.getMonth() - reporterBirthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < reporterBirthDate.getDate())) {
          age--;
        }

        if (age < 18) {
          return "Los menores de edad no están autorizados para crear reportes. Por favor, solicita ayuda a un adulto.";
        }
      }
    } else if (formData.reporterRelationship === "paciente") {
      // Si el paciente es el reportante, validar que sea mayor de edad
      const patientAge = today.getFullYear() - patientBirthDate.getFullYear();
      const monthDiff = today.getMonth() - patientBirthDate.getMonth();
      let finalAge = patientAge;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < patientBirthDate.getDate())) {
        finalAge--;
      }

      if (finalAge < 18) {
        return "El paciente es menor de edad y no está autorizado para crear reportes por sí solo.";
      }
    }

    return null;
  };

  const handleSubmit = () => {
    if (!isDoctor && !captchaValue) {
      toast.error("Por favor verifica que no eres un robot");
      return;
    }

    // Ejecutar validaciones
    const dateError = validateDates();
    if (dateError) {
      toast.error("Error en la validación", {
        description: dateError
      });
      return;
    }

    toast.success("Reporte enviado exitosamente", {
      description: "Su reporte ha sido registrado con el ID: RPT-2026-0001"
    });

    setTimeout(() => onNavigate("home"), 2000);
  };

  const stepTitles = [
    "Datos del Sujeto Vacunado",
    "Información de la Vacuna",
    "Descripción del Evento Adverso",
    "Datos del Reportante"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0A4B8F" }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
                  Reporte de Evento Adverso
                </h1>
                <p className="text-sm text-gray-600">
                  Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Función de importación", {
                  description: "Selecciona un archivo JSON para importar."
                });
              }}
              className="gap-2"
            >
              <FileJson className="w-4 h-4" />
              Importar
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-gray-700">
            <strong>Confidencialidad garantizada:</strong> Todos los datos son anónimos y se manejan
            según las normas éticas de investigación. La información solo se usa para fines de
            farmacovigilancia.
          </AlertDescription>
        </Alert>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {currentStep === 1 && <PatientInfoSection formData={formData} updateFormData={updateFormData} dateErrors={dateErrors} />}
            {currentStep === 2 && <VaccineInfoSection formData={formData} updateFormData={updateFormData} userRole={user?.role} dateErrors={dateErrors} />}
            {currentStep === 3 && <AdverseEventSection formData={formData} updateFormData={updateFormData} userRole={user?.role} dateErrors={dateErrors} />}
            {currentStep === 4 && (
              <>
                <ReporterInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  isAutoFilled={isAutoFilled}
                  reporterFieldsRef={reporterFieldsRef}
                  dateErrors={dateErrors}
                />

                {/* 🔐 CAPTCHA (solo usuarios no médicos/admin) */}
                {!isDoctor && (
                  <div className="flex justify-center mt-8 p-4 border-t">
                    <ReCAPTCHA
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={(value) => setCaptchaValue(value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button style={{ backgroundColor: "#0A4B8F" }} className="text-white" onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  style={{ backgroundColor: "#2D7A3E" }}
                  className="text-white"
                  onClick={handleSubmit}
                  disabled={!isDoctor && !captchaValue}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Reporte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
