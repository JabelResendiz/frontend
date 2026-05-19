import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
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
  const [reportData, setReportData] = useState<AdminReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
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

  const vaccineData = useMemo(
    () => [
      { name: 'Soberana 02', count: Math.floor((reportData?.totalReports ?? 0) * 0.25) },
      { name: 'Abdala', count: Math.floor((reportData?.totalReports ?? 0) * 0.2) },
      { name: 'Soberana Plus', count: Math.floor((reportData?.totalReports ?? 0) * 0.18) },
      { name: 'Mambisa', count: Math.floor((reportData?.totalReports ?? 0) * 0.15) },
      { name: 'Otra', count: Math.floor((reportData?.totalReports ?? 0) * 0.22) },
    ],
    [reportData],
  );

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

    loadDashboardReport();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const existingMap = mapInstance.current;
    if (!existingMap) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-79.4, 21.3],
        zoom: 5.2,
        minZoom: 5.2,
        maxZoom: 5.2,
        maxBounds: [[-84.5, 19], [-74.5, 25]],
        dragPan: false,
        doubleClickZoom: false,
        scrollZoom: false,
        boxZoom: false,
        touchZoomRotate: false,
        dragRotate: false,
        keyboard: false,
        attributionControl: false,
      });

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

        <Tabs defaultValue="report" className="w-full">
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
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0A4B8F' }}>
                  Rendimiento
                </h2>
                <p className="text-gray-600 text-sm mt-1">Vista de rendimiento con indicadores y tendencias mensuales.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map((card) => (
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

          <TabsContent value="vaccines" className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#0A4B8F' }}>
                  Vacunas
                </h2>
                <p className="text-gray-600 text-sm mt-1">Distribución de reportes según el tipo de vacuna.</p>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Vacunas reportadas</CardTitle>
                  <CardDescription>Estimación de eventos por vacuna</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={vaccineData} layout="vertical" margin={{ left: 120, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0A4B8F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
