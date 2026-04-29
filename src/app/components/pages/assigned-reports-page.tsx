import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Eye, Download } from 'lucide-react';
import { reportService, AssignedReport } from '@/app/services/report.service';

interface AssignedReportsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string, payload?: AssignedReport) => void;
}

export const AssignedReportsPage = ({ onNavigate }: AssignedReportsPageProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignedReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reportService.getAssignedReportsForReviewer(1, 10);
        console.log('API Response:', response);
        setReports(response?.items || []);
      } catch (err) {
        console.error('Error loading assigned reports:', err);
        setError('Error al cargar los reportes asignados');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'MedicalReviewer') {
      loadAssignedReports();
    }
  }, [user]);

  if (!user || user.role !== 'MedicalReviewer') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos pueden acceder a este panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando reportes asignados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const getStatusFromReport = (report: AssignedReport): 'pending' | 'in-review' | 'completed' => {
    // Lógica para determinar el status basado en los datos del reporte
    // Por ahora, asumimos que todos están pendientes
    return 'pending';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-500';
      case 'in-review':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in-review':
        return 'En Revisión';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  const getSeverityFromReport = (report: AssignedReport): 'leve' | 'moderado' | 'grave' => {
    const hasSevereEvent = report.adverseEvents.some(event =>
      event.isLifeThreatening || event.resultedInDeath || event.permanentDisability
    );

    if (hasSevereEvent) return 'grave';

    const hasModerateEvent = report.adverseEvents.some(event =>
      event.wentToEmergencyRoom || event.visitedDoctor
    );

    if (hasModerateEvent) return 'moderado';

    return 'leve';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'leve':
        return 'text-green-600';
      case 'moderado':
        return 'text-yellow-600';
      case 'grave':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'leve':
        return 'Leve';
      case 'moderado':
        return 'Moderado';
      case 'grave':
        return 'Grave';
      default:
        return severity;
    }
  };

  const handleDownload = (report: AssignedReport) => {
    const txtContent = `
REPORTE ASIGNADO PARA REVISIÓN
==============================

ID: ${report.id}
Fecha del Reporte: ${new Date(report.reportDate).toLocaleDateString('es-ES')}

PACIENTE
========
Nombre: ${report.vaccinatedSubject.fullName}

REPORTANTE
==========
Nombre: ${report.reporter.fullName}
Teléfono: ${report.reporter.phoneNumber}
Email: ${report.reporter.email}

VACUNAS ADMINISTRADAS
=====================
${report.vaccinations.map((v, idx) => `
Vacuna ${idx + 1}:
- Nombre: ${v.vaccineName}
- Lote: ${v.batchNumber}
- Sitio: ${v.administrationSite}
- Dosis: ${v.doseNumber}
- Fecha: ${new Date(v.administrationDate).toLocaleDateString('es-ES')}
- Centro: ${v.vaccinationCenter}
`).join('\n')}

EVENTOS ADVERSOS
================
${report.adverseEvents.map((event, idx) => `
Evento ${idx + 1}:
- Fecha de Inicio: ${new Date(event.startDate).toLocaleDateString('es-ES')}
- Estado Actual: ${event.currentStatus}
- Visitó Doctor: ${event.visitedDoctor ? 'Sí' : 'No'}
- Fue a Emergencias: ${event.wentToEmergencyRoom ? 'Sí' : 'No'}
- Discapacidad Permanente: ${event.permanentDisability ? 'Sí' : 'No'}
- Amenaza Vital: ${event.isLifeThreatening ? 'Sí' : 'No'}
- Resultó en Muerte: ${event.resultedInDeath ? 'Sí' : 'No'}
- Fecha de Muerte: ${event.deathDate || 'N/A'}
- Síntomas: ${event.symptoms.map(s => s.name).join(', ')}
`).join('\n')}
    `.trim();

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-asignado-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Reportes Asignados</h1>
        <p className="text-gray-600">Revisa y completa los reportes de eventos adversos asignados a ti</p>
      </div>

      {(!reports || reports.length === 0) ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600 mb-4">No tienes reportes asignados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.isArray(reports) && reports.map((report) => {
            const status = getStatusFromReport(report);
            const severity = getSeverityFromReport(report);
            const vaccineNames = report.vaccinations.map(v => v.vaccineName).join(', ');

            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{report.vaccinatedSubject.fullName}</CardTitle>
                        <Badge className={`${getStatusBadgeColor(status)} text-white whitespace-nowrap`}>
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        <span className="flex flex-wrap gap-4 text-sm block">
                          <span>Reporte: <strong>{report.id}</strong></span>
                          <span>Vacuna(s): <strong>{vaccineNames}</strong></span>
                          <span>Fecha: <strong>{new Date(report.reportDate).toLocaleDateString()}</strong></span>
                          <span>Reportante: <strong>{report.reporter.fullName}</strong></span>
                          <span className={`font-semibold ${getSeverityColor(severity)}`}>
                            Severidad: {getSeverityLabel(severity)}
                          </span>
                        </span>
                        {report.adverseEvents.length > 0 && (
                          <span className="mt-2 text-sm block">
                            <span>Síntomas: <strong>{report.adverseEvents[0].symptoms.map(s => s.name).join(', ')}</strong></span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => onNavigate('review-report', report.id, undefined, report)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver y Completar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
