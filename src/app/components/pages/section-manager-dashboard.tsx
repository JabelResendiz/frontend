import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle, Calendar, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  municipalDashboardService,
  type MunicipalOverview,
  type DoctorPerformance,
  type MunicipalCharacterization,
  type MunicipalCharacterizationPeriod,
} from "@/app/services/municipal-dashboard.service";
import { MunicipalOverviewCards } from "@/app/components/ui/municipal-overview-cards";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";

export function SectionManagerDashboard() {
  // Data States
  const [overview, setOverview] = useState<MunicipalOverview | null>(null);
  const [doctorsPerformance, setDoctorsPerformance] = useState<DoctorPerformance[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characterization, setCharacterization] = useState<MunicipalCharacterization | null>(null);
  const [characterizationPeriod, setCharacterizationPeriod] = useState<MunicipalCharacterizationPeriod>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoadingCharacterization, setIsLoadingCharacterization] = useState(false);
  const [characterizationError, setCharacterizationError] = useState<string | null>(null);
  const [workloadFilterType, setWorkloadFilterType] = useState<'completed' | 'pending' | 'expired' | 'cancelled'>('pending');
  const today = new Date().toISOString().split('T')[0];

  const periodOptions: Array<{ value: MunicipalCharacterizationPeriod; label: string; color: string }> = [
    { value: '7d', label: '7d', color: 'bg-sky-100 text-sky-700' },
    { value: '1m', label: '1 mes', color: 'bg-cyan-100 text-cyan-800' },
    { value: '3m', label: '3 meses', color: 'bg-emerald-100 text-emerald-800' },
    { value: '6m', label: '6 meses', color: 'bg-amber-100 text-amber-800' },
    { value: '1y', label: '1 año', color: 'bg-violet-100 text-violet-800' },
    { value: 'all', label: 'All', color: 'bg-slate-100 text-slate-800' },
    { value: 'custom', label: 'Personalizado', color: 'bg-blue-100 text-blue-800' },
  ];


  // Usar exclusivamente datos reales del backend: no usar mocks en producción.
  // `doctorsPerformance` debe contener la lista; si está vacía mostramos vacío en UI.
  const doctorEvaluatorDataSource = doctorsPerformance;

  // No realizamos cálculos adicionales: consumimos los campos proporcionados por el backend.
  // 1) Distribución de estado: utiliza los conteos directos y se renderiza con `stackOffset="expand"` para mostrar proporciones.
  const stateDistributionData = useMemo(
    () =>
      doctorEvaluatorDataSource.map((doctor: any) => ({
        doctorName: doctor.doctorName,
        completed: doctor.completedReports ?? 0,
        pending: doctor.pendingReports ?? 0,
        expired: doctor.expiredReports ?? 0,
        cancelled: doctor.cancelledReports ?? 0,
      })),
    [doctorEvaluatorDataSource],
  );

  // 2) Carga activa de trabajo: muestra todos los tipos de reportes, filtrable por tipo.
  const activeWorkloadData = useMemo(
    () =>
      doctorEvaluatorDataSource.map((doctor: any) => ({
        doctorName: doctor.doctorName,
        completed: doctor.completedReports ?? 0,
        pending: doctor.pendingReports ?? 0,
        expired: doctor.expiredReports ?? 0,
        cancelled: doctor.cancelledReports ?? 0,
      })),
    [doctorEvaluatorDataSource],
  );

  // Datos dinámicos según el filtro seleccionado
  const workloadDataByType = useMemo(
    () => activeWorkloadData.map((doctor) => ({
      doctorName: doctor.doctorName,
      value: doctor[workloadFilterType] ?? 0,
    })),
    [activeWorkloadData, workloadFilterType],
  );

  const workloadAxisMax = useMemo(() => {
    const values = workloadDataByType.map((item) => item.value);
    if (values.length === 0) return 10;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const suggestedMax = Math.max(...values, mean + stdDev * 2);
    return Math.max(10, Math.ceil(suggestedMax / 5) * 5);
  }, [workloadDataByType]);

  // 3) Tiempos de revisión: valores directos en horas. El eje X se limitará a 0-48 para mostrar escala en 48h.
  const reviewTimeData = useMemo(
    () => doctorEvaluatorDataSource.map((doctor: any) => ({ doctorName: doctor.doctorName, averageReviewTimeHours: doctor.averageReviewTimeHours ?? 0 })),
    [doctorEvaluatorDataSource],
  );

  // 4) Eliminada la tasa de expiración por petición del usuario (no se crea `expirationRateData`).

  // 5) Casos graves atendidos: provisto por backend en `numeroDeCasosGravesCompletados`.
  const criticalReportsData = useMemo(
    () => doctorEvaluatorDataSource.map((doctor: any) => ({ doctorName: doctor.doctorName, criticalReports: doctor.numeroDeCasosGravesCompletados ?? 0 })),
    [doctorEvaluatorDataSource],
  );

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
        setError(message);
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
        setError(message);
        toast.error(message);
      } finally {
        setIsLoadingPerformance(false);
      }
    };

    loadPerformance();
  }, []);

  const isCustomPeriod = characterizationPeriod === 'custom';
  const isDateRangeValid = !isCustomPeriod || (fromDate !== '' && toDate !== '' && fromDate <= toDate);

  const loadCharacterization = async () => {
    if (isCustomPeriod && !fromDate) {
      setCharacterizationError('Selecciona la fecha Desde para el periodo personalizado.');
      return;
    }

    if (isCustomPeriod && !toDate) {
      setCharacterizationError('Selecciona la fecha Hasta para el periodo personalizado.');
      return;
    }

    if (isCustomPeriod && fromDate && fromDate > today) {
      setCharacterizationError('La fecha "Desde" no puede ser posterior a hoy.');
      return;
    }

    if (isCustomPeriod && toDate && toDate > today) {
      setCharacterizationError('La fecha "Hasta" no puede ser posterior a hoy.');
      return;
    }

    if (!isDateRangeValid) {
      setCharacterizationError('La fecha "Desde" debe ser anterior o igual a la fecha "Hasta".');
      return;
    }

    try {
      setIsLoadingCharacterization(true);
      setCharacterizationError(null);
      const data = await municipalDashboardService.getCharacterization(
        characterizationPeriod,
        fromDate || undefined,
        toDate || undefined,
      );
      setCharacterization(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar caracterización';
      console.error('Error loading characterization:', err);
      setCharacterizationError(message);
      toast.error(message);
    } finally {
      setIsLoadingCharacterization(false);
    }
  };

  useEffect(() => {
    loadCharacterization();
  }, []);

  const topFastestReviewers = useMemo(
    () => [...doctorsPerformance]
      .filter((d) => d.averageReviewTimeHours > 0)
      .sort((a, b) => a.averageReviewTimeHours - b.averageReviewTimeHours)
      .slice(0, 3),
    [doctorsPerformance],
  );

  const topCompletedDoctors = useMemo(
    () => [...doctorsPerformance]
      .sort((a, b) => b.completedReports - a.completedReports)
      .slice(0, 3),
    [doctorsPerformance],
  );

  const topCompletionRateDoctors = useMemo(
    () => [...doctorsPerformance]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3),
    [doctorsPerformance],
  );

  const topicVaccinesData = useMemo(
    () => (characterization?.topVaccines ?? []).slice().sort((a, b) => b.totalReports - a.totalReports),
    [characterization],
  );

  const topSymptomsData = useMemo(
    () => (characterization?.topSymptoms ?? []).slice().sort((a, b) => b.totalReports - a.totalReports),
    [characterization],
  );

  const reportsTimelineData = characterization?.reportsTimeline ?? [];

  const severityColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const severityTotals = [
    { label: 'Fallecimientos', value: characterization?.totalDeaths ?? 0 },
    { label: 'Consultas médicas', value: characterization?.totalVisitedDoctor ?? 0 },
    { label: 'Urgencias', value: characterization?.totalEmergencyRoom ?? 0 },
    { label: 'Discapacidades permanentes', value: characterization?.totalPermanentDisability ?? 0 },
    { label: 'Amenaza de vida', value: characterization?.totalLifeThreatening ?? 0 },
  ];
  const severityTotalSum = severityTotals.reduce((s, it) => s + it.value, 0);

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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-2 mb-6">
            <TabsTrigger value="overview">Resumen General</TabsTrigger>
            <TabsTrigger value="performance">Desempeño Médicos</TabsTrigger>
            <TabsTrigger value="characterization">Caracterización</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
                  Resumen General
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Estado actual de los reportes en tu municipio, basado en datos del endpoint de overview.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {/* <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-700">Total de Reportes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" style={{ color: "#0A4B8F" }}>
                      {overview?.totalReports ?? 0}
                    </p>
                    <p className="text-sm text-gray-500">Reporteos totales en el periodo</p>
                  </CardContent>
                </Card> */}

                {/* <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-700">Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">{overview?.pendingReports ?? 0}</p>
                    <p className="text-sm text-gray-500">Pendientes</p>
                  </CardContent>
                </Card> */}

                {/* <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-700">En Revisión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{overview?.underReviewReports ?? 0}</p>
                    <p className="text-sm text-gray-500">Actualmente en revisión</p>
                  </CardContent>
                </Card> */}

                {/* <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-700">Completados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{overview?.completedReports ?? 0}</p>
                    <p className="text-sm text-gray-500">Reportes cerrados</p>
                  </CardContent>
                </Card> */}

                {/* <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-700">Rechazados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{overview?.rejectedReports ?? 0}</p>
                    <p className="text-sm text-gray-500">Reportes rechazados</p>
                  </CardContent>
                </Card> */}
              </div>

              <MunicipalOverviewCards data={overview} isLoading={isLoadingOverview} />

              <Card className="border-0 shadow-lg bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Contexto rápido</h3>
                  <p className="text-sm text-blue-800">
                    Este panel muestra el estado de la vigilancia municipal. Si los reportes en revisión son muchos y el tiempo promedio sube,
                    entonces el equipo necesita priorizar casos urgentes y reasignar cargas de trabajo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
                  Gestión de Médicos Evaluadores
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Análisis con datos reales para comparar cumplimiento, carga de trabajo, tiempos de evaluación y casos críticos.
                </p>
              </div>

              {isLoadingPerformance && (
                <Card className="border-0 shadow-lg bg-blue-50">
                  <CardContent className="text-sm text-blue-800">
                    Cargando datos de desempeño reales...
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-0 shadow-lg bg-slate-50">
                  <CardHeader>
                    <CardTitle>Más rápidos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topFastestReviewers.length > 0 ? (
                      topFastestReviewers.map((doctor) => (
                        <p key={doctor.doctorId} className="text-sm text-slate-700">
                          {doctor.doctorName} · {doctor.averageReviewTimeHours.toFixed(1)}h
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Sin datos de velocidad.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-slate-50">
                  <CardHeader>
                    <CardTitle>Completados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topCompletedDoctors.map((doctor) => (
                      <p key={doctor.doctorId} className="text-sm text-slate-700">
                        {doctor.doctorName} · {doctor.completedReports} completados
                      </p>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-slate-50">
                  <CardHeader>
                    <CardTitle>Mejor tasa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topCompletionRateDoctors.map((doctor) => (
                      <p key={doctor.doctorId} className="text-sm text-slate-700">
                        {doctor.doctorName} · {doctor.completionRate}%
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>1. Distribución porcentual de estados por médico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={stateDistributionData} margin={{ left: 140, right: 16, top: 16, bottom: 16 }} stackOffset="expand">
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "#334155", fontSize: 13 }} />
                        <YAxis
                          type="category"
                          dataKey="doctorName"
                          width={140}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#334155", fontSize: 13 }}
                          />
                          <Tooltip formatter={(value: any) => `${Math.round(value * 100)}%`} />
                          <Legend />
                          <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completados" />
                          <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pendientes" />
                          <Bar dataKey="expired" stackId="a" fill="#EF4444" name="Expirados" />
                          <Bar dataKey="cancelled" stackId="a" fill="#64748B" name="Cancelados" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>2. Carga activa de trabajo por médico</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setWorkloadFilterType('completed')}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          workloadFilterType === 'completed'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Completados
                      </button>
                      <button
                        onClick={() => setWorkloadFilterType('pending')}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          workloadFilterType === 'pending'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        Pendientes
                      </button>
                      <button
                        onClick={() => setWorkloadFilterType('expired')}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          workloadFilterType === 'expired'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        Expirados
                      </button>
                      <button
                        onClick={() => setWorkloadFilterType('cancelled')}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          workloadFilterType === 'cancelled'
                            ? 'bg-slate-600 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Cancelados
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={workloadDataByType}
                          margin={{ left: 16, right: 24, top: 20, bottom: 80 }}
                          barCategoryGap="24%"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="category"
                            dataKey="doctorName"
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: "#334155", fontSize: 12 }}
                          />
                          <YAxis
                            type="number"
                            domain={[0, workloadAxisMax]}
                            tick={{ fill: "#334155", fontSize: 13 }}
                          />
                          <Tooltip formatter={(value: any) => {
                            const labels: Record<string, string> = {
                              'completed': 'Completados',
                              'pending': 'Pendientes',
                              'expired': 'Expirados',
                              'cancelled': 'Cancelados'
                            };
                            return [`${value}`, labels[workloadFilterType]];
                          }} />
                          <Bar
                            dataKey="value"
                            fill={workloadFilterType === 'completed' ? '#10B981' : workloadFilterType === 'pending' ? '#F59E0B' : workloadFilterType === 'expired' ? '#EF4444' : '#64748B'}
                            radius={[12, 12, 0, 0]}
                          >
                            <LabelList
                              dataKey="value"
                              position="top"
                              formatter={(value: number) => `${value}`}
                              style={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>3. Tiempo promedio de evaluación clínica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={reviewTimeData}
                        margin={{ left: 180, right: 24, top: 20, bottom: 20 }}
                        barCategoryGap="24%"
                      >
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis type="number" domain={[0, 48]} tick={{ fill: "#334155", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="doctorName"
                          width={180}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#334155", fontSize: 13 }}
                        />
                        <Tooltip formatter={(value: any) => `${Math.round(value)}h`} />
                        <Bar dataKey="averageReviewTimeHours" fill="#8B5CF6" radius={[12, 12, 12, 12]}>
                          <LabelList
                            dataKey="averageReviewTimeHours"
                            position="right"
                            formatter={(value: number) => `${Math.round(value)}h`}
                            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>



              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>4. Cantidad de reportes graves atendidos por médico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={criticalReportsData}
                        margin={{ left: 180, right: 24, top: 20, bottom: 20 }}
                        barCategoryGap="22%"
                      >
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis type="number" tick={{ fill: "#334155", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="doctorName"
                          width={180}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#334155", fontSize: 13 }}
                        />
                        <Tooltip formatter={(value: any) => [value, "Reportes graves"]} />
                        <Bar dataKey="criticalReports" fill="#F43F5E" radius={[12, 12, 12, 12]}>
                          <LabelList
                            dataKey="criticalReports"
                            position="right"
                            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="characterization" className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#0A4B8F" }}>
                    Caracterización
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Solicita el endpoint de caracterización por periodo y fechas, y revisa los resultados con filtros más visuales.
                  </p>
                </div>
                
              </div>

              <Card className="border-0 shadow-2xl ring-1 ring-slate-200">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Filtros de caracterización</CardTitle>
                    <p className="text-sm text-slate-500">Selecciona periodo, fechas y revisa el estado del filtro.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-slate-700">
                    <Filter className="w-4 h-4" />
                    Filtros activos
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Periodo</label>
                      <select
                        value={characterizationPeriod}
                        onChange={(e) => setCharacterizationPeriod(e.target.value as MunicipalCharacterizationPeriod)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      >
                        {periodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Desde</label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={fromDate}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            if (selectedDate && selectedDate > today) {
                              setCharacterizationError('La fecha Desde no puede ser posterior a hoy.');
                              return;
                            }
                            setFromDate(selectedDate);
                            setCharacterizationError(null);
                          }}
                          disabled={!isCustomPeriod}
                          max={today}
                          className={`w-full pr-10 transition ${!isCustomPeriod ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        />
                        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Hasta</label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={toDate}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            if (selectedDate && selectedDate > today) {
                              setCharacterizationError('La fecha Hasta no puede ser posterior a hoy.');
                              return;
                            }
                            setToDate(selectedDate);
                            setCharacterizationError(null);
                          }}
                          disabled={!isCustomPeriod}
                          max={today}
                          className={`w-full pr-10 transition ${!isCustomPeriod ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        />
                        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      onClick={loadCharacterization}
                      disabled={isLoadingCharacterization || !isDateRangeValid}
                    >
                      {isLoadingCharacterization ? 'Actualizando...' : 'Actualizar caracterización'}
                    </Button>
                    {!isDateRangeValid && (
                      <p className="text-sm text-red-600">
                        Si incluye fechas, la fecha "Desde" debe ser anterior o igual a la fecha "Hasta".
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      El campo desde/hasta es opcional. Si no se envía nada, se usará el periodo por defecto de <strong>all</strong>.
                    </p>
                  </div>

                  {characterizationError && (
                    <p className="mt-4 text-sm text-red-700">{characterizationError}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-2xl bg-white/95 ring-1 ring-slate-200">
              <CardHeader>
                <CardTitle>Totales por gravedad</CardTitle>
                <p className="text-sm text-slate-500">Cada tipo de gravedad retornado por el endpoint.</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {severityTotals.map((item, idx) => {
                    const percent = severityTotalSum ? Math.round((item.value / severityTotalSum) * 100) : 0;
                    return (
                      <div key={item.label} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ background: severityColors[idx % severityColors.length] }} />
                          <div>
                            <div className="text-sm text-slate-700">{item.label}</div>
                            <div className="text-xs text-slate-400">{percent}% del total</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-900">{item.value}</div>
                          <div className="w-36 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-2 rounded-full" style={{ width: `${percent}%`, background: severityColors[idx % severityColors.length] }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-0 shadow-2xl bg-white/95 ring-1 ring-slate-200">
                <CardHeader>
                  <CardTitle>Top Vacunas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topicVaccinesData}
                        margin={{ top: 20, right: 24, left: 24, bottom: 70 }}
                      >
                        <defs>
                          <linearGradient id="vaccineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="vaccineName"
                          type="category"
                          tick={{ fill: '#0F172A', fontSize: 13 }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis type="number" domain={[0, 'dataMax']} tick={{ fill: '#0F172A', fontSize: 13 }} />
                        <Tooltip wrapperStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }} />
                        <Bar dataKey="totalReports" fill="url(#vaccineGradient)" radius={[16, 16, 0, 0]} barSize={44}>
                          <LabelList dataKey="totalReports" position="top" style={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-2xl bg-white/95 ring-1 ring-slate-200">
                <CardHeader>
                  <CardTitle>Top Síntomas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topSymptomsData}
                        margin={{ top: 20, right: 24, left: 24, bottom: 70 }}
                      >
                        <defs>
                          <linearGradient id="symptomGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EC4899" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#F97316" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="symptomName"
                          type="category"
                          tick={{ fill: '#0F172A', fontSize: 13 }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis type="number" domain={[0, 'dataMax']} tick={{ fill: '#0F172A', fontSize: 13 }} />
                        <Tooltip wrapperStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }} />
                        <Bar dataKey="totalReports" fill="url(#symptomGradient)" radius={[16, 16, 0, 0]} barSize={44}>
                          <LabelList dataKey="totalReports" position="top" style={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-2xl bg-white/95 ring-1 ring-slate-200">
                <CardHeader>
                  <CardTitle>Distribución por Gravedad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={characterization?.severityDistribution ?? []}
                            dataKey="totalReports"
                            nameKey="severity"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.severity}: ${entry.totalReports}`}
                          >
                            {(characterization?.severityDistribution ?? []).map((item, index) => (
                              <Cell key={item.severity} fill={severityColors[index % severityColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value}`, 'Reportes']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3">
                        {severityTotals.map((item, idx) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-block w-3 h-3 rounded-full" style={{ background: severityColors[idx % severityColors.length] }} />
                              <span className="text-sm text-slate-700">{item.label}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-2xl bg-white/95 ring-1 ring-slate-200">
                <CardHeader>
                  <CardTitle>Línea de reportes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportsTimelineData} margin={{ top: 16, right: 32, left: 24, bottom: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fill: '#334155', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#334155', fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalReports" stroke="#0A4B8F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
