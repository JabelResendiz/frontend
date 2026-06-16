import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { reportService, AssignedReport } from '@/app/services/report.service';
import {
  translatePatientStatus,
  translateAdministrationSite,
  translateIntensity,
} from '@/app/utils/translations';
import { translateGender } from '@/app/utils/translations';

interface ReviewReportPageProps {
  reportId?: string;
  report?: AssignedReport;
  onNavigate: (page: string, reportId?: string) => void;
}

const ReviewReportPageComponent = ({ report, onNavigate }: ReviewReportPageProps) => {
  const { user } = useAuth();
  const [causality, setCausality] = useState('');
  const [clinicalSignificance, setClinicalSignificance] = useState('');
  const [laboratoryResults, setLaboratoryResults] = useState('');
  const [medDRACode, setMedDRACode] = useState('');
  const [retClassification, setRetClassification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'MedicalReviewer') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos revisores pueden acceder.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-gray-700">No hay datos de reporte disponibles para revisar.</p>
      </div>
    );
  }

  const firstEvent = report.adverseEvents?.[0];
  const reportIDB = report.id ?? '';

  console.log(reportIDB);

  const handleSubmitReview = async () => {
    if (!causality || !clinicalSignificance) {
      toast.error('Completa causalidad y significancia clínica antes de enviar.');
      return;
    }

    if (!reportIDB) {
      toast.error('Falta el ID del reporte.');
      return;
    }

    if (!firstEvent?.id) {
      toast.error('Falta el adverseEventId del evento adverso.');
      return;
    }

    console.log(new Date());

    const reviewedAt = new Date().toLocaleString('en-CA', {
  timeZone: 'America/New_York',
  hour12: false
}).replace(',', '').replace(' ', 'T');

console.log(reviewedAt);

    const payload = {
      reportId: reportIDB,
      causality,
      clinicalSignificance,
      reviewedAt: reviewedAt,
      clinicalMedicalReviews: [
        {
          adverseEventId: firstEvent.id,
          laboratoryResults,
          medDRACode,
          retClassification,
        },
      ],
    };

    setIsSubmitting(true);
    try {
      await reportService.createMedicalReview(payload);
      toast.success('Revisión médica enviada correctamente.');
      setTimeout(() => onNavigate('assigned-reports'), 1200);
    } catch (error) {
      console.error('Error enviando revisión médica:', error);
      toast.error('No se pudo enviar la revisión. Revisa la consola para más detalles.');
    } finally {
      setIsSubmitting(false);
    }
  };

//   const handleDownload = () => {
//     const txtContent = `REPORTE DE EVENTO ADVERSO - REVISIÓN MÉDICA
// ===========================================

// Fecha del Reporte: ${new Date(report.reportDate).toLocaleString('es-ES')}

// PERSONA VACUNADA: ${report.vaccinatedSubject.fullName}

// REPORTANTE: ${report.reporter.fullName}
// Teléfono: ${report.reporter.phoneNumber}
// Email: ${report.reporter.email}

// VACUNACIONES:
// ${report.vaccinations
//       .map(
//         (v, index) => `Vacunación #${index + 1}:
// - Vacuna: ${v.vaccineName}
// - Lote: ${v.lotNumber}
// - Sitio: ${translateAdministrationSite(v.administrationSite)}
// - Dosis: ${v.doseNumber}
// - Fecha: ${new Date(v.administrationDate).toLocaleString('es-ES')}
// - Centro: ${v.vaccinationCenterName}`
//       )
//       .join('\n\n')}

// EVENTO(S) ADVERSO(S):
// ${report.adverseEvents
//       .map(
//         (event, index) => `Evento #${index + 1}:
// - Fecha de Inicio: ${new Date(event.startDate).toLocaleString('es-ES')}
// - Estado Actual: ${translatePatientStatus(event.currentStatus)}
// - Visitó Doctor: ${event.visitedDoctor ? 'Sí' : 'No'}
// - Sala de Emergencias: ${event.wentToEmergencyRoom ? 'Sí' : 'No'}
// - Discapacidad Permanente: ${event.permanentDisability ? 'Sí' : 'No'}
// - Amenaza Vital: ${event.isLifeThreatening ? 'Sí' : 'No'}
// - Resultó en Muerte: ${event.resultedInDeath ? 'Sí' : 'No'}
// - Fecha de Muerte: ${event.deathDate ?? 'N/A'}
// - Síntomas: ${event.symptom?.name}

// EVALUACIÓN CLÍNICA DEL MÉDICO:
// Causalidad: ${translateCausality(causality)}
// Significancia Clínica: ${translateClinicalSignificance(clinicalSignificance)}
// Resultados de Laboratorio: ${laboratoryResults}
// MedDRA: ${medDRACode}
// Clasificación RET: ${retClassification}
// `.trim();


//     const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `revision-reporte-${report.id}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('assigned-reports')}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver
              </Button>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">Revisión de Reporte</h1>
            </div>

            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Revisa la información clave del evento adverso, revisa la asignación y completa la evaluación clínica con claridad.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-sm">
                <strong className="font-medium">Fecha reporte:</strong>
                <span>{new Date(report.reportDate).toLocaleString('es-ES')}</span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-sm">
                <strong className="font-medium">Fecha asignación:</strong>
                <span>{report.assignedDate ? new Date(report.assignedDate).toLocaleString('es-ES') : 'N/A'}</span>
              </span>


            </div>
          </div>
          
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm border-l-4 border-indigo-400">
            <CardHeader className="border-b border-slate-200 bg-white/80">
              <CardTitle className="text-lg font-semibold text-slate-900">Sujeto Vacunado</CardTitle>
              <CardDescription>Información de la persona que recibió la vacuna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Nombre</p>
                    <p className="mt-1 text-base font-medium text-slate-900">{report.vaccinatedSubject.fullName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <span className="text-base font-semibold">A</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">Edad</p>
                    <p className="mt-1 text-slate-900">{report.vaccinatedSubject.age ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <span className="text-base font-semibold">G</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">Género</p>
                    <p className="mt-1 text-slate-900">{translateGender(report.vaccinatedSubject.gender) ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <span className="text-base font-semibold">G</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">Embarazada</p>
                    <p className="mt-1 text-slate-900">{report.vaccinatedSubject.ispregnant ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm border-l-4 border-emerald-400">
            <CardHeader className="border-b border-slate-200 bg-white/80">
              <CardTitle className="text-lg font-semibold text-slate-900">Reportante</CardTitle>
              <CardDescription>Datos de quien reportó el evento adverso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Nombre</p>
                    <p className="mt-1 text-base font-medium text-slate-900">{report.reporter.fullName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <Phone className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <p className="mt-1 text-slate-900">{report.reporter.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                  <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-1 text-slate-900">{report.reporter.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        

       

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card className="border-slate-200 shadow-sm border-l-4 border-yellow-400">
            <CardHeader className="border-b border-slate-200 bg-yellow-50">
              <CardTitle className="text-lg font-semibold text-slate-900">Vacunaciones</CardTitle>
              <CardDescription>Detalles de cada dosis aplicada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.vaccinations && Array.isArray(report.vaccinations) ? (
                report.vaccinations.map((vaccination, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Vacunación #{index + 1}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Vacuna</p>
                        <p className="mt-1 text-slate-900">{vaccination.vaccineName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Lote</p>
                        <p className="mt-1 text-slate-900">{vaccination.lotNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Sitio</p>
                        <p className="mt-1 text-slate-900">{translateAdministrationSite(vaccination.administrationSite)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Dosis</p>
                        <p className="mt-1 text-slate-900">{vaccination.doseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Fecha</p>
                        <p className="mt-1 text-slate-900">{new Date(vaccination.administrationDate).toLocaleString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Centro</p>
                        <p className="mt-1 text-slate-900">{vaccination.vaccinationCenterName}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No hay datos de vacunación registrados</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm border-l-4 border-red-400">
            <CardHeader className="border-b border-slate-200 bg-red-50">
              <CardTitle className="text-lg font-semibold text-slate-900">Evento Adverso</CardTitle>
              <CardDescription>Detalles clínicos importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.adverseEvents && Array.isArray(report.adverseEvents) ? (
                report.adverseEvents.map((event, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Evento #{index + 1}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Fecha de Inicio</p>
                        <p className="mt-1 text-slate-900">{new Date(event.startDate).toLocaleString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Estado</p>
                        <p className="mt-1 text-slate-900">{translatePatientStatus(event.currentStatus)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Intensidad</p>
                        <p className="mt-1 text-slate-900">{translateIntensity(event.intensity)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Visitó Doctor</p>
                        <p className="mt-1 text-slate-900">{event.visitedDoctor ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Emergencias</p>
                        <p className="mt-1 text-slate-900">{event.wentToEmergencyRoom ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Amenaza Vital</p>
                        <p className="mt-1 text-slate-900">{event.isLifeThreatening ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Síntomas</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.symptom ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                            {event.symptom.name}
                          </span>
                        ) : event.symptoms && Array.isArray(event.symptoms) ? (
                          event.symptoms.map((symptom) => (
                            <span key={symptom.id} className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                              {symptom.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No hay síntomas registrados</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No hay eventos adversos registrados</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm mt-6 border-l-4 border-indigo-500">
          <CardHeader className="border-b border-slate-200 bg-indigo-50">
            <CardTitle className="text-lg font-semibold text-slate-900">Evaluación Clínica</CardTitle>
            <CardDescription>Completa el análisis médico y envía la revisión</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="causality">Causalidad *</Label>
                <Select value={causality} onValueChange={setCausality}>
                  <SelectTrigger className="bg-white mt-2">
                    <SelectValue placeholder="Seleccione causalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Definitive">Definitiva</SelectItem>
                    <SelectItem value="Probable">Probable</SelectItem>
                    <SelectItem value="Possible">Posible</SelectItem>
                    <SelectItem value="Improbable">Improbable / No relacionada</SelectItem>
                    <SelectItem value="NotEvaluable">No evaluable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clinicalSignificance">Significancia Clínica *</Label>
                <Select value={clinicalSignificance} onValueChange={setClinicalSignificance}>
                  <SelectTrigger className="bg-white mt-2">
                    <SelectValue placeholder="Seleccione significancia clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ClinicallySignificantAndUnexpected">Clínicamente significativo e inesperado</SelectItem>
                    <SelectItem value="ExpectedEvent">Evento esperado</SelectItem>
                    <SelectItem value="SeriousOrLifeThreatening">Evento serio o potencialmente mortal</SelectItem>
                    <SelectItem value="MinorEvent">Evento menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="laboratoryResults">Resultados de Laboratorio</Label>
                <Textarea
                  id="laboratoryResults"
                  placeholder="Ej: Hemograma normal, función hepática sin alteraciones..."
                  value={laboratoryResults}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLaboratoryResults(e.target.value)}
                  className="bg-white min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medDRACode">Código MedDRA</Label>
                <Input
                  id="medDRACode"
                  placeholder="Ej: 23232323"
                  value={medDRACode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMedDRACode(e.target.value)}
                  className="bg-white mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retClassification">Clasificación RET</Label>
                <Input
                  id="retClassification"
                  placeholder="Ej: Posiblemente nada"
                  value={retClassification}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetClassification(e.target.value)}
                  className="bg-white mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-10 mt-6 rounded-t-3xl border border-slate-200 border-b-0 bg-white/95 p-4 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
              className="flex-1 sm:flex-none gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting}
            >
              Guardar Evaluación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewReportPageComponent;
