import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, Heart, ChevronDown, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { reportService, type AssignedReport, type DuplicateReportItem, type DuplicateDetailResponse } from "@/app/services/report.service";
import { doctorService, type MedicalReviewer } from "@/app/services/doctor.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/components/ui/command";
import { catalogService } from "@/app/services/catalog.service";
import { DuplicateDetailDialog } from "@/app/components/ui/duplicate-detail-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/ui/select";
import { translateSeverity, translatePatientStatus, translateReportStatus } from "@/app/utils/translations";

interface ManageReportsPageProps {}

const PAGE_SIZE = 10;

// Función para obtener el nivel de severidad desde globalSeverityLevel del backend
const getSeverityLevel = (report: AssignedReport): 'critical' | 'warning' | 'normal' => {
  const globalSeverity = report.globalSeverityLevel?.toLowerCase();
  if (globalSeverity === 'serious') return 'critical';
  if (globalSeverity === 'nonserious') return 'warning';
  return 'normal';
};

export default function ManageReportsPage(_: ManageReportsPageProps) {
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());
  const [duplicateReports, setDuplicateReports] = useState<DuplicateReportItem[]>([]);
  const [duplicatePageNumber, setDuplicatePageNumber] = useState(1);
  const [duplicateTotalCount, setDuplicateTotalCount] = useState(0);
  const [isLoadingDuplicates, setIsLoadingDuplicates] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [showDuplicateScreen, setShowDuplicateScreen] = useState(false);
  const [resolvingDuplicateId, setResolvingDuplicateId] = useState<string | null>(null);

  // Assignment state
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number | null>(null);
  const [medicalReviewers, setMedicalReviewers] = useState<MedicalReviewer[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);

  // Duplicate detail dialog state
  const [showDuplicateDetailDialog, setShowDuplicateDetailDialog] = useState(false);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);
  const [duplicateDetailData, setDuplicateDetailData] = useState<DuplicateDetailResponse | null>(null);
  const [isLoadingDuplicateDetail, setIsLoadingDuplicateDetail] = useState(false);
  
  
const [severityFilter, setSeverityFilter] = useState<string>("all");
const [statusFilter, setStatusFilter] = useState<string>("all");
const [vaccineFilter, setVaccineFilter] = useState<string>("all");
const [vaccinationCenterIdFilter, setVaccinationCenterIdFilter] = useState<string>("");

const [fromFilter, setFromFilter] = useState<string>("");
const [toFilter, setToFilter] = useState<string>("");

const [sortByFilter, setSortByFilter] = useState<string>("reportDate");
const [orderFilter, setOrderFilter] = useState<"asc" | "desc">("desc");


  const [vaccines, setVaccines] = useState<any[]>([]);


  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reportService.getAssignedReports({
        pageNumber,
        pageSize: PAGE_SIZE,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        reportStatus: statusFilter === 'all' ? undefined : statusFilter,
        vaccineName: vaccineFilter === 'all' ? undefined : vaccineFilter,
        vaccinationCenterId: vaccinationCenterIdFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
        sortBy: sortByFilter,
        order: orderFilter,
      });
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

  // Cargar reportes cuando cambia la página
  useEffect(() => {
    loadReports();
  }, [pageNumber,
    severityFilter,
    statusFilter,
    vaccineFilter,
    vaccinationCenterIdFilter,
    fromFilter,
    toFilter,
    sortByFilter,
    orderFilter]);

  const loadDuplicateReports = async () => {
    try {
      setIsLoadingDuplicates(true);
      setDuplicateError(null);
      const response = await reportService.getPendingDuplicateReports({
        pageNumber: duplicatePageNumber,
        pageSize: PAGE_SIZE,
      });
      setDuplicateReports(response.items ?? []);
      setDuplicateTotalCount(response.totalCount ?? 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar duplicados pendientes';
      setDuplicateError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingDuplicates(false);
    }
  };

  const handleDuplicateResolution = async (duplicateId: string, isDuplicate: boolean) => {
    setResolvingDuplicateId(duplicateId);
    try {
      const verdict = isDuplicate ? 'ConfirmedDuplicate' : 'SeparateAsNew';
      await reportService.resolveDuplicate(duplicateId, verdict);
      toast.success(isDuplicate ? 'Marcado como duplicado' : 'Marcado como no duplicado');
      setDuplicateReports((current) => current.filter((item) => item.id !== duplicateId));
      setDuplicateTotalCount((current) => Math.max(0, current - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'No se pudo resolver el duplicado';
      console.error('Error resolving duplicate:', err);
      toast.error(errorMessage);
    } finally {
      setResolvingDuplicateId(null);
    }
  };

  const handleViewDuplicateDetails = async (duplicateId: string) => {
    setSelectedDuplicateId(duplicateId);
    setShowDuplicateDetailDialog(true);
    setIsLoadingDuplicateDetail(true);
    setDuplicateDetailData(null);

    try {
      const data = await reportService.getDuplicateDetails(duplicateId);
      setDuplicateDetailData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar detalles del duplicado';
      console.error('Error loading duplicate details:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoadingDuplicateDetail(false);
    }
  };

  const handleDuplicateDetailResolved = (duplicateId: string, verdict: string) => {
    setShowDuplicateDetailDialog(false);
    setSelectedDuplicateId(null);
    setDuplicateDetailData(null);
    // Remove from list and refresh
    handleDuplicateResolution(duplicateId, verdict === 'ConfirmedDuplicate');
  };

  useEffect(() => {
    if (!showDuplicateScreen) return;
    loadDuplicateReports();
  }, [duplicatePageNumber, showDuplicateScreen]);

  // Recargar reportes cuando se regresa de la pantalla de duplicados
  useEffect(() => {
    if (showDuplicateScreen) return;
    loadReports();
  }, [showDuplicateScreen]);

  const toggleDuplicateScreen = () => {
    setShowDuplicateScreen((current) => {
      const next = !current;
      if (!current) {
        setDuplicatePageNumber(1);
      }
      return next;
    });
  };

  useEffect(() => {
  const fetchVaccines = async () => {
    try {
      const data = await catalogService.getActiveVaccines();
      setVaccines(data);
    } catch (error) {
      console.error("Error loading vacunas:", error);
      toast.error("Error al cargar vacunas");
    }
  };

  fetchVaccines();
}, []);


  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getReportCardColor = (report: AssignedReport): string => {
    const severity = getSeverityLevel(report);
    if (severity === 'critical') {
      return 'border-l-4 border-l-red-500 bg-red-50';
    }
    if (severity === 'warning') {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50';
    }
    return 'border border-gray-200 bg-white';
  };

  const getStatusBadgeStyle = (_status?: string) => {
    return { bg: '#F3F4F6', text: '#374151' };
  };

  const getStatusCriticalityLabel = (_status?: string): { label: string; className: string } | null => {
    return null;
  };

  const getStatusFilterMessage = () => {
    switch (statusFilter) {
      case 'Submitted':
        return 'Reportes enviados pendientes de asignación o revisión.';
      case 'Reopened':
        return 'Reportes reabiertos: reportados nuevamente y con asignación vencida.';
      case 'UnderReview':
        return 'Reportes en revisión: actualmente en proceso de evaluación médica.';
      case 'Approved':
        return 'Reportes aprobados: ya han pasado la revisión y están cerrados.';
      case 'Rejected':
        return 'Reportes rechazados: evaluados y considerados no procedentes.';
      case 'Closed':
        return 'Reportes cerrados: su ciclo se ha completado y no requieren más acciones.';
      default:
        return 'Todos los reportes asignados a su municipio según los filtros seleccionados.';
    }
  };

  const isReportAssignable = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    return normalizedStatus === 'submitted' || normalizedStatus === 'reopened' || normalizedStatus === 'underreview';
  };

  const toggleExpandReport = (index: number) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedReports(newExpanded);
  };

  const getEventSeverityColor = (severityLevel?: string) => {
    if (!severityLevel) return 'bg-gray-50 border-l-4 border-l-gray-300';
    const level = severityLevel.toLowerCase();
    if (level === 'serious') return 'bg-red-50 border-l-4 border-l-red-400';
    if (level === 'nonserious') return 'bg-amber-50 border-l-4 border-l-amber-400';
    return 'bg-gray-50 border-l-4 border-l-gray-300';
  };

  const getEventSeverityBadgeColor = (severityLevel?: string) => {
    if (!severityLevel) return 'bg-gray-200 text-gray-800';
    const level = severityLevel.toLowerCase();
    if (level === 'serious') return 'bg-red-200 text-red-800';
    if (level === 'nonserious') return 'bg-amber-200 text-amber-800';
    return 'bg-gray-200 text-gray-800';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const statusLower = status.toLowerCase();
    if (statusLower === 'recovering') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'recovered') return 'bg-green-100 text-green-800';
    if (statusLower === 'fatal') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
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

  const handleAssignReport = async (reportIndex: number) => {
    setSelectedReportIndex(reportIndex);
    setSelectedReviewerId(null);
    setShowAssignDialog(true);
    setOpen(false); // Reset popover state

    // Load medical reviewers from current user's municipality
    try {
      setIsLoadingReviewers(true);
      const response = await doctorService.getAllMedicalReviewer();
      setMedicalReviewers(response.items || []);
    } catch (error) {
      console.error("Error loading medical reviewers:", error);
      toast.error("Error al cargar médicos revisores");
    } finally {
      setIsLoadingReviewers(false);
    }
  };

  const handleConfirmAssignment = async () => {
   if (selectedReportIndex === null || !selectedReviewerId) {
      toast.error("Por favor selecciona un médico revisor");
      return;
    }

    const report = reports[selectedReportIndex];
    if (!report) return;

    console.log("Report data:", report);
    console.log("Report ID:", report.id);

    // Find the selected reviewer to get their details
    const selectedReviewer = medicalReviewers.find(r => r.id === selectedReviewerId);
    if (!selectedReviewer) {
      toast.error("Médico revisor no encontrado");
      return;
    }

    setIsAssigning(true);
    try {
      const easternNow = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const assignment = {
        medicalReviewerId: selectedReviewerId,
        aefiReportId: report.id,
        assignedAt: easternNow,
      };

      console.log("Assignment payload:", assignment);

      const isReassignment = report.status?.toLowerCase() === 'underreview';
      if (isReassignment) {
        await reportService.reassignMedicalReviewAssignment(assignment);
        toast.success("Reporte reasignado exitosamente");
      } else {
        await reportService.createMedicalReviewAssignment(assignment);
        toast.success("Reporte asignado exitosamente");
      }

      loadReports(); // Refresh the reports list
      setShowAssignDialog(false);
      setSelectedReportIndex(null);
      setSelectedReviewerId(null);
    } catch (error: any) {
      console.error("Assignment error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Error al asignar reporte");
    } finally {
      setIsAssigning(false);
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
          <p className="text-gray-600 mb-3">
            Total: {totalCount} | Página {pageNumber} de {totalPages}
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">Reportes de alertas asignados a su municipio.</p>
                <p className="mt-1">
                  Para asignarlo o reasignarlo a un médico, seleccione el reporte y use el botón <span className="font-semibold">Asignar</span> o <span className="font-semibold">Reasignar</span>.
                </p>
              </div>
              <Button
                variant={showDuplicateScreen ? 'outline' : 'secondary'}
                size="sm"
                onClick={toggleDuplicateScreen}
              >
                {showDuplicateScreen ? 'Volver a reportes' : 'Ver duplicados'}
              </Button>
            </div>
          </div>
        </div>

        {showDuplicateScreen && (
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Revisión de duplicados</p>
                  <p className="text-sm text-slate-500 mt-1">Pantalla separada para rectificar reportes duplicados sin afectar los filtros ni la lista principal.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDuplicatePageNumber((page) => Math.max(1, page - 1))}
                    disabled={duplicatePageNumber <= 1 || isLoadingDuplicates}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDuplicatePageNumber((page) => page + 1)}
                    disabled={duplicateReports.length < PAGE_SIZE || isLoadingDuplicates}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>

              {isLoadingDuplicates ? (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50 text-blue-800 text-sm">
                  Cargando duplicados pendientes...
                </div>
              ) : duplicateError ? (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 text-red-800 text-sm">
                  {duplicateError}
                </div>
              ) : duplicateReports.length === 0 ? (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 text-slate-700 text-sm">
                  No se encontraron duplicados pendientes para revisión.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {duplicateReports.map((duplicate) => (
                    <Card key={duplicate.id} className="border-0 shadow-lg ring-1 ring-slate-200">
                      <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{duplicate.subjectName}</p>
                            <p className="text-xs text-slate-500">Nombre común a ambos reportes</p>
                          </div>
                          <div className="text-xs text-slate-500">
                            Página {duplicatePageNumber} · {duplicateTotalCount} total
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Reporte Original</p>
                            <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">ID:</span> {duplicate.aefiReportOriginalId}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Fecha:</span> {new Date(duplicate.originalReportDate).toLocaleString('es-ES')}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Estado:</span> {translateReportStatus(duplicate.originalReportStatus)}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Revisor:</span> {duplicate.medicalReviewerName ?? 'No asignado'}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Reporte Copia</p>
                            <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">ID:</span> {duplicate.aefiReportCopyId}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Fecha:</span> {new Date(duplicate.copyReportDate).toLocaleString('es-ES')}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Estado posible:</span> {translateReportStatus(duplicate.originalReportStatus)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleViewDuplicateDetails(duplicate.id)}>
                            Ver Comparación
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateResolution(duplicate.id, true)}
                            disabled={resolvingDuplicateId === duplicate.id}
                          >
                            {resolvingDuplicateId === duplicate.id ? 'Procesando...' : 'Es Duplicado'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateResolution(duplicate.id, false)}
                            disabled={resolvingDuplicateId === duplicate.id}
                          >
                            {resolvingDuplicateId === duplicate.id ? 'Procesando...' : 'No es Duplicado'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!showDuplicateScreen && (
          <div>
            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="p-4">
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="mb-5">
                  <p className="text-lg font-semibold text-slate-900">Filtros</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Use estos filtros para ver reportes por gravedad, vacuna o estado.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Gravedad
                    </label>
                    <Select
                      value={severityFilter}
                      onValueChange={(value) => {
                        setPageNumber(1);
                        setSeverityFilter(value);
                      }}
                    >
                      <SelectTrigger id="severity-filter" className="w-full">
                        <SelectValue placeholder="Todas las gravedades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las gravedades</SelectItem>
                        <SelectItem value="serious">Serio</SelectItem>
                        <SelectItem value="nonserious">No serio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="vaccine-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Vacuna
                    </label>
                    <Select
                      value={vaccineFilter}
                      onValueChange={(value) => {
                        setPageNumber(1);
                        setVaccineFilter(value);
                      }}
                    >
                      <SelectTrigger id="vaccine-filter" className="w-full">
                        <SelectValue placeholder="Todas las vacunas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las vacunas</SelectItem>
                        {vaccines.map((vaccine) => (
                          <SelectItem key={vaccine.id} value={vaccine.name}>
                            {vaccine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del reporte
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setPageNumber(1);
                        setStatusFilter(value);
                      }}
                    >
                      <SelectTrigger id="status-filter" className="w-full">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Submitted">Enviado</SelectItem>
                        <SelectItem value="Reopened">Reabierto</SelectItem>
                        <SelectItem value="UnderReview">En revisión</SelectItem>
                        <SelectItem value="Approved">Aprobado</SelectItem>
                        <SelectItem value="Rejected">Rechazado</SelectItem>
                        <SelectItem value="Closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div>
                    <label htmlFor="center-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Centro de vacunación
                    </label>
                    <Input
                      id="center-filter"
                      type="text"
                      placeholder="Buscar centro..."
                      value={vaccinationCenterIdFilter}
                      onChange={(e) => {
                        setPageNumber(1);
                        setVaccinationCenterIdFilter(e.target.value);
                      }}
                    />
                  </div> */}

                  {/* <div>
                    <label htmlFor="from-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Desde
                    </label>
                    <Input
                      id="from-filter"
                      type="date"
                      value={fromFilter}
                      onChange={(e) => {
                        setPageNumber(1);
                        setFromFilter(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="to-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Hasta
                    </label>
                    <Input
                      id="to-filter"
                      type="date"
                      value={toFilter}
                      onChange={(e) => {
                        setPageNumber(1);
                        setToFilter(e.target.value);
                      }}
                    />
                  </div> */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sort-by-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Ordenar por
                      </label>
                      <Select
                        value={sortByFilter}
                        onValueChange={(value) => {
                          setPageNumber(1);
                          setSortByFilter(value);
                        }}
                      >
                        <SelectTrigger id="sort-by-filter" className="w-full">
                          <SelectValue placeholder="Fecha de reporte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reportDate">Fecha de reporte</SelectItem>
                          <SelectItem value="vaccinatedSubject.fullName">Nombre sujeto vacunado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="order-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <Select
                        value={orderFilter}
                        onValueChange={(value: any) => {
                          setPageNumber(1);
                          setOrderFilter(value);
                        }}
                      >
                        <SelectTrigger id="order-filter" className="w-full">
                          <SelectValue placeholder="Descendente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descendente</SelectItem>
                          <SelectItem value="asc">Ascendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mt-4">
                  <p className="font-medium text-slate-900">Mensaje de estado</p>
                  <p className="mt-1">{getStatusFilterMessage()}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Página {pageNumber} de {totalPages} · {totalCount} reportes totales
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPageNumber(1);
                      setSeverityFilter("all");
                      setStatusFilter("all");
                      setVaccineFilter("all");
                      setVaccinationCenterIdFilter("");
                      setFromFilter("");
                      setToFilter("");
                      setSortByFilter("reportDate");
                      setOrderFilter("desc");
                    }}
                    disabled={
                      severityFilter === "all" && statusFilter === "all" && vaccineFilter === "all" && !vaccinationCenterIdFilter && !fromFilter && !toFilter && sortByFilter === "reportDate" && orderFilter === "desc"
                    }
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

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
              <div>
                <div className="space-y-2 mb-8">
                  {reports.map((report, index) => {
                    const severity = getSeverityLevel(report);
                    const isExpanded = expandedReports.has(index);

                    return (
                      <Card key={index} className={`border-0 shadow-md hover:shadow-lg transition-all ${getReportCardColor(report)}`}>
                        <CardContent className="p-4 relative">
                          {getStatusCriticalityLabel(report.status) && (
                            <div className={`absolute top-4 right-4 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${getStatusCriticalityLabel(report.status)?.className}`}>
                              {getStatusCriticalityLabel(report.status)?.label}
                            </div>
                          )}
                          {/* Compact View */}
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpandReport(index)}>
                              <div className="flex-shrink-0">
                                {getSeverityIcon(severity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {report.vaccinatedSubject.fullName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(report.reportDate).toLocaleDateString('es-ES')} · {report.vaccinations[0]?.vaccineName || 'Sin vacuna'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Notificación: {report.notificationNumber ?? 'Sin número'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Último médico: {report.lastDoctorName ?? '-'}
                                </p>
                              </div>
                              <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                style={{
                                  backgroundColor: getStatusBadgeStyle(report.status).bg,
                                  color: getStatusBadgeStyle(report.status).text,
                                }}>
                                {report.status ? translateReportStatus(report.status) : 'Sin estado'}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              {isReportAssignable(report.status) && (
                                <Button
                                  onClick={() => handleAssignReport(index)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  {report.status?.toLowerCase() === 'underreview' ? 'Reasignar' : 'Asignar'}
                                </Button>
                              )}
                              <ChevronDown
                                className={`w-5 h-5 text-gray-400 cursor-pointer transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                onClick={() => toggleExpandReport(index)}
                              />
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sujeto Vacunado</p>
                                <p className="text-sm text-gray-900 font-medium">{report.vaccinatedSubject.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Último Médico Asignado</p>
                                <p className="text-sm text-gray-900 font-medium">{report.lastDoctorName ?? '-'}</p>
                              </div>
                              {report.vaccinations.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vacunas Aplicadas</p>
                                  <div className="space-y-1">
                                    {report.vaccinations.map((vaccine, idx) => (
                                      <div key={idx} className="text-sm">
                                        <p className="font-medium text-gray-900">{vaccine.vaccineName}</p>
                                        <p className="text-gray-600 text-xs">{vaccine.vaccinationCenterName}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {report.adverseEvents.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Eventos Adversos</p>
                                  <div className="space-y-2">
                                    {report.adverseEvents.map((event, idx) => (
                                      <div key={idx} className={`text-sm p-3 rounded ${getEventSeverityColor(event.severityLevel)}`}>
                                        <div className="flex gap-2 mb-2 flex-wrap items-center">
                                          {event.severityLevel && (
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventSeverityBadgeColor(event.severityLevel)}`}>
                                              {translateSeverity(event.severityLevel)}
                                            </span>
                                          )}
                                          {event.currentStatus && (
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(event.currentStatus)}`}>
                                              {translatePatientStatus(event.currentStatus)}
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-medium mb-2 text-gray-700">
                                          Inicio: {new Date(event.startDate).toLocaleDateString('es-ES')}
                                          {event.finishDate && ` • Fin: ${new Date(event.finishDate).toLocaleDateString('es-ES')}`}
                                        </p>
                                        <div className="grid grid-cols-2 gap-1 text-xs">
                                          {event.resultedInDeath && <span className="text-red-800 font-semibold">❌ Resultó en Muerte</span>}
                                          {event.isLifeThreatening && <span className="text-red-800 font-semibold">⚠️ Amenaza de Vida</span>}
                                          {event.permanentDisability && <span className="text-orange-800 font-semibold">⚠️ Discapacidad Permanente</span>}
                                          {event.wentToEmergencyRoom && <span className="text-orange-700">🏥 Hospitalizado</span>}
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
              </div>
            )}
          </div>
        )}

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-md">
   
            <DialogHeader>
              <DialogTitle>Asignar Reporte a Médico Revisor</DialogTitle>
              <DialogDescription>
                Selecciona un médico revisor del municipio para asignar este reporte.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Médico Revisor
                </label>

                {isLoadingReviewers ? (
                  <Button variant="outline" disabled className="w-full justify-start">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando médicos revisores...
                  </Button>
                ) : medicalReviewers.length === 0 ? (
                  <div className="space-y-2">
                    <Button variant="outline" disabled className="w-full justify-start">
                      No hay médicos revisores disponibles
                    </Button>
                    <p className="text-xs text-gray-500">
                      Debug: {medicalReviewers.length} médicos cargados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedReviewerId
                            ? (() => {
                              const reviewer = medicalReviewers.find(r => r.id === selectedReviewerId);
                                return reviewer
                                  ? `${reviewer.fullName}`
                                  : "Selecciona un médico revisor";
                              })()
                            : "Selecciona un médico revisor"}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar médico revisor..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron médicos revisores.</CommandEmpty>
                            <CommandGroup>
                            {medicalReviewers.map((reviewer) => (
                              <CommandItem
                                key={reviewer.id}
                                value={`${reviewer.fullName} ${reviewer.institution}`}
                                onSelect={() => {
                                  setSelectedReviewerId(reviewer.id);
                                  setOpen(false);
                                }}
                              >
                                {reviewer.fullName} - {reviewer.institution}
                              </CommandItem>
                            ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  disabled={isAssigning}
                >
                  Cancelar
                </Button>

                <Button
                  onClick={handleConfirmAssignment}
                  disabled={!selectedReviewerId || isAssigning}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Asignar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DuplicateDetailDialog
          isOpen={showDuplicateDetailDialog}
          duplicateId={selectedDuplicateId ?? ''}
          duplicateData={duplicateDetailData}
          isLoading={isLoadingDuplicateDetail}
          onClose={() => setShowDuplicateDetailDialog(false)}
          onResolved={handleDuplicateDetailResolved}
        />
      </div>
    </div>
  );
}

