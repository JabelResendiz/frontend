import { useState } from "react";
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
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

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
  
  // Event info
  eventDate: string;
  eventDescription: string;
  eventSymptoms: string[];
  eventSeverity: string;
  eventOutcome: string;
  eventHospitalization: string;
  eventMedicalAttention: string;
  
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
    eventDescription: "",
    eventSymptoms: [],
    eventSeverity: "",
    eventOutcome: "",
    eventHospitalization: "",
    eventMedicalAttention: "",
    
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <div className="flex items-center gap-3 mb-4">
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
            {/* Step 1: Reporter Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Datos del Reportante</CardTitle>
                  <CardDescription>
                    Información de la persona que reporta el evento adverso.
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterFullName">Nombre Completo *</Label>
                    <Input
                      id="reporterFullName"
                      placeholder="Su nombre completo"
                      value={formData.reporterFullName}
                      onChange={(e) => updateFormData("reporterFullName", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reporterDateOfBirth">Fecha de Nacimiento *</Label>
                    <Input
                      id="reporterDateOfBirth"
                      type="date"
                      value={formData.reporterDateOfBirth}
                      onChange={(e) => updateFormData("reporterDateOfBirth", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterGender">Sexo *</Label>
                    <Select value={formData.reporterGender} onValueChange={(value) => updateFormData("reporterGender", value)}>
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

                  <div className="space-y-2">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterProvince">Provincia *</Label>
                    <Select value={formData.reporterProvince} onValueChange={(value) => updateFormData("reporterProvince", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="La Habana">La Habana</SelectItem>
                        <SelectItem value="Artemisa">Artemisa</SelectItem>
                        <SelectItem value="Mayabeque">Mayabeque</SelectItem>
                        <SelectItem value="Pinar del Río">Pinar del Río</SelectItem>
                        <SelectItem value="Matanzas">Matanzas</SelectItem>
                        <SelectItem value="Villa Clara">Villa Clara</SelectItem>
                        <SelectItem value="Cienfuegos">Cienfuegos</SelectItem>
                        <SelectItem value="Sancti Spíritus">Sancti Spíritus</SelectItem>
                        <SelectItem value="Ciego de Ávila">Ciego de Ávila</SelectItem>
                        <SelectItem value="Camagüey">Camagüey</SelectItem>
                        <SelectItem value="Las Tunas">Las Tunas</SelectItem>
                        <SelectItem value="Holguín">Holguín</SelectItem>
                        <SelectItem value="Granma">Granma</SelectItem>
                        <SelectItem value="Santiago de Cuba">Santiago de Cuba</SelectItem>
                        <SelectItem value="Guantánamo">Guantánamo</SelectItem>
                        <SelectItem value="Isla de la Juventud">Isla de la Juventud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reporterMunicipality">Municipio</Label>
                    <Input
                      id="reporterMunicipality"
                      placeholder="Municipio"
                      value={formData.reporterMunicipality}
                      onChange={(e) => updateFormData("reporterMunicipality", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterPhoneNumber">Teléfono</Label>
                    
                    <div className="flex">
                      <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-sm">
                        +53
                      </span>
                      
                      <Input
                        id="reporterPhoneNumber"
                        type="tel"
                        placeholder="Teléfono"
                        value={formData.reporterPhoneNumber}
                        onChange={(e) => updateFormData("reporterPhoneNumber", e.target.value)}
                        className="bg-white"
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
                      className="bg-white"
                    />
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
                    <Select value={formData.patientProvince} onValueChange={(value) => updateFormData("patientProvince", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="La Habana">La Habana</SelectItem>
                        <SelectItem value="Artemisa">Artemisa</SelectItem>
                        <SelectItem value="Mayabeque">Mayabeque</SelectItem>
                        <SelectItem value="Pinar del Río">Pinar del Río</SelectItem>
                        <SelectItem value="Matanzas">Matanzas</SelectItem>
                        <SelectItem value="Villa Clara">Villa Clara</SelectItem>
                        <SelectItem value="Cienfuegos">Cienfuegos</SelectItem>
                        <SelectItem value="Sancti Spíritus">Sancti Spíritus</SelectItem>
                        <SelectItem value="Ciego de Ávila">Ciego de Ávila</SelectItem>
                        <SelectItem value="Camagüey">Camagüey</SelectItem>
                        <SelectItem value="Las Tunas">Las Tunas</SelectItem>
                        <SelectItem value="Holguín">Holguín</SelectItem>
                        <SelectItem value="Granma">Granma</SelectItem>
                        <SelectItem value="Santiago de Cuba">Santiago de Cuba</SelectItem>
                        <SelectItem value="Guantánamo">Guantánamo</SelectItem>
                        <SelectItem value="Isla de la Juventud">Isla de la Juventud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientMunicipality">Municipio</Label>
                    <Input
                      id="patientMunicipality"
                      placeholder="Municipio"
                      value={formData.patientMunicipality}
                      onChange={(e) => updateFormData("patientMunicipality", e.target.value)}
                      className="bg-white"
                    />
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

            {/* Step 3: Event Description */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-xl mb-2">Descripción del Evento Adverso</CardTitle>
                  <CardDescription>
                    Describa detalladamente el evento adverso experimentado después de la vacunación.
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Fecha de Inicio del Evento *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateFormData("eventDate", e.target.value)}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    ¿Cuándo comenzaron los síntomas?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Síntomas Presentados *</Label>
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
                          onCheckedChange={(checked) => {
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

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descripción Detallada del Evento *</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Describa cómo se desarrolló el evento, duración de síntomas, evolución, etc."
                    value={formData.eventDescription}
                    onChange={(e) => updateFormData("eventDescription", e.target.value)}
                    className="bg-white min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Severidad del Evento *</Label>
                  <RadioGroup value={formData.eventSeverity} onValueChange={(value) => updateFormData("eventSeverity", value)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="leve" id="leve" />
                      <label htmlFor="leve" className="flex-1 cursor-pointer">
                        <div className="font-medium text-green-700">Leve</div>
                        <div className="text-xs text-gray-600">
                          Síntomas menores, sin afectación de actividades diarias
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="moderado" id="moderado" />
                      <label htmlFor="moderado" className="flex-1 cursor-pointer">
                        <div className="font-medium text-yellow-700">Moderado</div>
                        <div className="text-xs text-gray-600">
                          Afectación de actividades diarias, requiere atención médica
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="severo" id="severo" />
                      <label htmlFor="severo" className="flex-1 cursor-pointer">
                        <div className="font-medium text-red-700">Severo</div>
                        <div className="text-xs text-gray-600">
                          Requiere hospitalización o amenaza la vida
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventHospitalization">¿Requirió Hospitalización? *</Label>
                    <Select value={formData.eventHospitalization} onValueChange={(value) => updateFormData("eventHospitalization", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="urgencias">Solo urgencias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventOutcome">Estado Actual *</Label>
                    <Select value={formData.eventOutcome} onValueChange={(value) => updateFormData("eventOutcome", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recuperado">Totalmente recuperado</SelectItem>
                        <SelectItem value="recuperando">En recuperación</SelectItem>
                        <SelectItem value="secuelas">Recuperado con secuelas</SelectItem>
                        <SelectItem value="sin_cambio">Sin cambio</SelectItem>
                        <SelectItem value="desconocido">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventMedicalAttention">Tratamiento Recibido</Label>
                  <Textarea
                    id="eventMedicalAttention"
                    placeholder="Describa el tratamiento médico recibido, medicamentos administrados, etc."
                    value={formData.eventMedicalAttention}
                    onChange={(e) => updateFormData("eventMedicalAttention", e.target.value)}
                    className="bg-white min-h-[80px]"
                  />
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
