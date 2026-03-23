import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { AlertCircle, ChevronLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewReportPageProps {
  reportId?: string;
  onNavigate: (page: string, reportId?: string) => void;
}

// Mock data - Reporte presentado por el usuario (SOLO lo que el usuario ingresa)
const mockUserReport = {
  id: 'AR-001',
  patientFullName: 'Carlos López Fernández',
  patientIdentityNumber: '12345678',
  patientDateOfBirth: '1980-05-15',
  patientGender: 'M',
  patientProvince: 'La Habana',
  patientMunicipality: 'Playa',
  patientAddress: 'Calle 5ta No. 1234 entre 10 y 12',
  patientPhoneNumber: '53123456',
  patientEmail: 'carlos@example.com',
  
  // VACUNA - Solo lo que ingresa el usuario
  vaccineName: 'Soberana 02',
  vaccinationDate: '2026-03-15',
  vaccinationSite: 'Policlínico Vedado',
  // Nota: Usuario NO proporciona: vaccineManufacturer, vaccineBatchNumber, doseNumber
  
  eventDate: '2026-03-15',
  eventTime: '14:30',
  eventDescription: 'Después de aproximadamente 30 minutos de la vacunación, comencé a sentir dolor en el brazo donde me pusieron la inyección. Luego empecé a sentir un poco de fiebre y dolor de cabeza. Me tomé acetaminofén y después de unas horas me sentí mejor.',
  eventSymptoms: ['Dolor en el sitio de inyección', 'Fiebre', 'Dolor de cabeza'],
  eventOutcome: 'recovered',
  eventHospitalization: '',
  patientMedicalHistory: 'Hipertensión controlada',
  currentMedications: 'Enalapril 10mg diarios',
  allergies: 'Alergia a Penicilina',
  otherVaccinesLastMonth: 'Ninguna',
  eventMedicalAttention: 'No solicité atención médica',
  eventSeverity: 'leve',
};

export const ReviewReportPage = ({ reportId, onNavigate }: ReviewReportPageProps) => {
  const { user } = useAuth();
  
  // Estados para campos que el médico completa sobre la vacuna
  const [editedVaccineName, setEditedVaccineName] = useState(mockUserReport.vaccineName);
  const [vaccineManufacturer, setVaccineManufacturer] = useState('');
  const [vaccineBatchNumber, setVaccineBatchNumber] = useState('');
  const [doseNumber, setDoseNumber] = useState('');
  
  // Estados para la evaluación clínica
  const [professionalDiagnosis, setProfessionalDiagnosis] = useState('');
  const [medicalTerminology, setMedicalTerminology] = useState('');
  const [retClassification, setRetClassification] = useState('');
  const [laboratoryResults, setLaboratoryResults] = useState('');
  const [clinicalSignificance, setClinicalSignificance] = useState('');
  const [vaccinationFacilityType, setVaccinationFacilityType] = useState('');
  const [contraindicationCriterion, setContraindicationCriterion] = useState('');

  if (!user || user.role !== 'doctor') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos pueden acceder.</p>
      </div>
    );
  }

  const handleSubmitReview = () => {
    toast.success("Reporte completado", {
      description: "Tu revisión ha sido guardada exitosamente."
    });
    setTimeout(() => {
      onNavigate('assigned-reports');
    }, 2000);
  };

  const handleDownload = () => {
    toast.success("Descargando reporte...", {
      description: "El archivo se está descargando."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('assigned-reports')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Revisión de Reporte</h1>
              <p className="text-gray-600">Reporte ID: {reportId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* SECCIÓN 1: INFORMACIÓN DEL PACIENTE (Del usuario) */}
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-xl">📋 Información del Paciente (Reportado por Usuario)</CardTitle>
              <CardDescription>Datos ingresados por el reportante</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Nombre Completo</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientFullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Número de Identidad</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientIdentityNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Fecha de Nacimiento</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientDateOfBirth}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Sexo</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientGender === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Provincia</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientProvince}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Municipio</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientMunicipality}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-semibold text-gray-700">Dirección</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.patientAddress}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-3">Contacto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Teléfono</Label>
                    <p className="text-gray-900 mt-1">+53 {mockUserReport.patientPhoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Email</Label>
                    <p className="text-gray-900 mt-1">{mockUserReport.patientEmail}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 2: INFORMACIÓN DE LA VACUNA */}
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-xl">💉 Información de la Vacuna</CardTitle>
              <CardDescription>Datos ingresados por el usuario + Complementación por el médico</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Lo que el usuario ingresó - Solo lectura */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">📋 Información Ingresada por el Usuario</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Nombre de la Vacuna Reportado</Label>
                    <p className="text-gray-900 mt-1 p-2 bg-white rounded border">{mockUserReport.vaccineName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Fecha de Vacunación</Label>
                    <p className="text-gray-900 mt-1 p-2 bg-white rounded border">{mockUserReport.vaccinationDate}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-semibold text-gray-700">Sitio de Vacunación</Label>
                    <p className="text-gray-900 mt-1 p-2 bg-white rounded border">{mockUserReport.vaccinationSite}</p>
                  </div>
                </div>
              </div>

              {/* Lo que el médico completa - Editable */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">✏️ Complementación por el Médico</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editedVaccineName">Nombre de la Vacuna (Rectificado si es necesario) *</Label>
                    <Select value={editedVaccineName} onValueChange={setEditedVaccineName}>
                      <SelectTrigger className="bg-white mt-2">
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

                  <div>
                    <Label htmlFor="vaccineManufacturer">Fabricante *</Label>
                    <Input
                      id="vaccineManufacturer"
                      placeholder="Ej: Instituto Finlay"
                      value={vaccineManufacturer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaccineManufacturer(e.target.value)}
                      className="bg-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vaccineBatchNumber">Número de Lote *</Label>
                    <Input
                      id="vaccineBatchNumber"
                      placeholder="Ej: L-2024-001"
                      value={vaccineBatchNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaccineBatchNumber(e.target.value)}
                      className="bg-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="doseNumber">Número de Dosis *</Label>
                    <Select value={doseNumber} onValueChange={setDoseNumber}>
                      <SelectTrigger className="bg-white mt-2">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 3: EVENTO ADVERSO REPORTADO */}
          <Card>
            <CardHeader className="bg-yellow-50 border-b">
              <CardTitle className="text-xl">⚠️ Evento Adverso Reportado por el Usuario</CardTitle>
              <CardDescription>Información ingresada en el formulario de reporte</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Fecha del Evento</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.eventDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Hora del Evento</Label>
                  <p className="text-gray-900 mt-1">{mockUserReport.eventTime}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Síntomas Reportados</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockUserReport.eventSymptoms.map((symptom, idx) => (
                    <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Descripción del Evento</Label>
                <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border">{mockUserReport.eventDescription}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Antecedentes Médicos</Label>
                <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border">{mockUserReport.patientMedicalHistory}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Medicamentos Actuales</Label>
                  <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border text-sm">{mockUserReport.currentMedications}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Alergias</Label>
                  <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border text-sm">{mockUserReport.allergies}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 4: DESENLACE E IMPACTO DEL EVENTO */}
          <Card>
            <CardHeader className="bg-red-50 border-b">
              <CardTitle className="text-xl">📊 Desenlace e Impacto del Evento Adverso</CardTitle>
              <CardDescription>Información sobre los resultados y consecuencias del evento reportado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Estado Actual del Paciente</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  {mockUserReport.eventOutcome === 'recovered' && (
                    <p className="text-gray-900">✅ Totalmente recuperado/a</p>
                  )}
                  {mockUserReport.eventOutcome === 'recovering' && (
                    <p className="text-gray-900">🔄 Aún estoy recuperándome</p>
                  )}
                  {mockUserReport.eventOutcome === 'sequelae' && (
                    <p className="text-gray-900">⚠️ Recuperado/a pero con secuelas</p>
                  )}
                  {mockUserReport.eventOutcome === 'unchanged' && (
                    <p className="text-gray-900">➖ Sin cambios</p>
                  )}
                  {mockUserReport.eventOutcome === 'unknown' && (
                    <p className="text-gray-900">❓ Desconocido</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Impacto del Evento - Atención Médica Requerida</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">👨‍⚕️</span>
                    <span className="text-gray-900">
                      {mockUserReport.eventHospitalization.includes('doctor') ? '✅ Visitó al médico o clínica' : '❌ No visitó al médico'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">🚨</span>
                    <span className="text-gray-900">
                      {mockUserReport.eventHospitalization.includes('emergency') ? '✅ Fue a sala de emergencias' : '❌ No fue a sala de emergencias'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">🏥</span>
                    <span className="text-gray-900">
                      {mockUserReport.eventHospitalization.includes('hospitalized') ? '✅ Fue hospitalizado' : '❌ No fue hospitalizado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">♿</span>
                    <span className="text-gray-900">
                      {mockUserReport.eventHospitalization.includes('disability') ? '✅ Quedó con discapacidad/limitación permanente' : '❌ Sin discapacidad permanente'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Tratamiento Recibido</Label>
                <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border">{mockUserReport.eventMedicalAttention || 'No especificado'}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Otras Vacunas en el Mes Anterior</Label>
                <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg border">{mockUserReport.otherVaccinesLastMonth}</p>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN 5: EVALUACIÓN CLÍNICA DEL MÉDICO */}
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-xl">🏥 Tu Evaluación Clínica</CardTitle>
              <CardDescription>Completa los siguientes campos con tu análisis profesional</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Alert className="border-purple-200 bg-purple-50">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-800">
                  <strong>Importante:</strong> Proporciona tu diagnóstico profesional, clasificación según MedDRA, 
                  y resultados de laboratorio cuando sea aplicable.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="professionalDiagnosis">Diagnóstico Clínico Profesional *</Label>
                <Textarea
                  id="professionalDiagnosis"
                  placeholder="Diagnóstico basado en síntomas, antecedentes clínicos, hallazgos del examen físico..."
                  value={professionalDiagnosis}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfessionalDiagnosis(e.target.value)}
                  className="bg-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalTerminology">Terminología Médica Estándar (MedDRA) *</Label>
                <Textarea
                  id="medicalTerminology"
                  placeholder="Expresar el evento en términos médicos estándar (ej: Anafilaxia, Síncope vasovagal, etc...)"
                  value={medicalTerminology}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMedicalTerminology(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retClassification">Clasificación RET (Relación Evento-Temporal) *</Label>
                <Select value={retClassification} onValueChange={setRetClassification}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione la clasificación RET" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporal">Temporal (T)</SelectItem>
                    <SelectItem value="no-temporal">No Temporal (NT)</SelectItem>
                    <SelectItem value="uncertain">Incierto (I)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratoryResults">Resultados de Laboratorio</Label>
                <Textarea
                  id="laboratoryResults"
                  placeholder="Hemograma, química sanguínea, otras pruebas relevantes..."
                  value={laboratoryResults}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLaboratoryResults(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalSignificance">Significancia Clínica</Label>
                <Textarea
                  id="clinicalSignificance"
                  placeholder="Análisis de la importancia clínica del evento..."
                  value={clinicalSignificance}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClinicalSignificance(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccinationFacilityType">Tipo de Establecimiento de Vacunación</Label>
                <Select value={vaccinationFacilityType} onValueChange={setVaccinationFacilityType}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione el tipo de establecimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="policlinico">Policlínico</SelectItem>
                    <SelectItem value="clinica-privada">Clínica Privada</SelectItem>
                    <SelectItem value="centro-salud">Centro de Salud</SelectItem>
                    <SelectItem value="farmacia">Farmacia</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindicationCriterion">Criterio de Contraindicación</Label>
                <Select value={contraindicationCriterion} onValueChange={setContraindicationCriterion}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione si hay contraindicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Contraindicación Absoluta</SelectItem>
                    <SelectItem value="relative">Contraindicación Relativa</SelectItem>
                    <SelectItem value="none">Sin Contraindicación</SelectItem>
                    <SelectItem value="unclear">Incierto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-4 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg">
            <Button
              variant="outline"
              onClick={() => onNavigate('assigned-reports')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="flex-1 gap-2"
            >
              Guardar Evaluación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
