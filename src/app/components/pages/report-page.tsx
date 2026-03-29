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
  const isDoctor = user?.role === "doctor" || user?.role === "admin";
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const reporterFieldsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

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

  const handleSubmit = () => {
    if (!isDoctor && !captchaValue) {
      toast.error("Por favor verifica que no eres un robot");
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
            {currentStep === 1 && <PatientInfoSection formData={formData} updateFormData={updateFormData} />}
            {currentStep === 2 && <VaccineInfoSection formData={formData} updateFormData={updateFormData} userRole={user?.role} />}
            {currentStep === 3 && <AdverseEventSection formData={formData} updateFormData={updateFormData} userRole={user?.role} />}
            {currentStep === 4 && (
              <>
                <ReporterInfoSection
                  formData={formData}
                  updateFormData={updateFormData}
                  isAutoFilled={isAutoFilled}
                  reporterFieldsRef={reporterFieldsRef}
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
