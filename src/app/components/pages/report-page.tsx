import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { FormData, UpdateFormData, AdverseEvent } from "./report-page/types";
import { PatientInfoSection } from "./report-page/patient-info-section";
import { VaccineInfoSection } from "./report-page/vaccine-info-section";
import { AdverseEventSection } from "./report-page/adverse-event-section";
import { PatientHistorySection } from "./report-page/patient-history-section";
import { PatientMedicalInfoSection } from "./report-page/patient-medical-info-section";
import { ReporterInfoSection } from "./report-page/reporter-info-section";
import { SuccessReportDialog } from "@/app/components/ui/success-report-dialog";
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
  reporterProfessionalLicense: "",
  reporterInstitution: "",
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

      vaccinationLotId: "",
      vaccinationDate: "",
     
      doseNumber: "",
      administrationSite: "",
      vaccinationProvince: "",
      vaccinationMunicipality: "",
      vaccinationCenterId: "",
      
    }
  ],
  adverseEvents: [
    {
      eventDate: "",
      eventFinishDate: "",
      eventDescription: "",
      eventSymptom: "",
      eventOutcome: "",
      eventHospitalization: "",
      eventMedicalAttention: "",
      eventIntensity: "",
      eventSeverityLevel: ""
    }
  ],
  patientMedicalHistory: "",
  currentMedications: "",
  allergies: "",
  otherVaccinesLastMonth: "",
  reporterType: "",
  confidentialityAgreed: false
};

export function ReportPage({ onNavigate }: ReportPageProps) {
  const { user } = useAuth();
  const isDoctor = user?.role === "MedicalReviewer" || user?.role === "Admin";
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const reporterFieldsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [notificationNumber, setNotificationNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const inactivityTimer = useRef<number | null>(null);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // const utcMinus5Iso = (value: Date) => {
  //   const offsetMs = -5 * 60 * 60 * 1000;
  //   const target = new Date(value.getTime() + offsetMs);
  //   const pad = (num: number) => num.toString().padStart(2, "0");
  //   const year = target.getUTCFullYear();
  //   const month = pad(target.getUTCMonth() + 1);
  //   const day = pad(target.getUTCDate());
  //   const hours = pad(target.getUTCHours());
  //   const minutes = pad(target.getUTCMinutes());
  //   const seconds = pad(target.getUTCSeconds());
  //   const milliseconds = target.getUTCMilliseconds().toString().padStart(3, "0");
  //   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}-05:00`;
  // };

  // Helper functions for date parsing to avoid timezone issues
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const parseDateOnly = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const updateFormData: UpdateFormData = (field, value) => {
    setFormData((prev) => {
      // List of fields that belong to the adverseEvents array
      const eventFields = [
        "eventDate",
        "eventFinishDate",
        "eventDescription",
        "eventSymptom",
        "eventOutcome",
        "eventHospitalization",
        "eventMedicalAttention",
        "eventIntensity",
        "eventSeverityLevel",
        "deathDate",
        "deathDateType",
        "professionalDiagnosis",
        "medicalTerminology",
        "retClassification",
        "laboratoryResults",
        "clinicalSignificance",
        "vaccinationFacilityType",
        "contraindicationCriterion",
      ];

      const updated = { ...prev };

      // If it's an event field, update the specific event
      if (eventFields.includes(field)) {
        updated.adverseEvents = prev.adverseEvents.map((event, idx) => 
          idx === currentEventIndex
            ? { ...event, [field]: value }
            : event
        );
      } else {
        // Otherwise, update the root level
        Object.assign(updated, { [field]: value });
      }

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

      // Sincronizar datos del reportante con el paciente si el reportante es el paciente
      if (prev.reporterRelationship === "paciente" && String(field).startsWith("patient")) {
        const reporterField = field.replace("patient", "reporter");
        if (reporterField in updated) {
          updated[reporterField as keyof FormData] = value;
        }
      }

      if (String(field).startsWith("reporter") && field !== "reporterRelationship") {
        setIsAutoFilled(false);
      }

      return updated;
    });
  };

  const handleAddEvent = () => {
    const newEvent: AdverseEvent = {
      eventDate: "",
      eventFinishDate: "",
      eventDescription: "",
      eventSymptom: "",
      eventOutcome: "",
      eventHospitalization: "",
      eventMedicalAttention: "",
      eventIntensity: "",
      eventSeverityLevel: ""
    };
    
    setFormData((prev) => ({
      ...prev,
      adverseEvents: [...prev.adverseEvents, newEvent]
    }));
    
    // Set the current index to the newly added event
    setCurrentEventIndex(formData.adverseEvents.length);
    toast.success("Nuevo evento adverso agregado", {
      description: "Puedes completar la información del nuevo evento."
    });
  };

  const handleRemoveEvent = (index: number) => {
    if (formData.adverseEvents.length === 1) {
      toast.error("No se puede eliminar", {
        description: "Debe haber al menos un evento adverso reportado."
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      adverseEvents: prev.adverseEvents.filter((_, i) => i !== index)
    }));

    // Adjust current index if needed
    if (currentEventIndex >= formData.adverseEvents.length - 1) {
      setCurrentEventIndex(Math.max(0, currentEventIndex - 1));
    }

    toast.success("Evento eliminado", {
      description: "El evento adverso ha sido removido."
    });
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.current !== null) {
      window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  };

  const startInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimer.current = window.setTimeout(() => {
      toast.error("Su sesión de reporte ha sido cerrada por inactividad. Se le enviará al inicio.");
      setFormData(initialFormData);
      setCurrentStep(1);
      setCaptchaValue(null);
      setBackendErrors([]);
      setDateErrors({});
      onNavigate("home");
    }, 7*60*1000);
  };

  useEffect(() => {
    if (showSuccessDialog) {
      clearInactivityTimer();
      return;
    }

    startInactivityTimer();
    return () => clearInactivityTimer();
  }, [formData, currentStep, captchaValue, showSuccessDialog]);

  useEffect(() => {
    if (isAutoFilled) {
      const timer = setTimeout(() => setIsAutoFilled(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoFilled]);

  // Sincronizar datos del reportante con el paciente si el reportante es el paciente
  useEffect(() => {
    if (formData.reporterRelationship === "paciente") {
      setFormData((prev) => ({
        ...prev,
        reporterFullName: prev.patientFullName,
        reporterDateOfBirth: prev.patientDateOfBirth,
        reporterGender: prev.patientGender,
        reporterProvince: prev.patientProvince,
        reporterMunicipality: prev.patientMunicipality,
        reporterPhoneNumber: prev.patientPhoneNumber,
        reporterEmail: prev.patientEmail,
        reporterIdentityNumber: prev.patientIdentityNumber,
      }));
    }
  }, [
    formData.patientFullName,
    formData.patientDateOfBirth,
    formData.patientGender,
    formData.patientProvince,
    formData.patientMunicipality,
    formData.patientPhoneNumber,
    formData.patientEmail,
    formData.patientIdentityNumber,
    formData.reporterRelationship,
  ]);

  // Validación dinámica de fechas en tiempo real
  const validateDatesDynamic = (data: FormData, eventIndex: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener el evento actual
    const currentEvent = data.adverseEvents[eventIndex];
    if (!currentEvent) {
      return errors;
    }

    // Validar fecha de nacimiento del paciente
    if (data.patientDateOfBirth) {
      const patientBirthDate = parseDateOnly(data.patientDateOfBirth);

      if (patientBirthDate > today) {
        errors.patientDateOfBirth = "La fecha de nacimiento no puede ser en el futuro";
      }

      // Validar contra evento si existe
      if (currentEvent.eventDate) {
        const eventDateObj = parseDateOnly(currentEvent.eventDate);
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

        if (currentEvent.eventDate) {
          const eventDateObj = parseDateOnly(currentEvent.eventDate);
          if (vaccinationDate > eventDateObj) {
            errors[`vaccination_${i}_date`] = "Debe ser anterior al evento adverso";
          }
        }
      }
    }

    // Validar fecha del evento
    if (currentEvent.eventDate) {
      const eventDateObj = parseDateOnly(currentEvent.eventDate);

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
          
          console.log(eventDateObj);
          console.log(vaccinationDate);
          
          if (eventDateObj < vaccinationDate) {
            errors.eventDate = "Debe ser posterior a todas las fechas de vacunación";
            
            console.log("candela");
            
            break;
          }
        }
      }
    }

    // Validar fecha final del evento
    if (currentEvent.eventFinishDate) {
      const eventFinishDateObj = parseDateOnly(currentEvent.eventFinishDate);

      if (eventFinishDateObj > today) {
        errors.eventFinishDate = "No puede ser en el futuro";
      }

      if (currentEvent.eventDate) {
        const eventDateObj = parseDateOnly(currentEvent.eventDate);
        if (eventFinishDateObj < eventDateObj) {
          errors.eventFinishDate = "Debe ser posterior o igual a la fecha de inicio del evento";
        }
      }
    }

    // Validar que se hayan completado intensidad y severidad
    if (!currentEvent.eventIntensity) {
      errors.eventIntensity = "La intensidad del evento es obligatoria";
    }

    if (!currentEvent.eventSeverityLevel) {
      errors.eventSeverityLevel = "El nivel de gravedad del evento es obligatorio";
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
    if (currentEvent.eventHospitalization?.includes("death")) {
      if (currentEvent.deathDate) {
        const deathDate = parseDateOnly(currentEvent.deathDate);

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
    const errors = validateDatesDynamic(formData, currentEventIndex);
    setDateErrors(errors);
  }, [formData, currentEventIndex, isDoctor]);

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

    // Validar que la fecha de nacimiento sea anterior a la fecha del primer evento
    if (formData.adverseEvents.length > 0 && formData.adverseEvents[0].eventDate) {
      const firstEventDate = parseDateOnly(formData.adverseEvents[0].eventDate);
      if (patientBirthDate >= firstEventDate) {
        return "La fecha de nacimiento del paciente debe ser anterior a la fecha del evento adverso";
      }
    }

    // Validar que el evento sea anterior a hoy
    if (formData.adverseEvents.length > 0 && formData.adverseEvents[0].eventDate) {
      const firstEventDate = parseDateOnly(formData.adverseEvents[0].eventDate);
      if (firstEventDate > today) {
        return "La fecha del evento adverso no puede ser en el futuro";
      }
    }

    // Validar cada vacunación
    for (let i = 0; i < formData.vaccinations.length; i++) {
      const vaccination = formData.vaccinations[i];

      if (!vaccination.vaccinationDate) {
        return `La fecha de vacunación #${i + 1} es obligatoria`;
      }

      if (!vaccination.vaccinationLotId || vaccination.vaccinationLotId.trim() === "") {
        return `El número de lote de la vacunación #${i + 1} es obligatorio`;
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

      // Validar que vacunación sea anterior a todos los eventos
      for (const event of formData.adverseEvents) {
        if (event.eventDate) {
          const eventDate = parseDateOnly(event.eventDate);
          if (vaccinationDate > eventDate) {
            return `La fecha de vacunación #${i + 1} debe ser anterior a la fecha del evento adverso`;
          }
        }
      }
    }

    // Validar cada evento adverso
    for (let i = 0; i < formData.adverseEvents.length; i++) {
      const event = formData.adverseEvents[i];

      if (!event.eventDate) {
        return `La fecha de inicio del evento adverso #${i + 1} es obligatoria`;
      }

      if (!event.eventFinishDate) {
        return `La fecha final del evento adverso #${i + 1} es obligatoria`;
      }

      const eventStartDate = parseDateOnly(event.eventDate);
      const eventFinishDate = parseDateOnly(event.eventFinishDate);

      if (eventFinishDate < eventStartDate) {
        return `La fecha final del evento #${i + 1} debe ser posterior o igual a la fecha de inicio`;
      }

      if (eventFinishDate > today) {
        return `La fecha final del evento #${i + 1} no puede ser posterior a la fecha actual`;
      }

      // Validar fecha de muerte si aplica para este evento
      if (event.eventHospitalization.includes("death")) {
        if (!event.deathDate) {
          return `La fecha de fallecimiento es obligatoria para el evento adverso #${i + 1}`;
        }

        const deathDate = parseDateOnly(event.deathDate);
        const reportDate = normalizeDate(new Date());

        if (deathDate > reportDate) {
          return `La fecha de fallecimiento del evento #${i + 1} no puede ser posterior a la fecha actual`;
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
          return `La fecha de fallecimiento del evento #${i + 1} debe ser posterior a la fecha de vacunación más reciente`;
        }
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

    return null;
  };

  // Función para verificar el token de captcha con el backend


  const validateStepFields = (step: number): string[] => {
    const missing: string[] = [];

    if (step === 1) {
      if (!formData.patientFullName?.trim()) missing.push("Nombre completo del paciente");
      if (!formData.patientIdentityNumber?.trim()) missing.push("Número de identidad del paciente");
      if (!formData.patientDateOfBirth) missing.push("Fecha de nacimiento del paciente");
      if (!formData.patientProvince) missing.push("Provincia del paciente");
      if (!formData.patientMunicipality) missing.push("Municipio del paciente");
      if (!formData.patientAddress?.trim()) missing.push("Dirección del paciente");
      if (!formData.patientPhoneNumber?.trim()) missing.push("Teléfono del paciente");
      if (!formData.patientEmail?.trim()) missing.push("Email del paciente");
    } else if (step === 2) {
      formData.vaccinations.forEach((vaccination, index) => {
        if (!vaccination.vaccinationDate) missing.push(`Fecha de vacunación #${index + 1}`);
        if (!vaccination.vaccinationLotId?.trim()) missing.push(`Número de lote de vacunación #${index + 1}`);
      });
    } else if (step === 3) {
      // Validar que al menos haya un evento
      if (formData.adverseEvents.length === 0) {
        missing.push("Debe haber al menos un evento adverso");
      } else {
        // Validar cada evento
        formData.adverseEvents.forEach((event, index) => {
          if (!event.eventDate) missing.push(`Fecha del evento adverso #${index + 1}`);
          if (!event.eventFinishDate) missing.push(`Fecha final del evento adverso #${index + 1}`);
          if (!event.eventOutcome) missing.push(`Estado actual del paciente - Evento #${index + 1}`);
          if (!event.eventIntensity) missing.push(`Intensidad del evento adverso #${index + 1}`);
          if (!event.eventSeverityLevel) missing.push(`Nivel de gravedad del evento adverso #${index + 1}`);
          if (!event.eventSymptom) missing.push(`Síntoma del evento adverso #${index + 1}`);
        });
      }
    } else if (step === 4) {
      if (!formData.reporterFullName?.trim()) missing.push("Nombre completo del reportante");
      if (!formData.reporterIdentityNumber?.trim()) missing.push("Número de identidad del reportante");
      if (!formData.reporterDateOfBirth) missing.push("Fecha de nacimiento del reportante");
      if (!formData.reporterProvince) missing.push("Provincia del reportante");
      if (!formData.reporterMunicipality) missing.push("Municipio del reportante");
      if (!formData.reporterPhoneNumber?.trim()) missing.push("Teléfono del reportante");
      if (!formData.reporterEmail?.trim()) missing.push("Email del reportante");
      if (formData.reporterRelationship === "medico") {
        if (!formData.reporterProfessionalLicense?.trim()) missing.push("Cédula profesional");
        if (!formData.reporterInstitution?.trim()) missing.push("Institución");
      }
    }

    return missing;
  };

  const parseBackendValidationErrors = (error: any): string[] => {
    if (!error) return ["Ocurrió un error inesperado."];

    const backendErrorList = error.backendData?.errors;
    if (Array.isArray(backendErrorList) && backendErrorList.length > 0) {
      return backendErrorList.flatMap((item: any) => {
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

    // Validar checkbox de confidencialidad
    if (!formData.confidentialityAgreed) {
      toast.error("Confirmación de confidencialidad requerida", {
        description: "Debe confirmar que los datos serán tratados de forma confidencial antes de enviar el reporte."
      });
      return;
    }

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

    // Validar datos de contacto del reportante
    if (!formData.reporterEmail || !formData.reporterPhoneNumber) {
      toast.error("Datos de contacto requeridos", {
        description: "Para poder darle seguimiento a su reporte, es necesario que proporcione su email y teléfono de contacto."
      });
      return;
    }

    // Validar campos específicos para médicos
    if (formData.reporterRelationship === "medico") {
      if (!formData.reporterProfessionalLicense || formData.reporterProfessionalLicense.trim() === "") {
        toast.error("Cédula profesional requerida", {
          description: "Como médico reportante, debe proporcionar su número de cédula profesional."
        });
        return;
      }
      if (!formData.reporterInstitution || formData.reporterInstitution.trim() === "") {
        toast.error("Institución requerida", {
          description: "Como médico reportante, debe proporcionar la institución donde trabaja."
        });
        return;
      }
    }

    // Validar números de identidad obligatorios
    if (!formData.reporterIdentityNumber) {
      toast.error("Número de identidad del reportante requerido", {
        description: "El número de identidad del reportante es obligatorio para enviar el reporte."
      });
      return;
    }

    if (!formData.patientIdentityNumber) {
      toast.error("Número de identidad del paciente requerido", {
        description: "El número de identidad del paciente es obligatorio para enviar el reporte."
      });
      return;
    }

    // Validar campos obligatorios del evento adverso
    if (!formData.adverseEvents[currentEventIndex]?.eventDate) {
      toast.error("Fecha del evento requerida", {
        description: "Debe especificar la fecha en que ocurrió el evento adverso."
      });
      return;
    }

    if (!formData.adverseEvents[currentEventIndex]?.eventOutcome) {
      toast.error("Estado del paciente requerido", {
        description: "Debe seleccionar el estado actual del paciente."
      });
      return;
    }

    if (!formData.adverseEvents[currentEventIndex]?.eventSymptom || formData.adverseEvents[currentEventIndex]?.eventSymptom?.trim() === "") {
      toast.error("Síntomas requeridos", {
        description: "Debe seleccionar al menos un síntoma relacionado con el evento adverso."
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
          email: formData.reporterEmail,
          ...(formData.reporterRelationship === "medico" && {
            professionalLicense: formData.reporterProfessionalLicense,
            institution: formData.reporterInstitution,
          }),
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
          // batchNumber: v.vaccineBatchNumber || "",
          site: siteMap[v.administrationSite as keyof typeof siteMap] || "leftarm",
          doseNumber: parseInt(v.doseNumber || "1"),
          administrationDate: v.vaccinationDate ? new Date(v.vaccinationDate).toISOString() : "",
          lotId: v.vaccinationLotId,
          vaccinationCenterId: v.vaccinationCenterId
          // vaccinationCenter: v.vaccinationSite || "string"
        })),
        adverseEvents: formData.adverseEvents.map(event => ({
          startDate: event.eventDate ? new Date(event.eventDate).toISOString() : "",
          finishDate: event.eventFinishDate ? new Date(event.eventFinishDate).toISOString() : "",
          description: event.eventDescription,
          visitedDoctor: event.eventHospitalization.includes("doctor"),
          wentToEmergencyRoom: event.eventHospitalization.includes("emergency"),
          permanentDisability: event.eventHospitalization.includes("disability"),
          isLifeThreatening: event.eventHospitalization.includes("anomaly"),
          resultedInDeath: event.eventHospitalization.includes("death"),
          deathDate: event.eventHospitalization.includes("death") ? (event.deathDate ? parseDateOnly(event.deathDate).toISOString() : null) : null,
          currentStatus: (() => {
            const map = {
              "recovered": "Recovered",
              "recovering": "Recovering",
              "sequelae": "RecoveredWithSequelae",
              "dangerous": "Serious",
              "unchanged": "NotRecovered",
              "unknown": "Unknown"
            };
            return map[event.eventOutcome as keyof typeof map] || "Unknown";
          })(),
          intensity: event.eventIntensity,
          severityLevel: event.eventSeverityLevel,
          symptomId : event.eventSymptom
        })),
        ...(captchaValue && { token: captchaValue })
      };

      const response = await reportService.createPublic(payload);

      // Extract notification number from response
      const notifNumber = response?.data?.notificationNumber || response?.notificationNumber || "AEFI-" + Date.now();
      const message = response?.message || "Su reporte ha sido registrado exitosamente.";

      setNotificationNumber(notifNumber);
      setSuccessMessage(message);
      setShowSuccessDialog(true);

      // Reset form
      setFormData(initialFormData);
    } catch (error: any) {
      // Manejar error de BadRequest (token inválido)
      if (error.status === 400 && error.backendData?.success === false) {
        toast.error("Token de verificación inválido", {
          description: "El captcha ha expirado o no es válido. Por favor, intenta nuevamente."
        });
        setCaptchaValue(null);
        setBackendErrors(["El token de captcha es inválido. Por favor, completa el captcha nuevamente."]);
      } else {
        const parsedErrors = parseBackendValidationErrors(error);
        setBackendErrors(parsedErrors);

        toast.error("Error al enviar el reporte", {
          description: parsedErrors.join(" \n")
        });
      }
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

        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-gray-700">
            <strong>Campos obligatorios:</strong> Los campos marcados con asterisco (*) son obligatorios y deben completarse para enviar el reporte.
          </AlertDescription>
        </Alert>

        {backendErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-black">
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
            {currentStep === 3 && <AdverseEventSection formData={formData} updateFormData={updateFormData} userRole={user?.role} dateErrors={dateErrors} currentEventIndex={currentEventIndex} onCurrentEventIndexChange={setCurrentEventIndex} onAddEvent={handleAddEvent} onRemoveEvent={handleRemoveEvent} />}
            {currentStep === 4 && <PatientMedicalInfoSection formData={formData} updateFormData={updateFormData} />}
            {currentStep === 5 && (
              <>
                <ReporterInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  isAutoFilled={isAutoFilled}
                  reporterFieldsRef={reporterFieldsRef}
                  dateErrors={dateErrors}
                />

                {/* � CONFIDENTIALITY AGREEMENT */}
                <div className="mt-8 p-4 border-t space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Checkbox
                      id="confidentiality"
                      checked={formData.confidentialityAgreed}
                      onCheckedChange={(checked) => updateFormData("confidentialityAgreed", checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="confidentiality" className="flex-1 cursor-pointer text-sm">
                      <span className="font-semibold text-blue-900">Confirmación de Confidencialidad *</span>
                      <p className="text-gray-700 mt-1">
                        Declaro conocer que los datos proporcionados serán confidenciales y utilizados únicamente para fines de farmacovigilancia, conforme a la normativa vigente de protección de datos personales.
                      </p>
                    </label>
                  </div>
                </div>

                {/* 🔐 CAPTCHA (solo usuarios no médicos/admin) */}
                {!isDoctor && (
                  <div className="mt-4 p-4 border-t space-y-4">
                    <p className="text-sm text-gray-600 mb-2">Por favor verifica que no eres un robot:</p>
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}
                        onChange={(value) => {
                          setCaptchaValue(value);
                        }}
                      />
                    </div>
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
                <Button style={{ backgroundColor: "#0A4B8F" }} className="text-white" onClick={() => {
                  const missing = validateStepFields(currentStep);
                  if (missing.length > 0) {
    
                      toast.warning("Campos obligatorios faltantes", {
                        description: (
                          <span className="text-red-600">
                            Puede continuar, pero asegúrese de completarlos antes de enviar.
                          </span>
                        )
                      });

                  }
                  setCurrentStep(Math.min(totalSteps, currentStep + 1));
                }}>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  style={{ 
                    backgroundColor: formData.confidentialityAgreed && (isDoctor || captchaValue) ? "#2D7A3E" : "#999999"
                  }}
                  className="text-white"
                  onClick={handleSubmit}
                  disabled={!formData.confidentialityAgreed || (!isDoctor && !captchaValue)}
                  title={!formData.confidentialityAgreed ? "Marca el checkbox de confidencialidad" : (!isDoctor && !captchaValue ? "Completa el captcha primero" : "")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Reporte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <SuccessReportDialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          notificationNumber={notificationNumber}
          message={successMessage}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
