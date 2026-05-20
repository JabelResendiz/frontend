import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { geoCentroid } from 'd3-geo';
import { api } from '@/app/services/api';
import { AlertCircle } from 'lucide-react';
import cubaGeo from '../../../../cu.json';

type ProvinceReport = {
  provinceName: string;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  closed: number;
  total: number;
  serious: number;
};

type SeverityDistributionItem = {
  severityType: string;
  count: number;
  percentage: number;
};

type CausalityDistributionItem = {
  causality: string;
  count: number;
  percentage: number;
};

type SignificanceDistributionItem = {
  significance: string;
  count: number;
  percentage: number;
};

type MonthlyTrendItem = {
  year: number;
  month: number;
  totalReports: number;
};

type PerformanceMunicipality = {
  municipalityName: string;
  activeDoctors: number;
  avgReportsPerDoctor: number;
  avgReviewTimeHours: number;
  avgAssignmentHours: number;
};

type PerformanceProvince = {
  provinceName: string;
  activeDoctors: number;
  avgReportsPerDoctor: number;
  avgReviewTimeHours: number;
  avgAssignmentHours: number;
  municipalities: PerformanceMunicipality[];
};

type AdminPerformanceData = {
  activeDoctors: number;
  avgReportsPerDoctor: number;
  avgReviewTimeHours: number;
  avgAssignmentHours: number;
  activeMedicalReviewers: PerformanceProvince[];
};

type VaccineLot = {
  lotNumber: string;
  totalReports: number;
};

type VaccineItem = {
  vaccineName: string;
  totalReports: number;
  lots: VaccineLot[];
};

type SymptomDistributionItem = {
  symptomName: string;
  count: number;
  percentage: number;
};

type AdminVaccineData = {
  vaccines: VaccineItem[];
  symptomDistribution: SymptomDistributionItem[];
};

type AdminReportData = {
  totalReports: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  closed: number;
  provinces: ProvinceReport[];
  severityDistribution: SeverityDistributionItem[];
  causalityDistribution: CausalityDistributionItem[];
  significanceDistribution: SignificanceDistributionItem[];
  monthlyTrends: MonthlyTrendItem[];
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const normalizeProvinceName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const provinceNameCorrections: Record<string, string> = {
  'la habana': 'ciudad de la habana',
  'ciego de avila': 'ciego de avila',
  'santiago de cuba': 'santiago de cuba',
  'holguin': 'holguin',
  'guantanamo': 'guantánamo',
};

const resolveProvinceKey = (value: string) => {
  const normalized = normalizeProvinceName(value);
  return provinceNameCorrections[normalized] ?? normalized;
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'performance' | 'vaccines'>('report');
  const [reportData, setReportData] = useState<AdminReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<AdminPerformanceData | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [selectedPerformanceProvinceName, setSelectedPerformanceProvinceName] = useState<string>('');
  const [vaccineData, setVaccineData] = useState<AdminVaccineData | null>(null);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);
  const [vaccinesError, setVaccinesError] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceReport | null>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const hoveredProvinceKeyRef = useRef<string | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const summaryCards = useMemo(
    () => [
      { label: 'Total de Reportes', value: reportData?.totalReports ?? 0, color: '#0A4B8F' },
      { label: 'Enviados', value: reportData?.submitted ?? 0, color: '#F59E0B' },
      { label: 'En Revisión', value: reportData?.underReview ?? 0, color: '#3B82F6' },
      { label: 'Aprobados', value: reportData?.approved ?? 0, color: '#10B981' },
      { label: 'Rechazados', value: reportData?.rejected ?? 0, color: '#EF4444' },
      { label: 'Cerrados', value: reportData?.closed ?? 0, color: '#6366F1' },
    ],
    [reportData],
  );

  const provinceMap = useMemo(() => {
    return Object.fromEntries(
      (reportData?.provinces ?? []).map((province) => [resolveProvinceKey(province.provinceName), province]),
    );
  }, [reportData]);

  const provinces = reportData?.provinces ?? [];
  const provinceCounts = provinces.length ? provinces.map((province) => province.total) : [0, 1];
  const minProvinceCount = Math.min(...provinceCounts);
  const maxProvinceCount = Math.max(...provinceCounts);

  const legendStops = [
    minProvinceCount,
    Math.round(minProvinceCount + (maxProvinceCount - minProvinceCount) * 0.33),
    Math.round(minProvinceCount + (maxProvinceCount - minProvinceCount) * 0.66),
    maxProvinceCount,
  ];

  const legendLabels = ['Bajo', 'Medio', 'Alto', 'Muy Alto'];

  const getProvinceColor = (value: number) => {
    const ratio = maxProvinceCount === minProvinceCount ? 0.5 : (value - minProvinceCount) / (maxProvinceCount - minProvinceCount);
    const hue = 200 - ratio * 110;
    return `hsl(${hue}, 80%, 65%)`;
  };

  const augmentedCubaGeo = useMemo(
    () => ({
      ...(cubaGeo as any),
      features: ((cubaGeo as any).features as Array<any>)
        .map((feature) => {
          const featureName = feature.properties?.name as string;
          const provinceData = provinceMap[resolveProvinceKey(featureName)];
          return {
            ...feature,
            properties: {
              ...feature.properties,
              provinceName: featureName,
              submitted: provinceData?.submitted ?? 0,
              underReview: provinceData?.underReview ?? 0,
              approved: provinceData?.approved ?? 0,
              rejected: provinceData?.rejected ?? 0,
              closed: provinceData?.closed ?? 0,
              serious: provinceData?.serious ?? 0,
              total: provinceData?.total ?? 0,
              value: provinceData?.total ?? 0,
            },
          };
        })
        .filter((feature) => !!feature.geometry),
    }),
    [provinceMap],
  );

  const provinceLabelPoints = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: ((augmentedCubaGeo as any).features as Array<any>)
        .map((feature) => {
          const centroid = geoCentroid(feature);
          return centroid
            ? {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: centroid,
                },
                properties: {
                  value: feature.properties?.value ?? 0,
                },
              }
            : null;
        })
        .filter(Boolean),
    }),
    [augmentedCubaGeo],
  );

  const severityColors = ['#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#0F766E'];
  const causalityColors = ['#2563EB', '#0EA5E9', '#22C55E', '#F97316', '#DB2777'];
  const significanceColors = ['#2563EB', '#10B981', '#F97316', '#8B5CF6'];

  const severityChartData = reportData?.severityDistribution ?? [];
  const causalityChartData = reportData?.causalityDistribution ?? [];
  const significanceChartData = reportData?.significanceDistribution ?? [];
  const trendChartData = reportData?.monthlyTrends.map((item) => ({
    label: `${MONTH_LABELS[item.month - 1]} ${item.year}`,
    totalReports: item.totalReports,
  })) ?? [];

  const performanceSummaryCards = useMemo(
    () => [
      { label: 'Médicos activos', value: performanceData?.activeDoctors ?? 0, color: '#0A4B8F' },
      { label: 'Promedio reportes/médico', value: performanceData?.avgReportsPerDoctor ?? 0, color: '#10B981' },
      { label: 'Tiempo revisión (hrs)', value: performanceData?.avgReviewTimeHours ?? 0, color: '#3B82F6' },
      { label: 'Tiempo asignación (hrs)', value: performanceData?.avgAssignmentHours ?? 0, color: '#F59E0B' },
    ],
    [performanceData],
  );

  const performanceProvinces = performanceData?.activeMedicalReviewers ?? [];
  const performanceDoctorsByProvince = performanceProvinces.map((province) => ({
    provinceName: province.provinceName,
    activeDoctors: province.activeDoctors,
  }));
  const performanceReportsByProvince = performanceProvinces.map((province) => ({
    provinceName: province.provinceName,
    avgReportsPerDoctor: province.avgReportsPerDoctor,
  }));
  const performanceReviewTimeByProvince = performanceProvinces.map((province) => ({
    provinceName: province.provinceName,
    avgReviewTimeHours: province.avgReviewTimeHours,
  }));

  const selectedPerformanceProvince = useMemo(
    () =>
      performanceProvinces.find((province) => province.provinceName === selectedPerformanceProvinceName) ??
      performanceProvinces[0] ??
      null,
    [performanceProvinces, selectedPerformanceProvinceName],
  );

  useEffect(() => {
    if (!selectedPerformanceProvinceName && performanceProvinces.length > 0) {
      setSelectedPerformanceProvinceName(performanceProvinces[0].provinceName);
    }
  }, [performanceProvinces, selectedPerformanceProvinceName]);

  const municipalityComparativeData = selectedPerformanceProvince?.municipalities ?? [];

  const statusData = useMemo(
    () => [
      { name: 'Enviados', value: reportData?.submitted ?? 0 },
      { name: 'En Revisión', value: reportData?.underReview ?? 0 },
      { name: 'Aprobados', value: reportData?.approved ?? 0 },
      { name: 'Rechazados', value: reportData?.rejected ?? 0 },
      { name: 'Cerrados', value: reportData?.closed ?? 0 },
    ],
    [reportData],
  );

  const vaccineTotals = vaccineData?.vaccines ?? [];
  const symptomChartData = vaccineData?.symptomDistribution ?? [];
  const [selectedVaccineName, setSelectedVaccineName] = useState('General');

  const vaccineNames = useMemo(
    () => ['General', ...vaccineTotals.map((item) => item.vaccineName)],
    [vaccineTotals],
  );

  const selectedVaccine = useMemo(
    () => (selectedVaccineName === 'General' ? null : vaccineTotals.find((item) => item.vaccineName === selectedVaccineName)),
    [selectedVaccineName, vaccineTotals],
  );

  const aggregatedLots = useMemo(() => {
    if (selectedVaccineName !== 'General') return selectedVaccine?.lots ?? [];
    const lotsMap = new Map<string, number>();
    vaccineTotals.forEach((vaccine) => {
      vaccine.lots.forEach((lot) => {
        lotsMap.set(lot.lotNumber, (lotsMap.get(lot.lotNumber) ?? 0) + lot.totalReports);
      });
    });
    return Array.from(lotsMap.entries())
      .map(([lotNumber, totalReports]) => ({ lotNumber, totalReports }))
      .sort((a, b) => b.totalReports - a.totalReports);
  }, [selectedVaccineName, selectedVaccine, vaccineTotals]);

  const hasLotData = aggregatedLots.length > 0;

  useEffect(() => {
    let mounted = true;

    const loadDashboardReport = async () => {
      setIsLoadingReport(true);
      try {
        const response = await api.get('/AdminDashboard/report');
        if (!mounted) return;
        setReportData(response.data?.result ?? response.data);
        setReportError(null);
      } catch (error: any) {
        if (!mounted) return;
        setReportError(error?.message ?? 'Error cargando datos de reportes');
      } finally {
        if (!mounted) return;
        setIsLoadingReport(false);
      }
    };

    if (activeTab === 'report') {
      loadDashboardReport();
    }

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  useEffect(() => {
    let mounted = true;

    const loadPerformanceData = async () => {
      setIsLoadingPerformance(true);
      try {
        const response = await api.get('/AdminDashboard/performance');
        if (!mounted) return;
        setPerformanceData(response.data?.result ?? response.data);
        setPerformanceError(null);
      } catch (error: any) {
        if (!mounted) return;
        setPerformanceError(error?.message ?? 'Error cargando datos de rendimiento');
      } finally {
        if (!mounted) return;
        setIsLoadingPerformance(false);
      }
    };

    if (activeTab === 'performance') {
      loadPerformanceData();
    }

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  useEffect(() => {
    let mounted = true;

    const loadVaccineData = async () => {
      setIsLoadingVaccines(true);
      try {
        const response = await api.get('/AdminDashboard/vaccines');
        if (!mounted) return;
        setVaccineData(response.data?.result ?? response.data);
        setVaccinesError(null);
      } catch (error: any) {
        if (!mounted) return;
        setVaccinesError(error?.message ?? 'Error cargando datos de vacunas');
      } finally {
        if (!mounted) return;
        setIsLoadingVaccines(false);
      }
    };

    if (activeTab === 'vaccines') {
      loadVaccineData();
    }

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const existingMap = mapInstance.current;
    if (!existingMap) {
      const map = new maplibregl.Map({
  container: mapContainer.current,
  style: 'https://demotiles.maplibre.org/style.json',

  attributionControl: false,

  // Limita navegación alrededor de Cuba
  maxBounds: [
    [-86, 18],
    [-73, 25.5]
  ]
});

// Ajuste inicial automático
map.fitBounds(
  [
    [-84.5, 19],
    [-74.5, 25]
  ],
  {
    padding: 20
  }
);

      mapInstance.current = map;

      map.on('load', () => {
        const layers = map.getStyle()?.layers ?? [];
        layers.forEach((layer: any) => {
          if (!layer?.id || layer.id.startsWith('cuba-')) return;
          try {
            if (layer.type === 'fill') map.setPaintProperty(layer.id, 'fill-opacity', 0.05);
            if (layer.type === 'line') map.setPaintProperty(layer.id, 'line-opacity', 0.1);
            if (layer.type === 'symbol') {
              map.setPaintProperty(layer.id, 'text-opacity', 0.1);
              map.setPaintProperty(layer.id, 'icon-opacity', 0.1);
            }
            if (layer.type === 'raster') map.setPaintProperty(layer.id, 'raster-opacity', 0.15);
          } catch {
            // ignore unsupported layer paint changes
          }
        });

        map.addSource('cuba-geo', {
          type: 'geojson',
          data: augmentedCubaGeo,
        });

        map.addLayer({
          id: 'cuba-fill',
          type: 'fill',
          source: 'cuba-geo',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              legendStops[0],
              getProvinceColor(legendStops[0]),
              legendStops[1],
              getProvinceColor(legendStops[1]),
              legendStops[2],
              getProvinceColor(legendStops[2]),
              legendStops[3],
              getProvinceColor(legendStops[3]),
            ],
            'fill-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'cuba-borders',
          type: 'line',
          source: 'cuba-geo',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.2,
          },
        });

        map.addSource('cuba-labels', {
          type: 'geojson',
          data: provinceLabelPoints,
        });

        map.addLayer({
          id: 'cuba-labels',
          type: 'symbol',
          source: 'cuba-labels',
          layout: {
            'text-field': ['to-string', ['get', 'value']],
            'text-size': 12,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-anchor': 'center',
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': 'rgba(255,255,255,0.95)',
            'text-halo-width': 2,
          },
        });

        map.on('mousemove', 'cuba-fill', (event) => {
          const features = event.features as any[];
          if (!features || !features.length) {
            if (popupRef.current) popupRef.current.remove();
            hoveredProvinceKeyRef.current = null;
            map.getCanvas().style.cursor = '';
            return;
          }

          const feature = features[0];
          const provinceKey = resolveProvinceKey(feature.properties?.provinceName ?? feature.properties?.name ?? '');
          const lngLat = event.lngLat as { lng: number; lat: number };

          // si es la misma provincia, solo mover el popup
          if (provinceKey === hoveredProvinceKeyRef.current) {
            if (popupRef.current) popupRef.current.setLngLat([lngLat.lng, lngLat.lat]);
            return;
          }

          hoveredProvinceKeyRef.current = provinceKey;
          const reportProvince = provinceMap[provinceKey];

          if (reportProvince) {
            map.getCanvas().style.cursor = 'pointer';
            const html = `
              <div style="min-width:160px;font-size:13px">
                <strong>${reportProvince.provinceName}</strong>
                <div>Total: ${reportProvince.total}</div>
                <div>Enviados: ${reportProvince.submitted}</div>
                <div>En Revisión: ${reportProvince.underReview}</div>
                <div>Aprobados: ${reportProvince.approved}</div>
                <div>Rechazados: ${reportProvince.rejected}</div>
              </div>
            `;

            if (!popupRef.current) {
              popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
            }

            popupRef.current.setHTML(html).setLngLat([lngLat.lng, lngLat.lat]).addTo(map);
          } else {
            if (popupRef.current) popupRef.current.remove();
            map.getCanvas().style.cursor = '';
          }
        });

        // click para fijar la provincia en el panel lateral
        map.on('click', 'cuba-fill', (event) => {
          const features = event.features as any[];
          if (!features || !features.length) return;
          const feature = features[0];
          const provinceKey = resolveProvinceKey(feature.properties?.provinceName ?? feature.properties?.name ?? '');
          const reportProvince = provinceMap[provinceKey];
          if (reportProvince) setHoveredProvince(reportProvince);
        });

        map.on('mouseleave', 'cuba-fill', () => {
          if (popupRef.current) popupRef.current.remove();
          hoveredProvinceKeyRef.current = null;
          map.getCanvas().style.cursor = '';
        });
      });

      return () => {
        map.remove();
        mapInstance.current = null;
      };
    }

    if (existingMap?.getSource('cuba-geo')) {
      (existingMap.getSource('cuba-geo') as maplibregl.GeoJSONSource).setData(augmentedCubaGeo);
    }

    if (existingMap?.getSource('cuba-labels')) {
      (existingMap.getSource('cuba-labels') as maplibregl.GeoJSONSource).setData(provinceLabelPoints);
    }
  }, [augmentedCubaGeo, provinceLabelPoints, legendStops, provinceMap]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A4B8F' }}>
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600">Vigilancia nacional de farmacovigilancia - Análisis integral del sistema</p>
        </div>

        {reportError && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{reportError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-2 mb-6">
            <TabsTrigger value="report">Reporte</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0A4B8F' }}>
                  Reporte
                </h2>
                <p className="text-gray-600 text-sm mt-1">Datos del endpoint /api/AdminDashboard/report con información territorial, severidad, causalidad y significancia.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map((card) => (
                  <Card key={card.label} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-700">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold" style={{ color: card.color }}>
                        {card.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Mapa de reportes por provincia</CardTitle>
                  <CardDescription>Hover sobre la provincia para ver totales y tipos de estado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="col-span-2 overflow-hidden rounded-xl border border-slate-200">
                      <div ref={mapContainer} className="h-[520px] w-full" />
                    </div>
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Provincia seleccionada</div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{hoveredProvince?.provinceName ?? 'Coloca el cursor sobre el mapa'}</div>
                      </div>
                      {hoveredProvince ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white p-3 shadow-sm">
                              <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
                              <div className="mt-2 text-2xl font-bold text-slate-900">{hoveredProvince.total}</div>
                            </div>
                            <div className="rounded-xl bg-white p-3 shadow-sm">
                              <div className="text-xs uppercase tracking-wide text-slate-500">Serios</div>
                              <div className="mt-2 text-2xl font-bold text-amber-600">{hoveredProvince.serious}</div>
                            </div>
                          </div>
                          <div className="rounded-xl bg-white p-3 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-slate-500">Estado</div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                              <div>Enviados: {hoveredProvince.submitted}</div>
                              <div>En Revisión: {hoveredProvince.underReview}</div>
                              <div>Aprobados: {hoveredProvince.approved}</div>
                              <div>Rechazados: {hoveredProvince.rejected}</div>
                              <div>Cerrados: {hoveredProvince.closed}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-white p-3 shadow-sm text-slate-500">
                          Coloca el cursor sobre una provincia para ver su cantidad de reportes y estado.
                        </div>
                      )}
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Leyenda de intensidad</div>
                        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-700">
                          {legendStops.map((value, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <span className="inline-block h-3 w-full rounded-full" style={{ backgroundColor: getProvinceColor(value) }} />
                              <span>{legendLabels[idx]}</span>
                              <span className="text-[11px] text-slate-500">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-3">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Severidad</CardTitle>
                    <CardDescription>Distribución por tipo de severidad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={severityChartData} dataKey="count" innerRadius={60} outerRadius={100} paddingAngle={3}>
                          {severityChartData.map((entry, index) => (
                            <Cell key={`severity-${entry.severityType}`} fill={severityColors[index % severityColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}`, 'Cantidad']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid gap-2">
                      {severityChartData.map((entry, index) => (
                        <div key={entry.severityType} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: severityColors[index % severityColors.length] }} />
                          <span>{entry.severityType}</span>
                          <span className="ml-auto text-slate-500">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Causalidad</CardTitle>
                    <CardDescription>Distribución de causalidad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={causalityChartData} dataKey="count" innerRadius={60} outerRadius={100} paddingAngle={3}>
                          {causalityChartData.map((entry, index) => (
                            <Cell key={`causality-${entry.causality}`} fill={causalityColors[index % causalityColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}`, 'Cantidad']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid gap-2">
                      {causalityChartData.map((entry, index) => (
                        <div key={entry.causality} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: causalityColors[index % causalityColors.length] }} />
                          <span>{entry.causality}</span>
                          <span className="ml-auto text-slate-500">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Significancia</CardTitle>
                    <CardDescription>Distribución de significancia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={significanceChartData} dataKey="count" innerRadius={60} outerRadius={100} paddingAngle={3}>
                          {significanceChartData.map((entry, index) => (
                            <Cell key={`significance-${entry.significance}`} fill={significanceColors[index % significanceColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value}`, 'Cantidad']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid gap-2">
                      {significanceChartData.map((entry, index) => (
                        <div key={entry.significance} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: significanceColors[index % significanceColors.length] }} />
                          <span>{entry.significance}</span>
                          <span className="ml-auto text-slate-500">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Tendencia mensual</CardTitle>
                    <CardDescription>Reporte total por mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={trendChartData} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="totalReports" stroke="#0A4B8F" strokeWidth={3} dot={{ fill: '#0A4B8F', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Top Provincias</CardTitle>
                    <CardDescription>Provincias con más reportes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={provinces.slice().sort((a, b) => b.total - a.total).slice(0, 6)} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="provinceName" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0A4B8F' }}>
                  Rendimiento
                </h2>
                <p className="text-gray-600 text-sm mt-1">Métricas de rendimiento basadas en el endpoint /api/AdminDashboard/performance.</p>
              </div>

              {performanceError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{performanceError}</AlertDescription>
                </Alert>
              )}

              {isLoadingPerformance ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">Cargando datos de rendimiento...</div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {performanceSummaryCards.map((card) => (
                      <Card key={card.label} className="border-0 shadow-lg bg-slate-50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-slate-600">{card.label}</div>
                          <div className="text-3xl font-bold" style={{ color: card.color }}>
                            {card.value}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Médicos activos</CardTitle>
                        <CardDescription>Activos por provincia</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={performanceDoctorsByProvince} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="provinceName" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="activeDoctors" fill="#0A4B8F" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Promedio de reportes/médico</CardTitle>
                        <CardDescription>Por provincia</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={performanceReportsByProvince} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="provinceName" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="avgReportsPerDoctor" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Tiempo de revisión</CardTitle>
                        <CardDescription>Horas promedio por provincia</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={performanceReviewTimeByProvince} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="provinceName" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="avgReviewTimeHours" fill="#F59E0B" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <CardTitle>Revisores médicos activos</CardTitle>
                          <CardDescription>Comparativo por provincia y municipio para reportes/médico, revisión y asignación.</CardDescription>
                        </div>
                        <div className="w-full max-w-xs">
                          <Select value={selectedPerformanceProvinceName} onValueChange={setSelectedPerformanceProvinceName}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar provincia" />
                            </SelectTrigger>
                            <SelectContent>
                              {performanceProvinces.map((province) => (
                                <SelectItem key={province.provinceName} value={province.provinceName}>
                                  {province.provinceName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedPerformanceProvince ? (
                        <div className="space-y-6">
                          <div className="grid gap-4 xl:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="text-sm font-medium text-slate-700">Provincia seleccionada</div>
                              <div className="mt-2 text-2xl font-semibold text-slate-900">
                                {selectedPerformanceProvince.provinceName}
                              </div>
                              <div className="mt-3 text-sm text-slate-600">Médicos activos: {selectedPerformanceProvince.activeDoctors}</div>
                              <div className="mt-2 text-sm text-slate-600">Reporte/médico: {selectedPerformanceProvince.avgReportsPerDoctor}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="text-sm font-medium text-slate-700">Tiempo de revisión</div>
                              <div className="mt-2 text-3xl font-semibold text-slate-900">{selectedPerformanceProvince.avgReviewTimeHours}h</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="text-sm font-medium text-slate-700">Tiempo de asignación</div>
                              <div className="mt-2 text-3xl font-semibold text-slate-900">{selectedPerformanceProvince.avgAssignmentHours}h</div>
                            </div>
                          </div>

                          <div className="grid gap-6 xl:grid-cols-3">
                            <Card className="border-0 shadow-sm">
                              <CardHeader>
                                <CardTitle>Reportes/médico</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {municipalityComparativeData.length ? (
                                  <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={municipalityComparativeData} margin={{ top: 20, right: 24, left: 0, bottom: 40 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="municipalityName" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                                      <YAxis />
                                      <Tooltip />
                                      <Bar dataKey="avgReportsPerDoctor" fill="#0A4B8F" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No hay datos municipales disponibles.</div>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardHeader>
                                <CardTitle>Revisión (hrs)</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {municipalityComparativeData.length ? (
                                  <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={municipalityComparativeData} margin={{ top: 20, right: 24, left: 0, bottom: 40 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="municipalityName" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                                      <YAxis />
                                      <Tooltip />
                                      <Bar dataKey="avgReviewTimeHours" fill="#F59E0B" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No hay datos municipales disponibles.</div>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardHeader>
                                <CardTitle>Asignación (hrs)</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {municipalityComparativeData.length ? (
                                  <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={municipalityComparativeData} margin={{ top: 20, right: 24, left: 0, bottom: 40 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="municipalityName" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                                      <YAxis />
                                      <Tooltip />
                                      <Bar dataKey="avgAssignmentHours" fill="#10B981" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No hay datos municipales disponibles.</div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                          Selecciona una provincia para ver el comparativo municipal.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vaccines" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0A4B8F' }}>
                  Vacunas
                </h2>
                <p className="text-gray-600 text-sm mt-1">Análisis de vacunas y síntomas basado en el endpoint /api/AdminDashboard/vaccines.</p>
              </div>

              {vaccinesError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{vaccinesError}</AlertDescription>
                </Alert>
              )}

              {isLoadingVaccines ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">Cargando datos de vacunas...</div>
              ) : (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Total de reportes por vacuna</CardTitle>
                        <CardDescription>Comparativa de vacunas con más eventos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={vaccineTotals} margin={{ top: 20, right: 24, left: 0, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vaccineName" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`${value}`, 'Reportes']} />
                            <Bar dataKey="totalReports" fill="#0A4B8F" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Distribución de síntomas</CardTitle>
                        <CardDescription>Principales eventos reportados</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={360}>
                          <PieChart>
                            <Pie data={symptomChartData} dataKey="count" nameKey="symptomName" innerRadius={60} outerRadius={110} paddingAngle={3}>
                              {symptomChartData.map((entry, index) => (
                                <Cell key={`symptom-${entry.symptomName}`} fill={severityColors[index % severityColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value}`, 'Casos']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid gap-2">
                          {symptomChartData.map((entry, index) => (
                            <div key={entry.symptomName} className="flex items-center gap-2 text-sm text-slate-700">
                              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: severityColors[index % severityColors.length] }} />
                              <span>{entry.symptomName}</span>
                              <span className="ml-auto text-slate-500">{entry.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Lotes</h3>
                      <p className="text-sm text-slate-500">Selecciona una vacuna para ver sus lotes o el resumen general.</p>
                    </div>
                    <div className="w-full max-w-xs">
                      <Select value={selectedVaccineName} onValueChange={setSelectedVaccineName}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar vacuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {vaccineNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>{selectedVaccineName === 'General' ? 'Lotes generales' : selectedVaccineName}</CardTitle>
                        <CardDescription>
                          {selectedVaccineName === 'General'
                            ? 'Resumen de lotes acumulado para todas las vacunas.'
                            : `Total de reportes: ${selectedVaccine?.totalReports ?? 0}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hasLotData ? (
                          <div className="space-y-3">
                            {aggregatedLots.map((lot) => {
                              const maxReports = Math.max(...aggregatedLots.map((item) => item.totalReports), 1);
                              return (
                                <div key={lot.lotNumber} className="rounded-xl bg-slate-50 p-3">
                                  <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-900">
                                    <span>{lot.lotNumber}</span>
                                    <span>{lot.totalReports} reportes</span>
                                  </div>
                                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                                    <div
                                      className="h-2 rounded-full bg-blue-600"
                                      style={{ width: `${Math.min(100, Math.round((lot.totalReports / maxReports) * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                            No hay datos de lotes disponibles para la selección actual.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
