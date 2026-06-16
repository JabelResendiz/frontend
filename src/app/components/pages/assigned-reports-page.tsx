import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Eye, Download, Loader2 } from 'lucide-react';
import { reportService, AssignedReport } from '@/app/services/report.service';
import { catalogService } from '@/app/services/catalog.service';

interface AssignedReportsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string, payload?: AssignedReport) => void;
}

const AssignedReportsPageComponent = ({ onNavigate }: AssignedReportsPageProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [vaccineFilter, setVaccineFilter] = useState<string>('all');
  const [sortByFilter, setSortByFilter] = useState<string>('reportDate');
  const [orderFilter, setOrderFilter] = useState<'asc' | 'desc'>('desc');
  const [vaccines, setVaccines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadAssignedReports = async () => {
      const isInitialLoad = !hasFetchedOnce;

      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setIsFetching(true);
        }
        setError(null);

        const response = await reportService.getAssignedReportsForReviewer({
          pageNumber: 1,
          pageSize: 10,
          severity: severityFilter === 'all' ? undefined : severityFilter,
          vaccineName: vaccineFilter === 'all' ? undefined : vaccineFilter,
          sortBy: sortByFilter,
          order: orderFilter,
        });

        console.log('API Response:', response);
        setReports(response?.items || []);
      } catch (err) {
        console.error('Error loading assigned reports:', err);
        setError('Error al cargar los reportes asignados');
        setReports([]);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
          setHasFetchedOnce(true);
        } else {
          setIsFetching(false);
        }
      }
    };

    if (user && user.role === 'MedicalReviewer') {
      loadAssignedReports();
    }
  }, [user, severityFilter, vaccineFilter, sortByFilter, orderFilter]);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const activeVaccines = await catalogService.getActiveVaccines();
        setVaccines(activeVaccines);
      } catch (err) {
        console.error('Error loading vaccines:', err);
      }
    };

    fetchVaccines();
  }, []);

  if (!user || user.role !== 'MedicalReviewer') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos pueden acceder a este panel.</p>
      </div>
    );
  }

  if (loading && !hasFetchedOnce) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando reportes asignados...</p>
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const getStatusFromReport = (report: AssignedReport): 'pending' | 'in-review' | 'completed' => {
    if (!report) {
      return 'pending';
    }

    // Lógica para determinar el status basado en los datos del reporte (placeholder)
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
${report.vaccinations && Array.isArray(report.vaccinations) ? report.vaccinations.map((v, idx) => `
Vacuna ${idx + 1}:
- Nombre: ${v.vaccineName}
- Lote: ${v.lotNumber}
- Sitio: ${v.administrationSite}
- Dosis: ${v.doseNumber}
- Fecha: ${new Date(v.administrationDate).toLocaleDateString('es-ES')}
- Centro: ${v.vaccinationCenterName}
`).join('\n') : 'No hay vacunas registradas'}

EVENTOS ADVERSOS
================
${report.adverseEvents && Array.isArray(report.adverseEvents) ? report.adverseEvents.map((event, idx) => `
Evento ${idx + 1}:
- Fecha de Inicio: ${new Date(event.startDate).toLocaleDateString('es-ES')}
- Estado Actual: ${event.currentStatus}
- Visitó Doctor: ${event.visitedDoctor ? 'Sí' : 'No'}
- Fue a Emergencias: ${event.wentToEmergencyRoom ? 'Sí' : 'No'}
- Discapacidad Permanente: ${event.permanentDisability ? 'Sí' : 'No'}
- Amenaza Vital: ${event.isLifeThreatening ? 'Sí' : 'No'}
- Resultó en Muerte: ${event.resultedInDeath ? 'Sí' : 'No'}
- Fecha de Muerte: ${event.deathDate || 'N/A'}
- Síntomas: ${event.symptoms && Array.isArray(event.symptoms) ? event.symptoms.map(s => s.name).join(', ') : 'N/A'}
`).join('\n') : 'No hay eventos adversos'}
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de revisión</CardTitle>
          <CardDescription>Filtra los reportes por vacuna, gravedad, orden y dirección de ordenamiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vacuna</label>
              <Select value={vaccineFilter} onValueChange={setVaccineFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las vacunas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las vacunas</SelectItem>
                  {vaccines.map((vaccine) => (
                    <SelectItem key={vaccine.id} value={vaccine.name}>{vaccine.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gravedad</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="serious">Grave</SelectItem>
                  <SelectItem value="nonserious">Leve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <Select value={sortByFilter} onValueChange={setSortByFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fecha de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reportDate">Fecha de reporte</SelectItem>
                  <SelectItem value="vaccinatedSubject.fullName">Nombre de Sujeto Vacunado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
              <Select value={orderFilter} onValueChange={(value) => setOrderFilter(value as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Descendente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descendente</SelectItem>
                  <SelectItem value="asc">Ascendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isFetching ? (
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualizando resultados...
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aplica los filtros para refinar los reportes asignados.</p>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setSeverityFilter('all');
                setVaccineFilter('all');
                setSortByFilter('reportDate');
                setOrderFilter('desc');
              }}
              disabled={
                severityFilter === 'all' &&
                vaccineFilter === 'all' &&
                sortByFilter === 'reportDate' &&
                orderFilter === 'desc'
              }
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

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
            const vaccineNames = report.vaccinations && Array.isArray(report.vaccinations) ? report.vaccinations.map(v => v.vaccineName).join(', ') : 'N/A';

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
                          <span>Vacuna(s): <strong>{vaccineNames}</strong></span>
                          <span>Fecha Reporte: <strong>{new Date(report.reportDate).toLocaleDateString()}</strong></span>
                          <span>Fecha Asignación: <strong>{new Date(report.assignedDate).toLocaleDateString()}</strong></span>
                          <span>Reportante: <strong>{report.reporter.fullName}</strong></span>
                          <span className={`font-semibold ${getSeverityColor(severity)}`}>
                            Gravedad: {getSeverityLabel(severity)}
                          </span>
                        </span>
                        {report.adverseEvents.length > 0 && (
                          <span className="mt-2 text-sm block">
                            <span>Síntomas: <strong>
                              {report.adverseEvents
                                .flatMap((event) => {
                                  if (event.symptom) return [event.symptom.name];
                                  if (event.symptoms && Array.isArray(event.symptoms)) {
                                    return event.symptoms.map(s => s.name);
                                  }
                                  return [];
                                })
                                .join(', ') || 'N/A'}
                            </strong></span>
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

export default AssignedReportsPageComponent;
