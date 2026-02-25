import { useReports } from '@/app/context/ReportContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AdminDashboard = () => {
  const { reports } = useReports();

  // Estadísticas
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;
  const reviewedReports = reports.filter(r => r.status === 'reviewed').length;

  // Reportes por doctor
  const reportsByDoctor = reports.reduce((acc, report) => {
    const doctor = acc.find(d => d.name === report.doctorName);
    if (doctor) {
      doctor.count += 1;
    } else {
      acc.push({ name: report.doctorName, count: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; count: number }>);

  // Datos para gráfico de estado
  const statusData = [
    { name: 'Borradores', value: draftReports },
    { name: 'Completados', value: completedReports },
    { name: 'Revisados', value: reviewedReports },
  ];

  const COLORS = ['#EF4444', '#22C55E', '#3B82F6'];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Resumen de reportes y actividades</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
            <p className="text-xs text-gray-500 mt-1">Reportes creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedReports}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{reviewedReports}</div>
            <p className="text-xs text-gray-500 mt-1">En revisión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{draftReports}</div>
            <p className="text-xs text-gray-500 mt-1">Sin completar</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes por Médico</CardTitle>
            <CardDescription>
              {reportsByDoctor.length > 0 ? 'Total de reportes creados por cada médico' : 'Sin datos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsByDoctor.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportsByDoctor}>
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

        {/* Gráfico de Pastel */}
        <Card>
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

      {/* Tabla de Reportes Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>
            {reports.length > 0 ? 'Últimos reportes creados' : 'Sin reportes disponibles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Título</th>
                    <th className="text-left py-3 px-4 font-semibold">Médico</th>
                    <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice().reverse().map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium truncate max-w-xs">{report.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{report.content.substring(0, 60)}...</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.doctorName}</td>
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
              No hay reportes disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
