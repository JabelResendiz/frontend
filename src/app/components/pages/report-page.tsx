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
import { reportService } from "@/app/services/report.service";
import { getProvinceId, getMunicipalityId } from "@/app/data/municipalities";

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
  reporterIdentityNumber: "",
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
      vaccineId: "",
      vaccineName: "",
      vaccineManufacturer: "",
      vaccineBatchNumber: "",
      vaccinationDate: "",
      vaccinationSite: "",
      doseNumber: "",
      administrationSite: ""
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
  reporterType: ""
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
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const utcMinus5Iso = (value: Date) => {
    const offsetMs = -5 * 60 * 60 * 1000;
    const target = new Date(value.getTime() + offsetMs);
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = target.getUTCFullYear();
    const month = pad(target.getUTCMonth() + 1);
    const day = pad(target.getUTCDate());
    const hours = pad(target.getUTCHours());
    const minutes = pad(target.getUTCMinutes());
    const seconds = pad(target.getUTCSeconds());
    const milliseconds = target.getUTCMilliseconds().toString().padStart(3, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}-05:00`;
  };

  // Helper functions for date parsing to avoid timezone issues
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const parseDateOnly = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

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
              updated.reporterIdentityNumber = updated.patientIdentityNumber;
          }
        } else if (isChangingFromPaciente) {
          updated.reporterFullName = "";
          updated.reporterDateOfBirth = "";
          updated.reporterGender = "";
          updated.reporterProvince = "";
          updated.reporterMunicipality = "";
          updated.reporterPhoneNumber = "";
          updated.reporterEmail = "";
          updated.reporterIdentityNumber = "";
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
      const patientBirthDate = parseDateOnly(data.patientDateOfBirth);

      if (patientBirthDate > today) {
        errors.patientDateOfBirth = "La fecha de nacimiento no puede ser en el futuro";
      }

      // Validar contra evento si existe
      if (data.eventDate) {
        const eventDateObj = parseDateOnly(data.eventDate);
        if (patientBirthDate >= eventDateObj) {
          errors.patientDateOfBirth = "Debe ser anterior a la fecha del evento adverso";
        }
      }

      // Validar contra vacunaciones
      for (let i = 0; i < data.vaccinations.length; i++) {
        if (data.vaccinations[i].vaccinationDate) {
          const vaccinationDate = parseDateOnly(data.vaccinations[i].vaccinationDate);
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
        const vaccinationDate = parseDateOnly(vaccination.vaccinationDate);

        if (vaccinationDate > today) {
          errors[`vaccination_${i}_date`] = "No puede ser en el futuro";
        }

        if (data.eventDate) {
          const eventDateObj = parseDateOnly(data.eventDate);
          if (vaccinationDate >= eventDateObj) {
            errors[`vaccination_${i}_date`] = "Debe ser anterior al evento adverso";
          }
        }
      }
    }

    // Validar fecha del evento
    if (data.eventDate) {
      const eventDateObj = parseDateOnly(data.eventDate);

      if (eventDateObj > today) {
        errors.eventDate = "No puede ser en el futuro";
      }

      // Validar que sea posterior a la fecha de nacimiento del paciente
      if (data.patientDateOfBirth) {
        const patientBirthDate = parseDateOnly(data.patientDateOfBirth);
        if (eventDateObj <= patientBirthDate) {
          errors.eventDate = "Debe ser posterior a la fecha de nacimiento del paciente";
        }
      }

      // Validar que sea posterior a todas las fechas de vacunación
      for (let i = 0; i < data.vaccinations.length; i++) {
        if (data.vaccinations[i].vaccinationDate) {
          const vaccinationDate = parseDateOnly(data.vaccinations[i].vaccinationDate);
          if (eventDateObj < vaccinationDate) {
            errors.eventDate = "Debe ser posterior a todas las fechas de vacunación";
            break;
          }
        }
      }
    }

    // Validar fecha de nacimiento del reportante
    if (!isDoctor && data.reporterRelationship !== "paciente" && data.reporterDateOfBirth) {
      const reporterBirthDate = parseDateOnly(data.reporterDateOfBirth);

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

    // Validar fecha de muerte en tiempo real
    if (data.eventHospitalization.includes("death")) {
      if (data.deathDate) {
        const deathDate = parseDateOnly(data.deathDate);

        // Fecha del reporte en UTC-5 (solo la fecha, sin hora)
        const reportDate = normalizeDate(new Date());

        if (deathDate > reportDate) {
          errors.deathDate = "La fecha de fallecimiento no puede ser posterior a la fecha actual";
        }

        // Encontrar la fecha de vacunación más reciente
        let latestVaccinationDate = new Date(0);
        for (let i = 0; i < data.vaccinations.length; i++) {
          if (data.vaccinations[i].vaccinationDate) {
            const vaccDate = parseDateOnly(data.vaccinations[i].vaccinationDate);
            if (vaccDate > latestVaccinationDate) {
              latestVaccinationDate = vaccDate;
            }
          }
        }

        if (latestVaccinationDate.getTime() > 0 && deathDate < latestVaccinationDate) {
          errors.deathDate = "La fecha de fallecimiento debe ser posterior a la fecha de vacunación más reciente";
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

    const patientBirthDate = parseDateOnly(formData.patientDateOfBirth);

    // Validar que la fecha de nacimiento del paciente sea anterior a hoy
    if (patientBirthDate > today) {
      return "La fecha de nacimiento del paciente no puede ser en el futuro";
    }

    // Validar que la fecha de nacimiento sea anterior a la fecha del evento
    const eventDateObj = parseDateOnly(formData.eventDate);

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

      const vaccinationDate = parseDateOnly(vaccination.vaccinationDate);

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
        const reporterBirthDate = parseDateOnly(formData.reporterDateOfBirth);

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

    // Validar fecha de muerte si aplica
    if (formData.eventHospitalization.includes("death")) {
      if (!formData.deathDate) {
        return "La fecha de fallecimiento es obligatoria cuando se indica que el paciente falleció";
      }

      const deathDate = parseDateOnly(formData.deathDate);
      const reportDate = normalizeDate(new Date());

      if (deathDate > reportDate) {
        return "La fecha de fallecimiento no puede ser posterior a la fecha actual";
      }

      // Encontrar la fecha de vacunación más reciente
      let latestVaccinationDate = new Date(0);
      for (const v of formData.vaccinations) {
        if (v.vaccinationDate) {
          const vaccDate = parseDateOnly(v.vaccinationDate);
          if (vaccDate > latestVaccinationDate) {
            latestVaccinationDate = vaccDate;
          }
        }
      }

      if (latestVaccinationDate.getTime() > 0 && deathDate < latestVaccinationDate) {
        return "La fecha de fallecimiento debe ser posterior a la fecha de vacunación más reciente";
      }
    }

    return null;
  };

  const parseBackendValidationErrors = (error: any): string[] => {
    if (!error) return ["Ocurrió un error inesperado."];

    const backendErrors = error.backendData?.errors;
    if (Array.isArray(backendErrors) && backendErrors.length > 0) {
      return backendErrors.flatMap((item: any) => {
        const field = item.field ? `${item.field}: ` : "";
        const messages = Array.isArray(item.errors) ? item.errors : [item.errors];
        return messages.map((message: string) => `${field}${message}`);
      });
    }

    const backendMessage = error.backendData?.message;
    if (backendMessage) {
      return [backendMessage];
    }

    return [error.message || "Error desconocido"];
  };

  const handleSubmit = async () => {
    setBackendErrors([]);

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

    try {
      // Build the payload
      const genderMap = {
        "M": "Male",
        "F": "Female",
        "O": "Other"
      };

      const siteMap = {
        "LeftArm": "leftarm",
        "RightArm": "rightarm",
        "LeftThigh": "leftthigh",
        "RightThigh": "rightthigh"
      };

      // Fecha del reporte en UTC-5
      const reportDate = new Date();
      reportDate.setHours(reportDate.getHours() - 5);

      const payload = {
        reportDate: reportDate.toISOString(),
        reporter: {
          fullName: formData.reporterFullName,
          reporterRelationship: (() => {
            const map = {
              "paciente": "Self",
              "medico": "Doctor",
              "familiar": "Parent",
              "otro": "Other"
            };
            return map[formData.reporterRelationship as keyof typeof map] || "Other";
          })(),
          identityNumber: formData.reporterIdentityNumber || "",
          dateOfBirth: formData.reporterDateOfBirth ? new Date(formData.reporterDateOfBirth).toISOString() : "",
          provinceId: getProvinceId(formData.reporterProvince),
          municipalityId: getMunicipalityId(formData.reporterProvince, formData.reporterMunicipality),
          phoneNumber: formData.reporterPhoneNumber,
          email: formData.reporterEmail
        },
        vaccinatedSubject: {
          fullName: formData.patientFullName,
          identityNumber: formData.patientIdentityNumber,
          dateOfBirth: formData.patientDateOfBirth ? new Date(formData.patientDateOfBirth).toISOString() : "",
          gender: genderMap[formData.patientGender as keyof typeof genderMap] || "Unknown",
          isPregnant: formData.patientIsPregnant === "si",
          provinceId: getProvinceId(formData.patientProvince),
          municipalityId: getMunicipalityId(formData.patientProvince, formData.patientMunicipality),
          healthArea: "string", // TODO: add to form
          address: formData.patientAddress,
          phoneNumber: formData.patientPhoneNumber,
          email: formData.patientEmail,
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
          medicalHistory: formData.patientMedicalHistory
        },
        vaccinations: formData.vaccinations.map(v => ({
          vaccineId: v.vaccineId,
          batchNumber: v.vaccineBatchNumber || "",
          site: siteMap[v.administrationSite as keyof typeof siteMap] || "leftarm",
          doseNumber: parseInt(v.doseNumber || "1"),
          administrationDate: v.vaccinationDate ? new Date(v.vaccinationDate).toISOString() : "",
          vaccinationCenter: v.vaccinationSite || "string"
        })),
        adverseEvents: [{
          startDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : "",
          description: formData.eventDescription,
          visitedDoctor: formData.eventHospitalization.includes("doctor"),
          wentToEmergencyRoom: formData.eventHospitalization.includes("emergency"),
          permanentDisability: formData.eventHospitalization.includes("disability"),
          isLifeThreatening: formData.eventHospitalization.includes("anomaly"),
          resultedInDeath: formData.eventHospitalization.includes("death"),
          deathDate: formData.eventHospitalization.includes("death") ? (formData.deathDate ? parseDateOnly(formData.deathDate).toISOString() : null) : null,
          currentStatus: (() => {
            const map = {
              "recovered": "Recovered",
              "recovering": "Recovering",
              "sequelae": "RecoveredWithSequelae",
              "dangerous": "Serious",
              "unchanged": "NotRecovered",
              "unknown": "Unknown"
            };
            return map[formData.eventOutcome as keyof typeof map] || "Unknown";
          })(),
          symptoms: formData.eventSymptoms
        }]
      };

      await reportService.createPublic(payload);

      toast.success("Reporte enviado exitosamente", {
        description: "Su reporte ha sido registrado."
      });

      setTimeout(() => onNavigate("home"), 2000);
    } catch (error: any) {
      const parsedErrors = parseBackendValidationErrors(error);
      setBackendErrors(parsedErrors);

      toast.error("Error al enviar el reporte", {
        description: parsedErrors.join(" \n")
      });
    }
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

        {backendErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              <strong>Errores de validación del servidor:</strong>
              <ul className="mt-2 list-disc list-inside">
                {backendErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
