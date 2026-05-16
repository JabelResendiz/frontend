import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Syringe, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  FileText,
  Loader2
} from "lucide-react";
import { api } from "@/app/services/api";
import { 
  translateGender,
  translateAdministrationSite,
  translatePatientStatus,
  translateIntensity,
  translateReporterRelationship,
  translateReviewAssignmentStatus,
  translateCausality,
  translateClinicalSignificance
} from "@/app/utils/translations";


interface DetailPageProps {
  reportId?: string;
  onNavigate: (page: string) => void;
}

interface DetailReport {
  id: string;
  notificationNumber: string;
  createdAt: string;
  reportDate: string;
  status: string;
  globalSeverityLevel: string;
  reporter: {
    reporterRelationship: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  vaccinatedSubject: {
    age: number;
    gender: string;
    isPregnant: boolean;
    provinceName: string;
    municipalityName: string;
    currentMedications: string;
    allergies: string;
    medicalHistory: string;
  };
  vaccinations: Array<{
    vaccineName: string;
    lotNumber: string;
    administrationSite: string;
    doseNumber: number;
    administrationDate: string;
    vaccinationCenterName: string;
  }>;
  adverseEvents: Array<{
    startDate: string;
    visitedDoctor: boolean;
    wentToEmergencyRoom: boolean;
    permanentDisability: boolean;
    isLifeThreatening: boolean;
    resultedInDeath: boolean;
    deathDate: string | null;
    currentStatus: string;
    intensity: string;
    severityLevel: string;
    symptom: string;
    description: string;
    medDRACode: string;
    retClassification: string;
  }>;
  medicalReviewAssignments: Array<{
    id: string;
    medicalReviewerName: string;
    assignedAt: string;
    sectionResponsibleName: string;
    status: string;
    rejectionReason: string | null;
  }>;
  medicalReview: {
    clinicalSignificance: string;
    causality: string;
    medicalReviewAssignmentId: string;
    reviewedAt: string;
  } | null;
}

export function DetailPage({ reportId, onNavigate }: DetailPageProps) {
  const [detail, setDetail] = useState<DetailReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!reportId) {
        setError("No report ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/Report/admin/detail?reportId=${reportId}`);
        setDetail(response.data);
      } catch (err) {
        console.error("Error loading report detail:", err);
        setError("Error al cargar los detalles del reporte");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Cargando detalle del reporte...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => onNavigate("consultation")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Consulta
          </Button>
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 font-semibold">{error || "No se encontraron datos del reporte"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      Serious: { bg: "#FEE2E2", text: "#DC2626", label: "Serio" },
      NonSerious: { bg: "#E8F5EB", text: "#2D7A3E", label: "No serio" }
    };
    const style = styles[severity] || { bg: "#F3F4F6", text: "#374151", label: severity || "No definido" };

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      UnderReview: { bg: "#FEF3C7", text: "#D97706", label: "En Revisión" },
      Submitted: { bg: "#DBEAFE", text: "#1E40AF", label: "Enviado" },
      Approved: { bg: "#E8F5EB", text: "#2D7A3E", label: "Aprobado" },
      Rejected: { bg: "#FEE2E2", text: "#DC2626", label: "Rechazado" }
    };
    const statusStyle = styles[status] || styles.Submitted;
    
    return (
      <Badge 
        variant="secondary" 
        className="font-medium"
        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
      >
        {statusStyle.label}
      </Badge>
    );
  };

  const handleDownloadTxt = () => {
    const txtContent = `
REPORTE DETALLADO DE EVENTO ADVERSO
=====================================

NÚMERO DE NOTIFICACIÓN: ${detail.notificationNumber}
ESTADO: ${detail.status}
FECHA DE CREACIÓN: ${new Date(detail.createdAt).toLocaleString('es-ES')}
FECHA DEL REPORTE: ${new Date(detail.reportDate).toLocaleString('es-ES')}

INFORMACIÓN DEL PACIENTE
========================
Edad: ${detail.vaccinatedSubject.age} años
Sexo: ${translateGender(detail.vaccinatedSubject.gender)}
Embarazada: ${detail.vaccinatedSubject.isPregnant ? 'Sí' : 'No'}
Provincia: ${detail.vaccinatedSubject.provinceName}
Antecedentes Médicos: ${detail.vaccinatedSubject.medicalHistory || 'N/A'}
Medicamentos Actuales: ${detail.vaccinatedSubject.currentMedications || 'N/A'}
Alergias: ${detail.vaccinatedSubject.allergies || 'N/A'}

INFORMACIÓN DEL REPORTANTE
==========================
Nombre: ${detail.reporter.fullName}
Relación: ${detail.reporter.reporterRelationship}
Teléfono: ${detail.reporter.phoneNumber}
Email: ${detail.reporter.email}

VACUNACIONES
=============
${detail.vaccinations.map((v, idx) => `
Vacunación ${idx + 1}:
- Vacuna: ${v.vaccineName}
- Lote: ${v.lotNumber}
- Dosis: ${v.doseNumber}
- Sitio: ${v.administrationSite}
- Fecha: ${new Date(v.administrationDate).toLocaleString('es-ES')}
- Centro: ${v.vaccinationCenterName}
`).join('\n')}

EVENTOS ADVERSOS
================
${detail.adverseEvents.map((event, idx) => `
Evento ${idx + 1}:
- Fecha de Inicio: ${new Date(event.startDate).toLocaleString('es-ES')}
- Síntoma: ${event.symptom || 'N/A'}
- Intensidad: ${event.intensity || 'N/A'}
- Severidad: ${event.severityLevel || 'N/A'}
- Estado Actual: ${event.currentStatus || 'N/A'}
- Visitó Doctor: ${event.visitedDoctor ? 'Sí' : 'No'}
- Fue a Emergencias: ${event.wentToEmergencyRoom ? 'Sí' : 'No'}
- Discapacidad Permanente: ${event.permanentDisability ? 'Sí' : 'No'}
- Amenaza Vital: ${event.isLifeThreatening ? 'Sí' : 'No'}
- Resultó en Muerte: ${event.resultedInDeath ? 'Sí' : 'No'}
- Descripción: ${event.description || 'N/A'}
- Código MedDRA: ${event.medDRACode || 'N/A'}
- Clasificación RET: ${event.retClassification || 'N/A'}
`).join('\n')}

ASIGNACIONES DE REVISIÓN MÉDICA
================================
${detail.medicalReviewAssignments && detail.medicalReviewAssignments.length > 0 
  ? detail.medicalReviewAssignments.map((assignment, idx) => `
Asignación ${idx + 1}:
- Médico Revisor: ${assignment.medicalReviewerName}
- Responsable de Sección: ${assignment.sectionResponsibleName}
- Estado: ${translateReviewAssignmentStatus(assignment.status)}
- Asignado en: ${new Date(assignment.assignedAt).toLocaleString('es-ES')}
- Razón de Rechazo: ${assignment.rejectionReason || 'N/A'}
`).join('\n')
  : 'No hay asignaciones de revisión médica registradas'}

REVISIÓN MÉDICA
===============
${detail.medicalReview
  ? `
- Causalidad: ${detail.medicalReview.causality}
- Significancia Clínica: ${detail.medicalReview.clinicalSignificance}
- Revisado en: ${new Date(detail.medicalReview.reviewedAt).toLocaleString('es-ES')}
`
  : 'No hay revisión médica registrada'}

SEVERIDAD GENERAL: ${detail.globalSeverityLevel}
    `.trim();

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${detail.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                  {detail.notificationNumber}
                </span>
                {getStatusBadge(detail.status)}
                {getSeverityBadge(detail.globalSeverityLevel)}
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
                  <div className="font-medium">{detail.vaccinatedSubject.age} años</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sexo</div>
                  <div className="font-medium">{translateGender(detail.vaccinatedSubject.gender)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Provincia</div>
                  <div className="font-medium flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-gray-400" />
                     {detail.vaccinatedSubject.provinceName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Municipio</div>
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {detail.vaccinatedSubject.municipalityName}
                  </div>
                </div>
                {/* <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Provincia</div>
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {detail.vaccinatedSubject.provinceName}
                  </div>
                </div> */}
                

                {/* {detail.vaccinatedSubject.municipalityName && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Municipio</div>
                    <div className="font-medium">{detail.vaccinatedSubject.municipalityName}</div>
                  </div>
                )} */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Embarazada</div>
                  <div className="font-medium">{detail.vaccinatedSubject.isPregnant ? 'Sí' : 'No'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Antecedentes Médicos</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {detail.vaccinatedSubject.medicalHistory || 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Medicamentos Actuales</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {detail.vaccinatedSubject.currentMedications || 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Alergias</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {detail.vaccinatedSubject.allergies || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vaccine Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="w-5 h-5" />
                  Vacunaciones
                </CardTitle>
                <CardDescription>Detalles de las vacunaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.vaccinations && detail.vaccinations.length > 0 ? (
                  detail.vaccinations.map((vaccination, idx) => (
                    <div key={idx} className="p-4 bg-white border rounded-lg">
                      <h4 className="font-semibold mb-3">Vacunación #{idx + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Vacuna</div>
                          <div className="font-medium">{vaccination.vaccineName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Lote</div>
                          <div className="font-mono text-sm font-medium">{vaccination.lotNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Dosis</div>
                          <div className="font-medium">{vaccination.doseNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Sitio</div>
                          <div className="font-medium text-sm">{translateAdministrationSite(vaccination.administrationSite)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Fecha</div>
                          <div className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(vaccination.administrationDate).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Centro</div>
                          <div className="font-medium text-sm">{vaccination.vaccinationCenterName}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay vacunaciones registradas</p>
                )}
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Eventos Adversos
                </CardTitle>
                <CardDescription>Síntomas y evolución de los eventos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {detail.adverseEvents && detail.adverseEvents.length > 0 ? (
                  detail.adverseEvents.map((event, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Evento Adverso #{idx + 1}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Fecha de Inicio</div>
                          <div className="font-medium">
                            {new Date(event.startDate).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Severidad</div>
                          {getSeverityBadge(event.severityLevel || 'NonSerious')}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Intensidad</div>
                          <div className="font-medium">{translateIntensity(event.intensity)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Estado Actual</div>
                          <div className="font-medium">{translatePatientStatus(event.currentStatus)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Visitó Doctor</div>
                          <div className="font-medium">{event.visitedDoctor ? 'Sí' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Fue a Emergencias</div>
                          <div className="font-medium">{event.wentToEmergencyRoom ? 'Sí' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Discapacidad Permanente</div>
                          <div className="font-medium">{event.permanentDisability ? 'Sí' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Amenaza Vital</div>
                          <div className="font-medium">{event.isLifeThreatening ? 'Sí' : 'No'}</div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Síntoma</div>
                          <div className="text-sm font-medium bg-blue-50 p-2 rounded border border-blue-100">
                            {event.symptom || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Descripción</div>
                          <div className="text-sm bg-white p-2 rounded border">{event.description || 'N/A'}</div>
                        </div>
                        {event.medDRACode && (
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Código MedDRA</div>
                            <div className="text-sm font-mono">{event.medDRACode}</div>
                          </div>
                        )}
                        {event.retClassification && (
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Clasificación RET</div>
                            <div className="text-sm font-mono">{event.retClassification}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay eventos adversos registrados</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Estado del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Estado General</div>
                  <div>{getStatusBadge(detail.status)}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Severidad Global</div>
                  <div>{getSeverityBadge(detail.globalSeverityLevel)}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Fecha de Creación</div>
                  <div className="font-medium">
                    {new Date(detail.createdAt).toLocaleString('es-ES')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Fecha del Reporte</div>
                  <div className="font-medium">
                    {new Date(detail.reportDate).toLocaleString('es-ES')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Reportante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Nombre</div>
                  <div className="text-sm font-medium">{detail.reporter.fullName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Relación</div>
                  <div className="text-sm font-medium">{translateReporterRelationship(detail.reporter.reporterRelationship)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Teléfono</div>
                  <div className="text-sm font-medium">{detail.reporter.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="text-sm font-medium break-words">{detail.reporter.email}</div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Review Assignments */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Asignaciones de Revisión</CardTitle>
              </CardHeader>
              <CardContent>
                {detail.medicalReviewAssignments && detail.medicalReviewAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {detail.medicalReviewAssignments.map((assignment, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border">
                        <div className="text-sm font-medium mb-2">Asignación #{idx + 1}</div>
                        <div className="space-y-1 text-xs">
                          <div><span className="text-gray-600">Médico:</span> {assignment.medicalReviewerName}</div>
                          <div><span className="text-gray-600">Responsable:</span> {assignment.sectionResponsibleName}</div>
                          <div><span className="text-gray-600">Estado:</span> <Badge className="text-xs mt-1">{translateReviewAssignmentStatus(assignment.status)}</Badge></div>
                          <div><span className="text-gray-600">Asignado:</span> {new Date(assignment.assignedAt).toLocaleDateString('es-ES')}</div>
                          {assignment.rejectionReason && (
                            <div><span className="text-gray-600">Rechazo:</span> {assignment.rejectionReason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay asignaciones de revisión médica registradas</p>
                )}
              </CardContent>
            </Card>

            {/* Medical Review */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Revisión Médica</CardTitle>
              </CardHeader>
              <CardContent>
                {detail.medicalReview ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Causalidad</div>
                      <div className="font-medium">{translateCausality(detail.medicalReview.causality)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Significancia Clínica</div>
                      <div className="font-medium">{translateClinicalSignificance(detail.medicalReview.clinicalSignificance)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Revisado en</div>
                      <div className="font-medium">
                        {new Date(detail.medicalReview.reviewedAt).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay revisión médica registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Report ID Card */}
            {/* <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base">ID del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="font-mono text-xs break-words bg-white p-2 rounded border">{detail.id}</div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
