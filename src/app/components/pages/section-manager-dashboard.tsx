import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { 
  BarChart3, TrendingDown, AlertTriangle, Clock, Zap, AlertCircle
} from "lucide-react";
import { 
  reportService, 
  type DoctorWorkload, 
  type BottleneckReport, 
  type UrgentEvent,
  type ReportsPeriodStats
} from "@/app/services/report.service";
import {
  DoctorWorkloadChart,
  BottleneckReportsChart,
  UrgentEventsChart,
  ReviewMetricsChart,
} from "@/app/components/ui/municipal-dashboard-charts";
import { 
  municipalDashboardService,
  type MunicipalOverview,
  type DoctorPerformance
} from "@/app/services/municipal-dashboard.service";
import { MunicipalOverviewCards } from "@/app/components/ui/municipal-overview-cards";
import { DoctorsPerformanceCharts } from "@/app/components/ui/doctors-performance-charts";
import { toast } from "sonner";

export function SectionManagerDashboard() {
  // Data States
  const [overview, setOverview] = useState<MunicipalOverview | null>(null);
  const [doctorsPerformance, setDoctorsPerformance] = useState<DoctorPerformance[]>([]);
  const [doctorWorkload, setDoctorWorkload] = useState<DoctorWorkload[]>([]);
  const [bottleneckReports, setBottleneckReports] = useState<BottleneckReport[]>([]);
  const [urgentEvents, setUrgentEvents] = useState<UrgentEvent[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | '3months'>('week');
  const [periodStats, setPeriodStats] = useState<ReportsPeriodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Overview Data on mount
  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoadingOverview(true);
        const data = await municipalDashboardService.getOverview();
        setOverview(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar overview";
        console.error("Error loading overview:", err);
        toast.error(message);
      } finally {
        setIsLoadingOverview(false);
      }
    };

    loadOverview();
  }, []);

  // Load Doctors Performance Data on mount
  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setIsLoadingPerformance(true);
        const data = await municipalDashboardService.getDoctorsPerformance();
        setDoctorsPerformance(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar desempeño de médicos";
        console.error("Error loading doctors performance:", err);
        toast.error(message);
      } finally {
        setIsLoadingPerformance(false);
      }
    };

    loadPerformance();
  }, []);

  // Load Dashboard Data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [doctors, bottleneck, urgent, period] = await Promise.all([
          reportService.getDoctorWorkload(),
          reportService.getBottleneckReports(),
          reportService.getUrgentEvents(),
          reportService.getReportsPeriodStats(selectedPeriod),
        ]);

        setDoctorWorkload(doctors);
        setBottleneckReports(bottleneck);
        setUrgentEvents(urgent);
        setPeriodStats(period);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar dashboard";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedPeriod]);

  // Calculate KPIs
  const saturatedDoctors = doctorWorkload.filter(d => d.isSaturated).length;
  const criticalBottlenecks = bottleneckReports.filter(r => r.severity === 'critical').length;
  const urgentCases = urgentEvents.length;
  const pendingPercentage = periodStats 
    ? ((periodStats.pendingReports / periodStats.totalReports) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Dashboard Municipal de Reportes
          </h1>
          <p className="text-gray-600">
            Gestión operativa de farmacovigilancia - Análisis local de tu municipio
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Municipal Overview - Primera Vista */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
              Resumen General
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Estado actual de los reportes en tu municipio
            </p>
          </div>
          <MunicipalOverviewCards data={overview} isLoading={isLoadingOverview} />
        </div>

        {/* Doctors Performance Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
              Desempeño de Médicos
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Análisis comparativo del desempeño de cada médico: reportes completados, carga de trabajo, tasa de completación y velocidad de revisión
            </p>
          </div>
          <DoctorsPerformanceCharts data={doctorsPerformance} isLoading={isLoadingPerformance} />
        </div>

        {/* Detailed Analytics Section */}
        <Card className="border-0 shadow-lg mb-8 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900">Análisis Detallado</h3>
            <p className="text-sm text-blue-800 mt-2">
              Accede a continuación para ver la carga de trabajo, cuellos de botella y eventos urgentes
            </p>
          </CardContent>
        </Card>

        {/* KPI Cards - Main Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Reports This Period */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium uppercase">Reportes Entrantes</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#0A4B8F" }}>
                    {periodStats?.totalReports ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPeriod === 'today' 
                      ? 'Hoy'
                      : selectedPeriod === 'week'
                      ? 'Últimos 7 días'
                      : selectedPeriod === 'month'
                      ? 'Este mes'
                      : 'Últimos 3 meses'}
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Saturated Doctors */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium uppercase">Médicos Sobrecargados</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: saturatedDoctors > 0 ? "#EF4444" : "#10B981" }}>
                    {saturatedDoctors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    De {doctorWorkload.length} médicos
                  </p>
                </div>
                <AlertCircle className="w-10 h-10" style={{ color: saturatedDoctors > 0 ? "#FEE2E2" : "#D1FAE5" }} />
              </div>
            </CardContent>
          </Card>

          {/* Pending Percentage */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium uppercase">Aún Pendientes</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#F59E0B" }}>
                    {pendingPercentage}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {periodStats?.pendingReports ?? 0} de {periodStats?.totalReports ?? 0}
                  </p>
                </div>
                <TrendingDown className="w-10 h-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          {/* Urgent Events */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium uppercase">Casos Urgentes</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: urgentCases > 0 ? "#EF4444" : "#10B981" }}>
                    {urgentCases}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requieren atención inmediata
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10" style={{ color: urgentCases > 0 ? "#FECACA" : "#D1FAE5" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Selecciona Período de Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[
                { value: 'today' as const, label: 'Hoy' },
                { value: 'week' as const, label: 'Últimos 7 días' },
                { value: 'month' as const, label: 'Este mes' },
                { value: '3months' as const, label: 'Últimos 3 meses' },
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="workload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="workload">Carga</TabsTrigger>
            <TabsTrigger value="bottlenecks">Cuellos de Botella</TabsTrigger>
            <TabsTrigger value="urgent">Urgentes</TabsTrigger>
            <TabsTrigger value="metrics">Velocidad</TabsTrigger>
          </TabsList>

          {/* Workload Tab */}
          <TabsContent value="workload" className="space-y-6">
            <DoctorWorkloadChart data={doctorWorkload} isLoading={isLoading} />

            <Card className="border-0 shadow-lg bg-blue-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Qué médicos tienen sobrecarga?</h3>
                    <p className="text-sm text-blue-800">
                      {saturatedDoctors > 0
                        ? `${saturatedDoctors} médico(s) tiene(n) más del 80% de capacidad. Considera redistribuir reportes.`
                        : "Carga equilibrada en todos los médicos"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bottlenecks Tab */}
          <TabsContent value="bottlenecks" className="space-y-6">
            <BottleneckReportsChart data={bottleneckReports} isLoading={isLoading} />

            <Card className="border-0 shadow-lg bg-orange-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">Donde están los cuellos de botella?</h3>
                    <p className="text-sm text-orange-800">
                      {bottleneckReports.length > 0
                        ? `${bottleneckReports.length} reporte(s) atrasado(s). ${criticalBottlenecks} son críticos.`
                        : "Sin reportes atrasados"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Urgent Tab */}
          <TabsContent value="urgent" className="space-y-6">
            <UrgentEventsChart data={urgentEvents} isLoading={isLoading} />

            <Card className="border-0 shadow-lg bg-red-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Qué eventos requieren atención urgente?</h3>
                    <p className="text-sm text-red-800">
                      {urgentEvents.length > 0
                        ? `${urgentEvents.length} evento(s) crítico(s) detectado(s). Requieren revisión inmediata.`
                        : "Sin eventos críticos reportados"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {periodStats && <ReviewMetricsChart data={periodStats as any} isLoading={isLoading} />}

            <Card className="border-0 shadow-lg bg-purple-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Qué tan rápido se revisan los casos?</h3>
                    <p className="text-sm text-purple-800">
                      Tiempo promedio de revisión: {periodStats?.avgProcessingTime.toFixed(1) ?? 0} horas.
                      Objetivo: mantener menor a 24 horas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-900 text-lg">Resumen Ejecutivo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-800">Preguntas Clave</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Cuántos reportes entraron en este período?</li>
                    <li>Qué médicos tienen sobrecarga?</li>
                    <li>Qué reportes están atrasados?</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-800">Más Preguntas</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Donde se generan cuellos de botella?</li>
                    <li>Qué tan rápido se revisan los casos?</li>
                    <li>Qué eventos requieren atención urgente?</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Acción Recomendada:</strong> Revisa la sección Cuellos de Botella para identificar reportes
                  pendientes y la sección Carga para redistribuir trabajo entre médicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
