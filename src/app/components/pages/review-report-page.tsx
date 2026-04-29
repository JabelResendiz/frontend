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
import { reportService, AssignedReport } from '@/app/services/report.service';

interface ReviewReportPageProps {
  reportId?: string;
  report?: AssignedReport;
  onNavigate: (page: string, reportId?: string) => void;
}

export const ReviewReportPage = ({ report, onNavigate }: ReviewReportPageProps) => {
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

  const handleDownload = () => {
    const txtContent = `REPORTE DE EVENTO ADVERSO - REVISIÓN MÉDICA
===========================================

ID DEL REPORTE: ${report.id}
Fecha del Reporte: ${new Date(report.reportDate).toLocaleString('es-ES')}

PERSONA VACUNADA: ${report.vaccinatedSubject.fullName}

REPORTANTE: ${report.reporter.fullName}
Teléfono: ${report.reporter.phoneNumber}
Email: ${report.reporter.email}

VACUNACIONES:
${report.vaccinations
      .map(
        (v, index) => `Vacunación #${index + 1}:
- Vacuna: ${v.vaccineName}
- Lote: ${v.batchNumber}
- Sitio: ${v.administrationSite}
- Dosis: ${v.doseNumber}
- Fecha: ${new Date(v.administrationDate).toLocaleString('es-ES')}
- Centro: ${v.vaccinationCenter}`
      )
      .join('\n\n')}

EVENTO(S) ADVERSO(S):
${report.adverseEvents
      .map(
        (event, index) => `Evento #${index + 1}:
- Fecha de Inicio: ${new Date(event.startDate).toLocaleString('es-ES')}
- Estado Actual: ${event.currentStatus}
- Visitó Doctor: ${event.visitedDoctor ? 'Sí' : 'No'}
- Sala de Emergencias: ${event.wentToEmergencyRoom ? 'Sí' : 'No'}
- Discapacidad Permanente: ${event.permanentDisability ? 'Sí' : 'No'}
- Amenaza Vital: ${event.isLifeThreatening ? 'Sí' : 'No'}
- Resultó en Muerte: ${event.resultedInDeath ? 'Sí' : 'No'}
- Fecha de Muerte: ${event.deathDate ?? 'N/A'}
- Síntomas: ${event.symptoms.map((s) => s.name).join(', ')}`
      )
      .join('\n\n')}

EVALUACIÓN CLÍNICA DEL MÉDICO:
Causalidad: ${causality}
Significancia Clínica: ${clinicalSignificance}
Resultados de Laboratorio: ${laboratoryResults}
MedDRA: ${medDRACode}
Clasificación RET: ${retClassification}
`.trim();

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revision-reporte-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-xl">📋 Información del Reporte</CardTitle>
              <CardDescription>Solo datos entregados por el backend</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">ID del Reporte</Label>
                  <p className="text-gray-900 mt-1">{report.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Fecha del Reporte</Label>
                  <p className="text-gray-900 mt-1">{new Date(report.reportDate).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Persona Vacunada</Label>
                  <p className="text-gray-900 mt-1">{report.vaccinatedSubject.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Reportante</Label>
                  <p className="text-gray-900 mt-1">{report.reporter.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Teléfono del Reportante</Label>
                  <p className="text-gray-900 mt-1">{report.reporter.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Email del Reportante</Label>
                  <p className="text-gray-900 mt-1">{report.reporter.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-xl">💉 Vacunaciones</CardTitle>
              <CardDescription>Datos de vacunación del backend</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {report.vaccinations.map((vaccination, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-3">Vacunación #{index + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Vacuna</Label>
                      <p className="text-gray-900 mt-1">{vaccination.vaccineName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Lote</Label>
                      <p className="text-gray-900 mt-1">{vaccination.batchNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Sitio de Administración</Label>
                      <p className="text-gray-900 mt-1">{vaccination.administrationSite}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Dosis</Label>
                      <p className="text-gray-900 mt-1">{vaccination.doseNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Fecha de Administración</Label>
                      <p className="text-gray-900 mt-1">{new Date(vaccination.administrationDate).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Centro de Vacunación</Label>
                      <p className="text-gray-900 mt-1">{vaccination.vaccinationCenter}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-yellow-50 border-b">
              <CardTitle className="text-xl">⚠️ Evento(s) Adverso(s)</CardTitle>
              <CardDescription>Datos del backend</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {report.adverseEvents.map((event, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-3">Evento Adverso #{index + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Fecha de Inicio</Label>
                      <p className="text-gray-900 mt-1">{new Date(event.startDate).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Estado Actual</Label>
                      <p className="text-gray-900 mt-1">{event.currentStatus}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Visitó Doctor</Label>
                      <p className="text-gray-900 mt-1">{event.visitedDoctor ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Fue a Emergencias</Label>
                      <p className="text-gray-900 mt-1">{event.wentToEmergencyRoom ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Discapacidad Permanente</Label>
                      <p className="text-gray-900 mt-1">{event.permanentDisability ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Amenaza Vital</Label>
                      <p className="text-gray-900 mt-1">{event.isLifeThreatening ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Resultó en Muerte</Label>
                      <p className="text-gray-900 mt-1">{event.resultedInDeath ? 'Sí' : 'No'}</p>
                    </div>
                    {event.deathDate && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Fecha de Muerte</Label>
                        <p className="text-gray-900 mt-1">{new Date(event.deathDate).toLocaleString('es-ES')}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Label className="text-sm font-semibold text-gray-700">Síntomas</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {event.symptoms.map((symptom) => (
                        <span key={symptom.id} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {symptom.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-xl">🏥 Tu Evaluación Clínica</CardTitle>
              <CardDescription>Completa los campos para enviar la revisión</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Alert className="border-purple-200 bg-purple-50">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-800">
                  En el POST se envía el nombre del enum, no su valor numérico.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="causality">Causalidad *</Label>
                  <Select value={causality} onValueChange={setCausality}>
                    <SelectTrigger className="bg-white mt-2">
                      <SelectValue placeholder="Seleccione causalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Definitive">Definitive</SelectItem>
                      <SelectItem value="Probable">Probable</SelectItem>
                      <SelectItem value="Possible">Possible</SelectItem>
                      <SelectItem value="Improbable">Improbable</SelectItem>
                      <SelectItem value="NotEvaluable">NotEvaluable</SelectItem>
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
                      <SelectItem value="ClinicallySignificantAndUnexpected">ClinicallySignificantAndUnexpected</SelectItem>
                      <SelectItem value="ExpectedEvent">ExpectedEvent</SelectItem>
                      <SelectItem value="SeriousOrLifeThreatening">SeriousOrLifeThreatening</SelectItem>
                      <SelectItem value="MinorEvent">MinorEvent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reportIDB && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">ID del Reporte</Label>
                  <p className="text-gray-900 mt-1">{reportIDB}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="laboratoryResults">Resultados de Laboratorio</Label>
                <Textarea
                  id="laboratoryResults"
                  placeholder="Ej: Hemograma normal, función hepática sin alteraciones..."
                  value={laboratoryResults}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLaboratoryResults(e.target.value)}
                  className="bg-white min-h-[80px]"
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
            </CardContent>
          </Card>

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
