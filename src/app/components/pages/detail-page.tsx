import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { ReportStatusTimeline, ReportStatus } from "@/app/components/ui/report-status-timeline";
import { 
  ArrowLeft, 
  User, 
  Syringe, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  FileText,
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react";

interface DetailPageProps {
  reportId?: string;
  onNavigate: (page: string) => void;
}

export function DetailPage({ reportId = "RPT-2026-0142", onNavigate }: DetailPageProps) {
  // Mock detailed data
  const reportDetail = {
    id: reportId,
    status: "revisado",
    submissionDate: "2026-01-24T10:30:00",
    reviewDate: "2026-01-25T14:20:00",
    reportStatus: ReportStatus.UnderReview, // Current status for timeline
    
    patient: {
      age: 45,
      gender: "Femenino",
      province: "La Habana",
      medicalHistory: "Hipertensión controlada con medicación",
      allergies: "Alergia a penicilina y mariscos",
      currentMedications: "Enalapril 10mg diario, Aspirina 100mg diario",
      otherVaccinesLastMonth: "Vacuna contra la gripe (hace 2 semanas)"
    },
    
    vaccine: {
      name: "Soberana 02",
      manufacturer: "Instituto Finlay de Vacunas",
      batchNumber: "L-2025-042",
      vaccinationDate: "2026-01-22",
      vaccinationSite: "Policlínico Vedado, La Habana",
      doseNumber: "Segunda dosis"
    },
    
    event: {
      startDate: "2026-01-22",
      severity: "leve",
      outcome: "recuperado",
      hospitalization: "No",
      symptoms: [
        "Dolor en el sitio de inyección",
        "Fiebre leve (37.8°C)",
        "Fatiga"
      ],
      description: "La paciente reporta dolor moderado en el sitio de inyección aproximadamente 2 horas después de la vacunación. Durante la noche presentó fiebre leve (37.8°C) y fatiga. Los síntomas fueron manejados con paracetamol según indicación médica. A las 48 horas, todos los síntomas habían desaparecido completamente.",
      treatment: "Paracetamol 500mg cada 8 horas por 24 horas",
      medicalAttention: "Consultó al médico de familia",
      laboratoryResults: "No se realizaron exámenes de laboratorio",
      professionalDiagnosis: "Reacción adversa leve post-vacunación"
    },
    
    reporter: {
      type: "Profesional de la Salud",
      name: "Dr. Carlos Méndez (opcional)",
      contact: "carlos.mendez@salud.cu"
    },
    
    timeline: [
      {
        date: "2026-01-22 09:00",
        event: "Administración de vacuna",
        description: "Segunda dosis de Soberana 02 administrada"
      },
      {
        date: "2026-01-22 11:00",
        event: "Inicio de síntomas",
        description: "Dolor en sitio de inyección"
      },
      {
        date: "2026-01-22 22:00",
        event: "Fiebre leve",
        description: "Temperatura 37.8°C, se inicia paracetamol"
      },
      {
        date: "2026-01-24 10:00",
        event: "Resolución completa",
        description: "Todos los síntomas han desaparecido"
      },
      {
        date: "2026-01-24 10:30",
        event: "Reporte enviado",
        description: "Reporte registrado en el sistema"
      },
      {
        date: "2026-01-25 14:20",
        event: "Evaluación completada",
        description: "Reporte revisado y clasificado"
      }
    ],
    
    technicalNotes: [
      {
        date: "2026-01-25 14:20",
        author: "Dra. María Rodríguez - Farmacovigilancia",
        note: "Evento adverso consistente con reacciones post-vacunación esperadas. Evolución favorable sin complicaciones. No requiere seguimiento adicional. Clasificado como evento adverso leve y esperado según literatura científica."
      }
    ]
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      leve: { bg: "#E8F5EB", text: "#2D7A3E", label: "Leve" },
      moderado: { bg: "#FEF3C7", text: "#D97706", label: "Moderado" },
      severo: { bg: "#FEE2E2", text: "#DC2626", label: "Severo" }
    };
    const style = styles[severity as keyof typeof styles] || styles.leve;
    
    return (
      <Badge 
        variant="secondary" 
        className="font-medium text-sm"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </Badge>
    );
  };

  const handleDownloadTxt = () => {
    const txtContent = `
REPORTE DETALLADO DE EVENTO ADVERSO
=====================================

ID DEL REPORTE: ${reportDetail.id}
ESTADO: ${reportDetail.status}
FECHA DE ENVÍO: ${new Date(reportDetail.submissionDate).toLocaleString('es-ES')}
FECHA DE REVISIÓN: ${new Date(reportDetail.reviewDate).toLocaleString('es-ES')}

INFORMACIÓN DEL PACIENTE
========================
Edad: ${reportDetail.patient.age} años
Sexo: ${reportDetail.patient.gender}
Provincia: ${reportDetail.patient.province}
Antecedentes Médicos: ${reportDetail.patient.medicalHistory}
Medicamentos Actuales: ${reportDetail.patient.currentMedications}
Alergias: ${reportDetail.patient.allergies}
Otras Vacunas (Último Mes): ${reportDetail.patient.otherVaccinesLastMonth}

INFORMACIÓN DE LA VACUNA
========================
Nombre: ${reportDetail.vaccine.name}
Fabricante: ${reportDetail.vaccine.manufacturer}
Lote: ${reportDetail.vaccine.batchNumber}
Dosis: ${reportDetail.vaccine.doseNumber}
Fecha de Vacunación: ${new Date(reportDetail.vaccine.vaccinationDate).toLocaleDateString('es-ES')}
Sitio de Vacunación: ${reportDetail.vaccine.vaccinationSite}

EVENTO ADVERSO
==============
Fecha de Inicio: ${new Date(reportDetail.event.startDate).toLocaleDateString('es-ES')}
Severidad: ${reportDetail.event.severity}
Estado Actual: ${reportDetail.event.outcome}
Hospitalización: ${reportDetail.event.hospitalization}

Síntomas Reportados:
${reportDetail.event.symptoms.map(s => `- ${s}`).join('\n')}

Descripción Detallada:
${reportDetail.event.description}

Tratamiento Recibido:
${reportDetail.event.treatment}

Atención Médica:
${reportDetail.event.medicalAttention}

Resultados de Laboratorio:
${reportDetail.event.laboratoryResults}

Diagnóstico Profesional:
${reportDetail.event.professionalDiagnosis}

INFORMACIÓN DEL REPORTANTE
==========================
Tipo: ${reportDetail.reporter.type}
Nombre: ${reportDetail.reporter.name}
Contacto: ${reportDetail.reporter.contact}

LÍNEA DE TIEMPO DEL CASO
========================
${reportDetail.timeline.map(item => `${item.date}: ${item.event} - ${item.description}`).join('\n')}

NOTAS TÉCNICAS
==============
${reportDetail.technicalNotes.map(note => `${new Date(note.date).toLocaleString('es-ES')} - ${note.author}:
${note.note}`).join('\n\n')}
    `.trim();

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${reportDetail.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendiente: { bg: "#FEF3C7", text: "#D97706", label: "Pendiente" },
      revisado: { bg: "#E8F0F7", text: "#0A4B8F", label: "Revisado" },
      cerrado: { bg: "#E8F5EB", text: "#2D7A3E", label: "Cerrado" }
    };
    const style = styles[status as keyof typeof styles] || styles.pendiente;
    
    return (
      <Badge 
        variant="secondary" 
        className="font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => onNavigate("consultation")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Consulta
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
                Detalle del Reporte
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-lg font-semibold text-gray-700">
                  {reportDetail.id}
                </span>
                {getStatusBadge(reportDetail.status)}
                {getSeverityBadge(reportDetail.event.severity)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleDownloadTxt}>
                <FileText className="w-4 h-4" />
                Descargar TXT
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Paciente
                </CardTitle>
                <CardDescription>Datos demográficos (anónimos)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Edad</div>
                  <div className="font-medium">{reportDetail.patient.age} años</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sexo</div>
                  <div className="font-medium">{reportDetail.patient.gender}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Provincia</div>
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {reportDetail.patient.province}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Antecedentes Médicos</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {reportDetail.patient.medicalHistory}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Medicamentos Actuales</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {reportDetail.patient.currentMedications}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Alergias</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {reportDetail.patient.allergies}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Otras Vacunas (Último Mes)</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {reportDetail.patient.otherVaccinesLastMonth}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vaccine Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="w-5 h-5" />
                  Información de la Vacuna
                </CardTitle>
                <CardDescription>Detalles de la vacunación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Vacuna</div>
                    <div className="font-medium">{reportDetail.vaccine.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Fabricante</div>
                    <div className="font-medium text-sm">{reportDetail.vaccine.manufacturer}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Lote</div>
                    <div className="font-mono text-sm font-medium">{reportDetail.vaccine.batchNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Dosis</div>
                    <div className="font-medium">{reportDetail.vaccine.doseNumber}</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fecha de Vacunación</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(reportDetail.vaccine.vaccinationDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sitio de Vacunación</div>
                  <div className="font-medium text-sm">{reportDetail.vaccine.vaccinationSite}</div>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Descripción del Evento Adverso
                </CardTitle>
                <CardDescription>Síntomas y evolución del evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Fecha de Inicio</div>
                    <div className="font-medium">
                      {new Date(reportDetail.event.startDate).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Estado Actual</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium capitalize">{reportDetail.event.outcome}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Hospitalización</div>
                    <div className="font-medium">{reportDetail.event.hospitalization}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Severidad</div>
                    <div>{getSeverityBadge(reportDetail.event.severity)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Síntomas Reportados</div>
                  <div className="flex flex-wrap gap-2">
                    {reportDetail.event.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Descripción Detallada</div>
                  <div className="text-sm bg-gray-50 p-4 rounded-md leading-relaxed">
                    {reportDetail.event.description}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Tratamiento Recibido</div>
                  <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
                    {reportDetail.event.treatment}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Atención Médica</div>
                  <div className="text-sm bg-green-50 p-3 rounded-md border border-green-100">
                    {reportDetail.event.medicalAttention}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Resultados de Laboratorio</div>
                  <div className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-100">
                    {reportDetail.event.laboratoryResults}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Diagnóstico Profesional</div>
                  <div className="text-sm bg-purple-50 p-3 rounded-md border border-purple-100">
                    {reportDetail.event.professionalDiagnosis}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Notes */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Notas Técnicas
                </CardTitle>
                <CardDescription>Evaluación del equipo de farmacovigilancia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportDetail.technicalNotes.map((note, index) => (
                  <div key={index} className="border-l-4 pl-4" style={{ borderColor: "#0A4B8F" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(note.date).toLocaleString('es-ES')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-medium" style={{ color: "#0A4B8F" }}>
                        {note.author}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {note.note}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Estado del Reporte
                </CardTitle>
                <CardDescription>Progreso de evaluación</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportStatusTimeline 
                  currentStatus={reportDetail.reportStatus}
                  statusHistory={[
                    {
                      status: ReportStatus.Submitted,
                      date: reportDetail.submissionDate,
                      comments: "Reporte recibido en el sistema"
                    },
                    {
                      status: ReportStatus.UnderReview,
                      date: reportDetail.reviewDate,
                      comments: "En evaluación por profesional de farmacovigilancia"
                    }
                  ]}
                />
              </CardContent>
            </Card>

            {/* Historic Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Línea de Tiempo del Caso
                </CardTitle>
                <CardDescription>Historial de eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportDetail.timeline.map((item, index) => (
                    <div key={index} className="relative pl-6 pb-4 last:pb-0">
                      {index !== reportDetail.timeline.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div 
                        className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white" 
                        style={{ backgroundColor: "#0A4B8F" }}
                      />
                      <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                      <div className="text-sm font-medium mb-1">{item.event}</div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reporter Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Información del Reportante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tipo</div>
                  <div className="text-sm font-medium">{reportDetail.reporter.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Nombre</div>
                  <div className="text-sm font-medium">{reportDetail.reporter.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Contacto</div>
                  <div className="text-sm font-medium">{reportDetail.reporter.contact}</div>
                </div>
              </CardContent>
            </Card>

            {/* Report Metadata */}
            <Card className="border-0 shadow-lg bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Metadatos del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Fecha de Envío</div>
                  <div className="font-medium">
                    {new Date(reportDetail.submissionDate).toLocaleString('es-ES')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Fecha de Revisión</div>
                  <div className="font-medium">
                    {new Date(reportDetail.reviewDate).toLocaleString('es-ES')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">ID del Reporte</div>
                  <div className="font-mono font-medium">{reportDetail.id}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
