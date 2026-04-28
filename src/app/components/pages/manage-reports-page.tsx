import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, Heart, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { reportService, type AssignedReport } from "@/app/services/report.service";

interface ManageReportsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

const PAGE_SIZE = 10;

// Función para determinar si un reporte es crítico
const isCriticalReport = (report: AssignedReport): boolean => {
  return report.adverseEvents.some(event =>
    event.isLifeThreatening || event.resultedInDeath || event.permanentDisability || event.wentToEmergencyRoom
  );
};

// Función para obtener el nivel de severidad
const getSeverityLevel = (report: AssignedReport): 'critical' | 'warning' | 'normal' => {
  if (report.adverseEvents.some(event => event.resultedInDeath || event.isLifeThreatening)) return 'critical';
  if (report.adverseEvents.some(event => event.permanentDisability || event.wentToEmergencyRoom)) return 'warning';
  return 'normal';
};

export function ManageReportsPage({ onNavigate }: ManageReportsPageProps) {
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());

  // Cargar reportes cuando cambia la página
  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await reportService.getAssignedReports(pageNumber, PAGE_SIZE);
        setReports(response.items);
        setTotalCount(response.totalCount);
        setExpandedReports(new Set()); // Reset expandidos al cambiar página
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar reportes';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [pageNumber]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleExpandReport = (index: number) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedReports(newExpanded);
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'normal') => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-green-500 bg-white';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'normal') => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Heart className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Reportes Asignados
          </h1>
          <p className="text-gray-600">
            Total: {totalCount} | Página {pageNumber} de {totalPages}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        {isLoading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-600">Cargando reportes...</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="border border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No hay reportes asignados</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {reports.map((report, index) => {
                const severity = getSeverityLevel(report);
                const isExpanded = expandedReports.has(index);

                return (
                  <Card key={index} className={`border-0 shadow-md hover:shadow-lg transition-all ${getSeverityColor(severity)}`}>
                    <CardContent className="p-4">
                      {/* Compact View */}
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpandReport(index)}>
                        <div className="flex items-center gap-4 flex-1">
                          {/* Severity Icon */}
                          <div className="flex-shrink-0">
                            {getSeverityIcon(severity)}
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {report.vaccinatedSubject.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(report.reportDate).toLocaleDateString('es-ES')} · {report.vaccinations[0]?.vaccineName || 'Sin vacuna'}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: severity === 'critical' ? '#fee2e2' : severity === 'warning' ? '#fef3c7' : '#ecfdf5',
                              color: severity === 'critical' ? '#dc2626' : severity === 'warning' ? '#d97706' : '#059669',
                            }}>
                            {severity === 'critical' ? 'CRÍTICO' : severity === 'warning' ? 'ADVERTENCIA' : 'Normal'}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {/* Paciente */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Paciente</p>
                            <p className="text-sm text-gray-900 font-medium">{report.vaccinatedSubject.fullName}</p>
                          </div>

                          {/* Vacunas */}
                          {report.vaccinations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vacunas Aplicadas</p>
                              <div className="space-y-1">
                                {report.vaccinations.map((vaccine, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="font-medium text-gray-900">{vaccine.vaccineName}</p>
                                    <p className="text-gray-600 text-xs">{vaccine.vaccinationCenter}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Eventos Adversos */}
                          {report.adverseEvents.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Eventos Adversos</p>
                              <div className="space-y-2">
                                {report.adverseEvents.map((event, idx) => (
                                  <div key={idx} className={`text-sm p-2 rounded ${
                                    event.resultedInDeath || event.isLifeThreatening ? 'bg-red-100 border border-red-300' :
                                    event.permanentDisability || event.wentToEmergencyRoom ? 'bg-yellow-100 border border-yellow-300' :
                                    'bg-gray-100'
                                  }`}>
                                    <p className="font-medium mb-1">
                                      Inicio: {new Date(event.startDate).toLocaleDateString('es-ES')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                      {event.resultedInDeath && <span className="text-red-800 font-semibold">❌ Resultó en Muerte</span>}
                                      {event.isLifeThreatening && <span className="text-red-800 font-semibold">⚠️ Amenaza de Vida</span>}
                                      {event.permanentDisability && <span className="text-yellow-800 font-semibold">⚠️ Discapacidad Permanente</span>}
                                      {event.wentToEmergencyRoom && <span className="text-yellow-800">🏥 Sala de Emergencias</span>}
                                      {event.visitedDoctor && <span className="text-gray-700">👨‍⚕️ Visitó Doctor</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {report.adverseEvents.length === 0 && (
                            <div className="text-sm p-2 bg-green-100 rounded text-green-800">
                              ✓ Sin eventos adversos reportados
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {reports.length} reportes de {totalCount}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                  disabled={pageNumber === totalPages || isLoading}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

