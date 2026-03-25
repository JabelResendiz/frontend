import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Progress } from "@/app/components/ui/progress";
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Shield, FileJson } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";

interface ReportPageProps {
  onNavigate: (page: string) => void;
}

type FormData = {
  // Reportante info
  reporterFullName: string;
  reporterDateOfBirth: string;
  reporterGender: string;
  reporterProvince: string;
  reporterMunicipality: string;
  reporterPhoneNumber: string;
  reporterEmail: string;
  reporterRelationship: string;
  
  // Patient (VaccinatedSubject) info
  patientFullName: string;
  patientIdentityNumber: string;
  patientDateOfBirth: string;
  patientGender: string;
  patientProvince: string;
  patientMunicipality: string;
  patientAddress: string;
  patientPhoneNumber: string;
  patientEmail: string;
  patientIsPregnant: string;
  patientAge: string;
  //patientMedicalHistory: string;
  
  // Vaccine info
  vaccineName: string;
  vaccineManufacturer: string;
  vaccineBatchNumber: string;
  vaccinationDate: string;
  vaccinationSite: string;
  doseNumber: string;
  
  // Event info - General
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  eventSymptoms: string[];
  eventOutcome: string;
  eventHospitalization: string;
  eventMedicalAttention: string;
  
  // Event info - Reportante specific
  eventSeverity: string;
  patientMedicalHistory: string;
  currentMedications: string;
  allergies: string;
  otherVaccinesLastMonth: string;
  
  // Event info - Doctor specific
  professionalDiagnosis: string;
  medicalTerminology: string;
  retClassification: string;
  laboratoryResults: string;
  clinicalSignificance: string;
  vaccinationFacilityType: string;
  contraindicationCriterion: string;
  
  // Reporter info (final step - required)
  reporterType: string;
  reporterCI: string;
  // reporterName: string;
  // reporterPhoneNumber: string;
  // reporterEmail: string;
};

export function ReportPage({ onNavigate }: ReportPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const reporterFieldsRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    // Reportante info
    reporterFullName: "",
    reporterDateOfBirth: "",
    reporterGender: "",
    reporterProvince: "",
    reporterMunicipality: "",
    reporterPhoneNumber: "",
    reporterEmail: "",
    reporterRelationship: "",
    
    // Patient info
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
    //patientMedicalHistory: "",
    
    // Vaccine info
    vaccineName: "",
    vaccineManufacturer: "",
    vaccineBatchNumber: "",
    vaccinationDate: "",
    vaccinationSite: "",
    doseNumber: "",
    
    // Event info
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
    
    // Reporter info (final step - required)
    reporterType: "",
    reporterCI: "",
    // reporterName: "",
    // reporterPhoneNumber: "",
    // reporterEmail: "",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Handle reporter relationship changes
      if (field === "reporterRelationship") {
        const isChangingToPaciente = value === "paciente" && prev.reporterRelationship !== "paciente";
        const isChangingFromPaciente = prev.reporterRelationship === "paciente" && value !== "paciente";
        
        if (isChangingToPaciente) {
          // Auto-fill reporter info when changing TO "paciente"
          if (updated.patientFullName || updated.patientDateOfBirth) {
            updated.reporterFullName = updated.patientFullName;
            updated.reporterDateOfBirth = updated.patientDateOfBirth;
            updated.reporterGender = updated.patientGender;
            updated.reporterProvince = updated.patientProvince;
            updated.reporterMunicipality = updated.patientMunicipality;
            updated.reporterPhoneNumber = updated.patientPhoneNumber;
            updated.reporterEmail = updated.patientEmail;
            
            // Mark as auto-filled and trigger scroll
            setIsAutoFilled(true);
            
            // Scroll to the reporter fields after a brief delay to allow re-render
            setTimeout(() => {
              reporterFieldsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            
            toast.success("Información auto-completada", {
              description: "Se han llenado los datos del reportante con la información del sujeto vacunado."
            });
          }
        } else if (isChangingFromPaciente) {
          // Clear all reporter fields when changing FROM "paciente" to another role
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
        // Si cambias entre otros roles (no paciente), no hay mensaje
      }
      
      // Remove highlight when user edits any reporter field
      if (field.startsWith('reporter') && field !== 'reporterRelationship') {
        setIsAutoFilled(false);
      }
      
      return updated;
    });
  };

  // Auto-remove highlight after 3 seconds
  useEffect(() => {
    if (isAutoFilled) {
      const timer = setTimeout(() => {
        setIsAutoFilled(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoFilled]);

  const handleSubmit = () => {
    // Mock submission
    toast.success("Reporte enviado exitosamente", {
      description: "Su reporte ha sido registrado con el ID: RPT-2026-0001"
    });
    setTimeout(() => {
      onNavigate("home");
    }, 2000);
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
        {/* Header */}
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

        {/* Important Notice */}
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
            {/* Step 4: Reporter Information */}
            {currentStep === 4 && (
              <div className="space-y-6" ref={reporterFieldsRef}>
                <div>
                  <CardTitle className="text-xl mb-2">Datos del Reportante</CardTitle>
                  <CardDescription>
                    Información de la persona que reporta el evento adverso.
                  </CardDescription>
                </div>

                {/* Relación con el Sujeto Vacunado - PRIMERO */}
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="reporterRelationship">Relación con el Sujeto Vacunado *</Label>
                  <Select value={formData.reporterRelationship} onValueChange={(value) => updateFormData("reporterRelationship", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="enfermera">Enfermero/a</SelectItem>
                      <SelectItem value="farmaceutico">Farmacéutico/a</SelectItem>
                      <SelectItem value="paciente">Sujeto Vacunado</SelectItem>
                      <SelectItem value="familiar">Familiar</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert when reporter is the same as vaccinated subject */}
                {formData.reporterRelationship === "paciente" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-800">
                      <strong>✓ Información auto-completada y protegida:</strong> Se están usando los datos del sujeto vacunado. 
                      Estos campos no pueden ser modificados.
                    </AlertDescription>
                  </Alert>
                )}

                <div 
                  className={`p-4 rounded-lg transition-colors duration-300 ${
                    isAutoFilled ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-transparent border-0'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterFullName">Nombre Completo *</Label>
                      <Input
                        id="reporterFullName"
                        placeholder="Su nombre completo"
                        value={formData.reporterFullName}
                        onChange={(e) => updateFormData("reporterFullName", e.target.value)}
                        disabled={formData.reporterRelationship === "paciente"}
                        className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporterDateOfBirth">Fecha de Nacimiento *</Label>
                      <Input
                        id="reporterDateOfBirth"
                        type="date"
                        value={formData.reporterDateOfBirth}
                        onChange={(e) => updateFormData("reporterDateOfBirth", e.target.value)}
                        disabled={formData.reporterRelationship === "paciente"}
                        className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterGender">Sexo *</Label>
                      <Select 
                        value={formData.reporterGender} 
                        onValueChange={(value) => {
                          if (formData.reporterRelationship !== "paciente") {
                            updateFormData("reporterGender", value);
                          }
                        }}
                        disabled={formData.reporterRelationship === "paciente"}
                      >
                        <SelectTrigger className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterProvince">Provincia *</Label>
                      <Select 
                        value={formData.reporterProvince} 
                        onValueChange={(value) => {
                          if (formData.reporterRelationship !== "paciente") {
                            updateFormData("reporterProvince", value);
                            // Reset municipio when province changes
                            updateFormData("reporterMunicipality", "");
                          }
                        }}
                        disabled={formData.reporterRelationship === "paciente"}
                      >
                        <SelectTrigger className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder="Seleccione provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(PROVINCES_AND_MUNICIPALITIES).sort().map((province) => (
                            <SelectItem key={province} value={province}>{province}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporterMunicipality">Municipio *</Label>
                      <Select
                        value={formData.reporterMunicipality}
                        onValueChange={(value) => {
                          if (formData.reporterRelationship !== "paciente") {
                            updateFormData("reporterMunicipality", value);
                          }
                        }}
                        disabled={formData.reporterRelationship === "paciente" || !formData.reporterProvince}
                      >
                        <SelectTrigger className={`bg-white ${formData.reporterRelationship === "paciente" || !formData.reporterProvince ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder={formData.reporterProvince ? "Seleccione municipio" : "Seleccione provincia primero"} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.reporterProvince && getMunicipalitiesByProvince(formData.reporterProvince).map((municipality) => (
                            <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterPhoneNumber">Teléfono</Label>
                      
                      <div className="flex">
                        <span className={`px-3 py-2 border border-r-0 rounded-l-md text-sm ${formData.reporterRelationship === "paciente" ? 'bg-gray-100' : 'bg-gray-100'}`}>
                          +53
                        </span>
                        
                        <Input
                          id="reporterPhoneNumber"
                          type="tel"
                          placeholder="Teléfono"
                          value={formData.reporterPhoneNumber}
                          onChange={(e) => updateFormData("reporterPhoneNumber", e.target.value)}
                          disabled={formData.reporterRelationship === "paciente"}
                          className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporterEmail">Email</Label>
                      <Input
                        id="reporterEmail"
                        type="email"
                        placeholder="correo@example.com"
                        value={formData.reporterEmail}
                        onChange={(e) => updateFormData("reporterEmail", e.target.value)}
                        disabled={formData.reporterRelationship === "paciente"}
                        className={`bg-white ${formData.reporterRelationship === "paciente" ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Patient (VaccinatedSubject) Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Información del Sujeto Vacunado</CardTitle>
                  <CardDescription>
                    Datos de la persona que recibió la vacuna.
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientFullName">Nombre Completo *</Label>
                    <Input
                      id="patientFullName"
                      placeholder="Nombre del paciente"
                      value={formData.patientFullName}
                      onChange={(e) => updateFormData("patientFullName", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientIdentityNumber">Número de Identidad</Label>
                    <Input
                      id="patientIdentityNumber"
                      placeholder="Carnet de identidad"
                      value={formData.patientIdentityNumber}
                      onChange={(e) => updateFormData("patientIdentityNumber", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientDateOfBirth">Fecha de Nacimiento *</Label>
                    <Input
                      id="patientDateOfBirth"
                      type="date"
                      value={formData.patientDateOfBirth}
                      onChange={(e) => updateFormData("patientDateOfBirth", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientGender">Sexo *</Label>
                    <Select value={formData.patientGender} onValueChange={(value) => updateFormData("patientGender", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="O">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Embarazo - Solo si es femenino */}
                {formData.patientGender === "F" && (
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Label htmlFor="patientIsPregnant">¿Está embarazada? *</Label>
                    <Select value={formData.patientIsPregnant} onValueChange={(value) => updateFormData("patientIsPregnant", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="desconocido">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientProvince">Provincia *</Label>
                    <Select value={formData.patientProvince} onValueChange={(value) => {
                      updateFormData("patientProvince", value);
                      // Reset municipio when province changes
                      updateFormData("patientMunicipality", "");
                    }}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PROVINCES_AND_MUNICIPALITIES).sort().map((province) => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientMunicipality">Municipio *</Label>
                    <Select
                      value={formData.patientMunicipality}
                      onValueChange={(value) => updateFormData("patientMunicipality", value)}
                      disabled={!formData.patientProvince}
                    >
                      <SelectTrigger className={`bg-white ${!formData.patientProvince ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder={formData.patientProvince ? "Seleccione municipio" : "Seleccione provincia primero"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.patientProvince && getMunicipalitiesByProvince(formData.patientProvince).map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientAddress">Dirección</Label>
                  <Input
                    id="patientAddress"
                    placeholder="Dirección completa"
                    value={formData.patientAddress}
                    onChange={(e) => updateFormData("patientAddress", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientPhoneNumber">Teléfono</Label>
                    
                     <div className="flex">
                      <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-sm">
                        +53
                      </span>
                      <Input
                        id="patientPhoneNumber"
                        type="tel"
                        placeholder="Teléfono"
                        value={formData.patientPhoneNumber}
                        onChange={(e) => updateFormData("patientPhoneNumber", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientEmail">Email</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      placeholder="correo@example.com"
                      value={formData.patientEmail}
                      onChange={(e) => updateFormData("patientEmail", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

               
              </div>
            )}

            {/* Step 2: Vaccine Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Información de la Vacuna</CardTitle>
                  <CardDescription>
                    Proporcione detalles sobre la vacuna administrada. Esta información es crucial para el análisis.
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccineName">Nombre de la Vacuna *</Label>
                  <Select value={formData.vaccineName} onValueChange={(value) => updateFormData("vaccineName", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione la vacuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soberana 02">Soberana 02</SelectItem>
                      <SelectItem value="Soberana Plus">Soberana Plus</SelectItem>
                      <SelectItem value="Abdala">Abdala</SelectItem>
                      <SelectItem value="Mambisa">Mambisa</SelectItem>
                      <SelectItem value="Heberpenta-L">Heberpenta-L</SelectItem>
                      <SelectItem value="Heberbiovac-HB">Heberbiovac-HB</SelectItem>
                      <SelectItem value="vAA">vAA (Meningitis A)</SelectItem>
                      <SelectItem value="vABC">vABC (Meningitis BC)</SelectItem>
                      <SelectItem value="Otra">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos de vacuna solo para médicos especialistas */}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vaccineManufacturer">Fabricante *</Label>
                        <Input
                          id="vaccineManufacturer"
                          placeholder="Ej: Instituto Finlay"
                          value={formData.vaccineManufacturer}
                          onChange={(e) => updateFormData("vaccineManufacturer", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vaccineBatchNumber">Número de Lote *</Label>
                        <Input
                          id="vaccineBatchNumber"
                          placeholder="Ej: L-2024-001"
                          value={formData.vaccineBatchNumber}
                          onChange={(e) => updateFormData("vaccineBatchNumber", e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vaccinationDate">Fecha de Vacunación *</Label>
                    <Input
                      id="vaccinationDate"
                      type="date"
                      value={formData.vaccinationDate}
                      onChange={(e) => updateFormData("vaccinationDate", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  {/* Número de Dosis solo para médicos especialistas */}
                  {(user?.role === 'doctor' || user?.role === 'admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="doseNumber">Número de Dosis *</Label>
                      <Select value={formData.doseNumber} onValueChange={(value) => updateFormData("doseNumber", value)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Primera dosis</SelectItem>
                          <SelectItem value="2">Segunda dosis</SelectItem>
                          <SelectItem value="3">Tercera dosis</SelectItem>
                          <SelectItem value="refuerzo">Dosis de refuerzo</SelectItem>
                          <SelectItem value="unica">Dosis única</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Para reportantes: mostrar sitio de vacunación en su lugar */}
                  {!(user?.role === 'doctor' || user?.role === 'admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="vaccinationSite">Sitio de Vacunación *</Label>
                      <Input
                        id="vaccinationSite"
                        placeholder="Ej: Policlínico Vedado, La Habana"
                        value={formData.vaccinationSite}
                        onChange={(e) => updateFormData("vaccinationSite", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Sitio de Vacunación para médicos */}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="vaccinationSite">Sitio de Vacunación *</Label>
                    <Input
                      id="vaccinationSite"
                      placeholder="Ej: Policlínico Vedado, La Habana"
                      value={formData.vaccinationSite}
                      onChange={(e) => updateFormData("vaccinationSite", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Event Description - REPORTANTE VERSION */}
            {currentStep === 3 && !(user?.role === 'doctor' || user?.role === 'admin') && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Descripción del Evento Adverso</CardTitle>
                  <CardDescription>
                    Describa con detalle lo que sintió y cómo evolucionó después de la vacunación. Use sus propias palabras.
                  </CardDescription>
                </div>

                {/* Fecha y Hora del Evento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Fecha de Inicio del Síntoma *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e: any) => updateFormData("eventDate", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Hora del Síntoma *</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e: any) => updateFormData("eventTime", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Síntomas */}
                <div className="space-y-2">
                  <Label>¿Qué síntomas presentó? *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                    {[
                      "Dolor en el sitio de inyección",
                      "Fiebre",
                      "Fatiga",
                      "Dolor de cabeza",
                      "Náuseas/Vómitos",
                      "Dolor muscular",
                      "Escalofríos",
                      "Hinchazón en sitio de inyección",
                      "Mareos",
                      "Reacción alérgica",
                      "Dificultad respiratoria",
                      "Otros"
                    ].map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={formData.eventSymptoms.includes(symptom)}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              updateFormData("eventSymptoms", [...formData.eventSymptoms, symptom]);
                            } else {
                              updateFormData("eventSymptoms", formData.eventSymptoms.filter(s => s !== symptom));
                            }
                          }}
                        />
                        <label
                          htmlFor={symptom}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {symptom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descripción Narrativa */}
                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Cuéntenos en detalle qué ocurrió *</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Describa cómo empezaron los síntomas, cuánto tiempo duraron, cómo se sintió, qué hizo para mejorarse, si necesitó ir al médico, etc."
                    value={formData.eventDescription}
                    onChange={(e: any) => updateFormData("eventDescription", e.target.value)}
                    className="bg-white min-h-[140px]"
                  />
                </div>

                {/* Impacto Objetivo */}
                <div className="space-y-3">
                  <Label>¿Cuál fue el impacto de este evento? *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        id="visited-doctor"
                        checked={formData.eventHospitalization.includes('doctor')}
                        onCheckedChange={(checked: any) => {
                          let value = formData.eventHospitalization;
                          if (checked) {
                            value = value ? value + ',doctor' : 'doctor';
                          } else {
                            value = value.replace(',doctor', '').replace('doctor', '');
                          }
                          updateFormData("eventHospitalization", value);
                        }}
                      />
                      <label htmlFor="visited-doctor" className="flex-1 cursor-pointer">
                        ¿Tuvo que visitar al médico o clínica?
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        id="emergency"
                        checked={formData.eventHospitalization.includes('emergency')}
                        onCheckedChange={(checked: any) => {
                          let value = formData.eventHospitalization;
                          if (checked) {
                            value = value ? value + ',emergency' : 'emergency';
                          } else {
                            value = value.replace(',emergency', '').replace('emergency', '');
                          }
                          updateFormData("eventHospitalization", value);
                        }}
                      />
                      <label htmlFor="emergency" className="flex-1 cursor-pointer">
                        ¿Fue a la sala de emergencias?
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        id="hospitalized"
                        checked={formData.eventHospitalization.includes('hospitalized')}
                        onCheckedChange={(checked: any) => {
                          let value = formData.eventHospitalization;
                          if (checked) {
                            value = value ? value + ',hospitalized' : 'hospitalized';
                          } else {
                            value = value.replace(',hospitalized', '').replace('hospitalized', '');
                          }
                          updateFormData("eventHospitalization", value);
                        }}
                      />
                      <label htmlFor="hospitalized" className="flex-1 cursor-pointer">
                        ¿Fue hospitalizado?
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        id="permanent-disability"
                        checked={formData.eventHospitalization.includes('disability')}
                        onCheckedChange={(checked: any) => {
                          let value = formData.eventHospitalization;
                          if (checked) {
                            value = value ? value + ',disability' : 'disability';
                          } else {
                            value = value.replace(',disability', '').replace('disability', '');
                          }
                          updateFormData("eventHospitalization", value);
                        }}
                      />
                      <label htmlFor="permanent-disability" className="flex-1 cursor-pointer">
                        ¿Ha quedado con una discapacidad o limitación permanente?
                      </label>
                    </div>
                  </div>
                </div>

                {/* Estado Actual */}
                <div className="space-y-2">
                  <Label htmlFor="eventOutcome">Estado Actual *</Label>
                  <Select value={formData.eventOutcome} onValueChange={(value: any) => updateFormData("eventOutcome", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recovered">Totalmente recuperado/a</SelectItem>
                      <SelectItem value="recovering">Aún estoy recuperándome</SelectItem>
                      <SelectItem value="sequelae">Recuperado/a pero con secuelas</SelectItem>
                      <SelectItem value="unchanged">Sin cambios</SelectItem>
                      <SelectItem value="unknown">Desconocido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Antecedentes de Salud */}
                <div className="space-y-2">
                  <Label htmlFor="patientMedicalHistory">Problemas de salud que tenía antes de la vacuna</Label>
                  <Textarea
                    id="patientMedicalHistory"
                    placeholder="Ej: diabetes, presión alta, asma, otras enfermedades..."
                    value={formData.patientMedicalHistory}
                    onChange={(e: any) => updateFormData("patientMedicalHistory", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
                </div>

                {/* Medicamentos Actuales */}
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">¿Toma medicamentos regularmente? (Especifique cuáles)</Label>
                  <Textarea
                    id="currentMedications"
                    placeholder="Ej: insulina, aspirina, antibióticos, etc..."
                    value={formData.currentMedications}
                    onChange={(e: any) => updateFormData("currentMedications", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
                </div>

                {/* Alergias */}
                <div className="space-y-2">
                  <Label htmlFor="allergies">¿Tiene alergias conocidas? (Especifique a qué)</Label>
                  <Textarea
                    id="allergies"
                    placeholder="Ej: penicilina, mariscos, látex, etc..."
                    value={formData.allergies}
                    onChange={(e: any) => updateFormData("allergies", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
                </div>

                {/* Otras Vacunas */}
                <div className="space-y-2">
                  <Label htmlFor="otherVaccinesLastMonth">¿Recibió otras vacunas en el mes anterior a esta?</Label>
                  <Textarea
                    id="otherVaccinesLastMonth"
                    placeholder="Especifique qué vacunas y cuándo las recibió..."
                    value={formData.otherVaccinesLastMonth}
                    onChange={(e: any) => updateFormData("otherVaccinesLastMonth", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
                </div>

                {/* Tratamiento Recibido */}
                <div className="space-y-2">
                  <Label htmlFor="eventMedicalAttention">¿Qué tratamiento recibió?</Label>
                  <Textarea
                    id="eventMedicalAttention"
                    placeholder="Describa si tomó medicinas, fue al médico, qué le recetaron, etc."
                    value={formData.eventMedicalAttention}
                    onChange={(e: any) => updateFormData("eventMedicalAttention", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Event Description - DOCTOR VERSION */}
            {currentStep === 3 && (user?.role === 'doctor' || user?.role === 'admin') && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Crear Reporte del Evento Adverso</CardTitle>
                  <CardDescription>
                    Complete el reporte basado en su evaluación clínica del paciente en el consultorio.
                  </CardDescription>
                </div>

                {/* SECCIÓN 1: INFORMACIÓN DEL EVENTO - EVALUACIÓN DEL MÉDICO */}
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-4">📋 Información del Evento Adverso</h3>

                  {/* Fecha y Hora del Evento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Fecha de Inicio del Evento *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e: any) => updateFormData("eventDate", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventTime">Hora de Inicio del Evento *</Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={formData.eventTime}
                        onChange={(e: any) => updateFormData("eventTime", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Síntomas Observados */}
                  <div className="space-y-2 mb-4">
                    <Label>Síntomas Observados en el Paciente *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border">
                      {[
                        "Dolor en el sitio de inyección",
                        "Fiebre",
                        "Fatiga",
                        "Dolor de cabeza",
                        "Náuseas/Vómitos",
                        "Dolor muscular",
                        "Escalofríos",
                        "Hinchazón en sitio de inyección",
                        "Mareos",
                        "Reacción alérgica",
                        "Dificultad respiratoria",
                        "Otros"
                      ].map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`symptom-${symptom}`}
                            checked={formData.eventSymptoms.includes(symptom)}
                            onCheckedChange={(checked: any) => {
                              if (checked) {
                                updateFormData("eventSymptoms", [...formData.eventSymptoms, symptom]);
                              } else {
                                updateFormData("eventSymptoms", formData.eventSymptoms.filter(s => s !== symptom));
                              }
                            }}
                          />
                          <label
                            htmlFor={`symptom-${symptom}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descripción Clínica */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="eventDescription">Descripción Clínica del Evento *</Label>
                    <Textarea
                      id="eventDescription"
                      placeholder="Describa en detalle el evento: cómo comenzó, evolución, duración, síntomas observados, presentación clínica, etc."
                      value={formData.eventDescription}
                      onChange={(e: any) => updateFormData("eventDescription", e.target.value)}
                      className="bg-white min-h-[120px]"
                    />
                  </div>
                </div>

                {/* SECCIÓN 2: EVALUACIÓN CLÍNICA Y DIAGNÓSTICO */}
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h3 className="font-semibold text-green-900 mb-4">🏥 Evaluación Clínica y Diagnóstico</h3>

                  {/* Diagnóstico Profesional */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="professionalDiagnosis">Diagnóstico Clínico Profesional *</Label>
                    <Textarea
                      id="professionalDiagnosis"
                      placeholder="Diagnóstico basado en síntomas, antecedentes clínicos, hallazgos del examen físico y evaluación profesional..."
                      value={formData.professionalDiagnosis}
                      onChange={(e: any) => updateFormData("professionalDiagnosis", e.target.value)}
                      className="bg-white min-h-[100px]"
                    />
                  </div>

                  {/* Terminología Médica Estándar */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="medicalTerminology">Terminología Médica Estándar (MedDRA) *</Label>
                    <Textarea
                      id="medicalTerminology"
                      placeholder="Expresar el evento en términos médicos estándar usados en farmacovigilancia (ej: 'Anafilaxia', 'Síncope vasovagal', etc.)..."
                      value={formData.medicalTerminology}
                      onChange={(e: any) => updateFormData("medicalTerminology", e.target.value)}
                      className="bg-white min-h-[80px]"
                    />
                  </div>

                  {/* Pruebas de Laboratorio */}
                  <div className="space-y-2">
                    <Label htmlFor="laboratoryResults">Resultados de Laboratorio y Pruebas Diagnósticas</Label>
                    <Textarea
                      id="laboratoryResults"
                      placeholder="ECG, análisis de sangre, resonancia, biopsias, cultivos, etc. Incluya valores anormales relevantes..."
                      value={formData.laboratoryResults}
                      onChange={(e: any) => updateFormData("laboratoryResults", e.target.value)}
                      className="bg-white min-h-[100px]"
                    />
                  </div>
                </div>

                {/* SECCIÓN 3: CLASIFICACIÓN RET Y ANÁLISIS TÉCNICO */}
                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold text-purple-900 mb-4">📊 Clasificación RET y Análisis Técnico</h3>

                  {/* Clasificación RET */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="retClassification">Clasificación RET (Tabla de Eventos Reportables) *</Label>
                    <Select value={formData.retClassification} onValueChange={(value: any) => updateFormData("retClassification", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione clasificación RET" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anafilaxis">Anafilaxia</SelectItem>
                        <SelectItem value="miopericarditis">Miopericarditis o miocarditis</SelectItem>
                        <SelectItem value="trombosis">Trombosis con síndrome de trombocitopenia</SelectItem>
                        <SelectItem value="sindrome-guillain">Síndrome de Guillain-Barré</SelectItem>
                        <SelectItem value="paralisis-bell">Parálisis de Bell</SelectItem>
                        <SelectItem value="sincope">Síncope vasovagal</SelectItem>
                        <SelectItem value="encefalopatia">Encefalopatía</SelectItem>
                        <SelectItem value="convulsiones">Convulsiones/Episodios convulsivos</SelectItem>
                        <SelectItem value="miocarditis">Miocarditis aguda</SelectItem>
                        <SelectItem value="no-clasificado">No clasificado en RET</SelectItem>
                        <SelectItem value="otro">Otro (especifique)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Significancia Clínica */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="clinicalSignificance">Evaluación de Significancia Clínica *</Label>
                    <Select value={formData.clinicalSignificance} onValueChange={(value: any) => updateFormData("clinicalSignificance", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinically-significant">Clínicamente significativo e inesperado</SelectItem>
                        <SelectItem value="expected">Evento esperado según prospecto</SelectItem>
                        <SelectItem value="significant-unexpected">Significativo pero no en prospecto</SelectItem>
                        <SelectItem value="minor">Evento menor</SelectItem>
                        <SelectItem value="serious">Evento serio/potencialmente mortal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pruebas de Laboratorio */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="laboratoryResults">Resultados de Laboratorio y Pruebas Diagnósticas</Label>
                    <Textarea
                      id="laboratoryResults"
                      placeholder="ECG, análisis de sangre, resonancia, biopsias, cultivos, etc. Incluya valores anormales relevantes..."
                      value={formData.laboratoryResults}
                      onChange={(e: any) => updateFormData("laboratoryResults", e.target.value)}
                      className="bg-white min-h-[100px]"
                    />
                  </div>
                </div>

                {/* SECCIÓN 4: INFORMACIÓN ADICIONAL */}
                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                  <h3 className="font-semibold text-orange-900 mb-4">📝 Información Adicional</h3>

                  {/* Tipo de Instalación */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="vaccinationFacilityType">Tipo de Centro de Vacunación *</Label>
                    <Select value={formData.vaccinationFacilityType} onValueChange={(value: any) => updateFormData("vaccinationFacilityType", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="polyclinic">Policlínico/Centro de salud</SelectItem>
                        <SelectItem value="private-clinic">Clínica privada</SelectItem>
                        <SelectItem value="pharmacy">Farmacia</SelectItem>
                        <SelectItem value="office">Consultorio privado</SelectItem>
                        <SelectItem value="mobile-unit">Unidad móvil</SelectItem>
                        <SelectItem value="unknown">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contraindicación */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="contraindicationCriterion">¿Constituye Contraindicación para Próximas Dosis?</Label>
                    <Textarea
                      id="contraindicationCriterion"
                      placeholder="¿Este evento constituye una contraindicación según el prospecto del fabricante para administrar dosis futuras? Especifique..."
                      value={formData.contraindicationCriterion}
                      onChange={(e: any) => updateFormData("contraindicationCriterion", e.target.value)}
                      className="bg-white min-h-[80px]"
                    />
                  </div>

                  {/* Desenlace */}
                  <div className="space-y-2">
                    <Label htmlFor="eventOutcome">Desenlace del Evento al Momento del Reporte *</Label>
                    <Select value={formData.eventOutcome} onValueChange={(value: any) => updateFormData("eventOutcome", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recovered">Recuperado sin secuelas</SelectItem>
                        <SelectItem value="recovering">En recuperación</SelectItem>
                        <SelectItem value="sequelae">Recuperado con secuelas</SelectItem>
                        <SelectItem value="fatal">Fatal/Defunción</SelectItem>
                        <SelectItem value="unknown">Desconocido/Pendiente de seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  style={{ backgroundColor: "#0A4B8F" }}
                  className="text-white"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  style={{ backgroundColor: "#2D7A3E" }}
                  className="text-white"
                  onClick={handleSubmit}
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
