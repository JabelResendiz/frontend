import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Users,
  Syringe,
  Calendar
} from "lucide-react";
import { useState } from "react";

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState("6months");

  // Mock KPI data
  const kpis = [
    {
      title: "Total de Reportes",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: FileText,
      color: "#0A4B8F"
    },
    {
      title: "Eventos Leves",
      value: "2,796",
      percentage: "98.2%",
      icon: CheckCircle2,
      color: "#2D7A3E"
    },
    {
      title: "Eventos Moderados",
      value: "47",
      percentage: "1.7%",
      icon: AlertTriangle,
      color: "#F59E0B"
    },
    {
      title: "Eventos Severos",
      value: "4",
      percentage: "0.1%",
      icon: AlertTriangle,
      color: "#DC2626"
    }
  ];

  // Mock data for charts
  const eventsByMonth = [
    { month: "Ago", total: 385, leves: 378, moderados: 6, severos: 1 },
    { month: "Sep", total: 421, leves: 414, moderados: 7, severos: 0 },
    { month: "Oct", total: 456, leves: 448, moderados: 7, severos: 1 },
    { month: "Nov", total: 489, leves: 480, moderados: 8, severos: 1 },
    { month: "Dic", total: 512, leves: 502, moderados: 9, severos: 1 },
    { month: "Ene", total: 584, leves: 574, moderados: 10, severos: 0 }
  ];

  const eventsByVaccine = [
    { name: "Soberana 02", value: 1245, percentage: 43.7 },
    { name: "Abdala", value: 867, percentage: 30.5 },
    { name: "Soberana Plus", value: 423, percentage: 14.9 },
    { name: "Heberpenta-L", value: 186, percentage: 6.5 },
    { name: "vABC", value: 89, percentage: 3.1 },
    { name: "Otras", value: 37, percentage: 1.3 }
  ];

  const symptomFrequency = [
    { symptom: "Dolor sitio inyección", count: 2456, percentage: 86.3 },
    { symptom: "Fiebre leve", count: 1834, percentage: 64.4 },
    { symptom: "Fatiga", count: 1523, percentage: 53.5 },
    { symptom: "Dolor de cabeza", count: 1204, percentage: 42.3 },
    { symptom: "Dolor muscular", count: 987, percentage: 34.7 },
    { symptom: "Náuseas", count: 456, percentage: 16.0 },
    { symptom: "Escalofríos", count: 398, percentage: 14.0 },
    { symptom: "Mareos", count: 234, percentage: 8.2 }
  ];

  const ageDistribution = [
    { range: "0-17", count: 234 },
    { range: "18-29", count: 512 },
    { range: "30-44", count: 867 },
    { range: "45-59", count: 789 },
    { range: "60-74", count: 345 },
    { range: "75+", count: 100 }
  ];

  const COLORS = ['#0A4B8F', '#2D7A3E', '#F59E0B', '#DC2626', '#8B5CF6', '#6B7280'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
                Dashboard de Farmacovigilancia
              </h1>
              <p className="text-gray-600">
                Análisis estadístico de eventos adversos reportados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                  <SelectItem value="all">Todo el período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${kpi.color}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                      </div>
                      {kpi.change && (
                        <Badge 
                          variant="secondary" 
                          className="font-medium"
                          style={{ backgroundColor: "#E8F5EB", color: "#2D7A3E" }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {kpi.change}
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ color: kpi.color }}>
                      {kpi.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {kpi.title}
                    </div>
                    {kpi.percentage && (
                      <div className="text-xs text-gray-500 mt-1">
                        {kpi.percentage} del total
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Events by Month */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Eventos por Mes
              </CardTitle>
              <CardDescription>
                Tendencia temporal de reportes por severidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0A4B8F" 
                    strokeWidth={2}
                    name="Total"
                    dot={{ fill: '#0A4B8F', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leves" 
                    stroke="#2D7A3E" 
                    strokeWidth={2}
                    name="Leves"
                    dot={{ fill: '#2D7A3E', r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moderados" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Moderados"
                    dot={{ fill: '#F59E0B', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Events by Vaccine */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5" />
                Distribución por Vacuna
              </CardTitle>
              <CardDescription>
                Proporción de eventos por tipo de vacuna
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventsByVaccine}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventsByVaccine.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Symptom Frequency */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Síntomas Más Frecuentes
              </CardTitle>
              <CardDescription>
                Top 8 síntomas reportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={symptomFrequency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="symptom" 
                    tick={{ fontSize: 11 }}
                    stroke="#9CA3AF"
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [value, "Casos"]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#0A4B8F"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Distribución por Edad
              </CardTitle>
              <CardDescription>
                Grupos etarios afectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [value, "Casos"]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#2D7A3E"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card className="border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
            <CardDescription>
              Indicadores clave de seguridad y farmacovigilancia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border-l-4 pl-4" style={{ borderColor: "#0A4B8F" }}>
                <div className="text-2xl font-bold mb-1">24h</div>
                <div className="text-sm text-gray-600">Tiempo medio de respuesta</div>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: "#2D7A3E" }}>
                <div className="text-2xl font-bold mb-1">99.8%</div>
                <div className="text-sm text-gray-600">Tasa de recuperación completa</div>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: "#F59E0B" }}>
                <div className="text-2xl font-bold mb-1">0.02%</div>
                <div className="text-sm text-gray-600">Tasa de hospitalización</div>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: "#8B5CF6" }}>
                <div className="text-2xl font-bold mb-1">3.2 días</div>
                <div className="text-sm text-gray-600">Duración media de síntomas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interpretation Note */}
        <Card className="border-0 shadow-lg mt-6 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F" }}>
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: "#0A4B8F" }}>
                  Interpretación Científica
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Los datos reflejan un perfil de seguridad consistente con los estudios clínicos previos. 
                  La mayoría de los eventos adversos son de naturaleza leve y autolimitada, con resolución 
                  espontánea en menos de 72 horas. La tasa de eventos severos (0.1%) está dentro de los 
                  parámetros esperados y aceptables según estándares internacionales de farmacovigilancia. 
                  Se mantiene vigilancia activa sobre todos los casos reportados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
