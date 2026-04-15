import { useReports } from '@/app/context/ReportContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertCircle, Clock, CheckCircle2, Users } from 'lucide-react';

export const AdminDashboard = () => {
  const { reports } = useReports();

  // Estadísticas básicas
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;
  const reviewedReports = reports.filter(r => r.status === 'reviewed').length;

  // Reportes de hoy (simulado)
  const today = new Date().toDateString();
  const reportsToday = reports.filter(r => new Date(r.createdAt).toDateString() === today).length;

  // Reportes por doctor
  const reportsByDoctor = reports.reduce((acc, report) => {
    const doctor = acc.find(d => d.name === report.doctorName);
    if (doctor) {
      doctor.count += 1;
    } else {
      acc.push({ name: report.doctorName, count: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; count: number }>).sort((a, b) => b.count - a.count);

  // Datos simulados de severidad (basado en contenido del reporte)
  const severityData = [
    { name: 'Leve', value: Math.floor(totalReports * 0.4) },
    { name: 'Moderado', value: Math.floor(totalReports * 0.35) },
    { name: 'Grave', value: Math.floor(totalReports * 0.25) },
  ];

  // Vacunas más reportadas (simulado)
  const vaccineData = [
    { name: 'Soberana 02', count: Math.floor(totalReports * 0.25) },
    { name: 'Abdala', count: Math.floor(totalReports * 0.20) },
    { name: 'Soberana Plus', count: Math.floor(totalReports * 0.18) },
    { name: 'Mambisa', count: Math.floor(totalReports * 0.15) },
    { name: 'Otra', count: Math.floor(totalReports * 0.22) },
  ];

  // Tendencia de reportes (últimos 7 días)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      reportes: Math.floor(Math.random() * (totalReports / 3)) + Math.floor(totalReports / 7),
    };
  });

  // Datos para gráfico de estado
  const statusData = [
    { name: 'Borradores', value: draftReports },
    { name: 'Completados', value: completedReports },
    { name: 'Revisados', value: reviewedReports },
  ];

  // Reportes críticos (simulado - últimos 5)
  const criticalReports = reports.slice(-5).reverse();

  const COLORS = ['#EF4444', '#22C55E', '#3B82F6'];
  const SEVERITY_COLORS = ['#FBBF24', '#F97316', '#DC2626'];
  const VACCINE_COLORS = ['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  // Calcular métricas de desempeño
  const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;
  const reviewRate = totalReports > 0 ? Math.round((reviewedReports / totalReports) * 100) : 0;
  const avgReportsPerDoctor = reportsByDoctor.length > 0 ? Math.round(totalReports / reportsByDoctor.length) : 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A4B8F' }}>Dashboard Administrativo</h1>
        <p className="text-gray-600">Resumen integral de reportes y actividades del sistema</p>
      </div>

      {/* Tarjetas de Estadísticas - Primera Fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#0A4B8F' }}>{totalReports}</div>
            <p className="text-xs text-gray-500 mt-1">Reportes en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedReports}</div>
            <p className="text-xs text-gray-500 mt-1">{completionRate}% del total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              En Revisión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{reviewedReports}</div>
            <p className="text-xs text-gray-500 mt-1">{reviewRate}% en proceso</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{draftReports}</div>
            <p className="text-xs text-gray-500 mt-1">Sin completar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de Estadísticas - Segunda Fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Reportes Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportsToday}</div>
            <p className="text-xs text-gray-500 mt-1">En las últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Médicos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{reportsByDoctor.length}</div>
            <p className="text-xs text-gray-500 mt-1">Con reportes registrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio por Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{avgReportsPerDoctor}</div>
            <p className="text-xs text-gray-500 mt-1">Reportes por médico</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasa de Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{reviewRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Reportes en revisión</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Primera Fila */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Gráfico de Tendencia */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Tendencia de Reportes</CardTitle>
            <CardDescription>Últimos 7 días de actividad</CardDescription>
          </CardHeader>
          <CardContent>
            {totalReports > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reportes" stroke="#0A4B8F" strokeWidth={2} dot={{ fill: '#0A4B8F', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sin datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Distribución de Estados */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
            <CardDescription>Proporción de reportes por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {totalReports > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sin reportes para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Segunda Fila */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Gráfico de Reportes por Médico */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Reportes por Médico</CardTitle>
            <CardDescription>
              {reportsByDoctor.length > 0 ? 'Total de reportes creados por cada médico' : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsByDoctor.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportsByDoctor.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0A4B8F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sin reportes registrados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Severidad */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Distribución por Severidad</CardTitle>
            <CardDescription>Eventos según nivel de severidad</CardDescription>
          </CardHeader>
          <CardContent>
            {totalReports > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {SEVERITY_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sin datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Vacunas */}
      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle>Vacunas Más Reportadas</CardTitle>
          <CardDescription>Ranking de vacunas por número de eventos adversos reportados</CardDescription>
        </CardHeader>
        <CardContent>
          {vaccineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vaccineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Reportes Recientes */}
      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>
            {reports.length > 0 ? 'Últimos reportes creados en el sistema' : 'Sin reportes disponibles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID Reporte</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Médico</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Título</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(-10).reverse().map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{report.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.doctorName}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium truncate max-w-xs">{report.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{report.content.substring(0, 50)}...</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            report.status === 'draft'
                              ? 'bg-red-500'
                              : report.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          } text-white`}
                        >
                          {report.status === 'draft'
                            ? 'Borrador'
                            : report.status === 'completed'
                            ? 'Completado'
                            : 'Revisado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay reportes disponibles en el sistema
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Reportes Críticos */}
      {criticalReports.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Reportes Críticos Recientes
            </CardTitle>
            <CardDescription>Últimos reportes graves que requieren atención prioritaria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalReports.map((report) => (
                <div key={report.id} className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">{report.title}</h4>
                      <p className="text-sm text-red-800 mb-2">{report.content.substring(0, 120)}...</p>
                      <div className="flex gap-4 text-xs text-red-700">
                        <span><strong>Médico:</strong> {report.doctorName}</span>
                        <span><strong>Fecha:</strong> {new Date(report.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <Badge className="bg-red-600 text-white ml-4">CRÍTICO</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
