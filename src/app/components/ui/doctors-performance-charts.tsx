import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DoctorPerformance } from "@/app/services/municipal-dashboard.service";
import { Skeleton } from "@/app/components/ui/skeleton";

interface DoctorsPerformanceChartsProps {
  data: DoctorPerformance[];
  isLoading?: boolean;
}

export function DoctorsPerformanceCharts({ data, isLoading = false }: DoctorsPerformanceChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center text-gray-500">
          No hay datos de desempeño disponibles
        </CardContent>
      </Card>
    );
  }

  // Sort data by completed reports (descending)
  const byCompletedReports = [...data].sort(
    (a, b) => b.completedReports - a.completedReports
  );

  // Sort data by assigned reports (descending)
  const byAssignedReports = [...data].sort(
    (a, b) => b.assignedReports - a.assignedReports
  );

  // Sort data by completion rate (descending)
  const byCompletionRate = [...data].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  // Sort data by average review time (ascending - faster is better)
  const byReviewTime = [...data]
    .filter((d) => d.averageReviewTimeHours > 0)
    .sort((a, b) => a.averageReviewTimeHours - b.averageReviewTimeHours);

  return (
    <div className="space-y-8">
      {/* Chart 1: Reportes Completados */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            ✅ Médicos por Reportes Completados
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ranking de médicos ordenados por cantidad de reportes completados
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={byCompletedReports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="doctorName"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Bar dataKey="completedReports" fill="#10B981" name="Completados" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pendingReports" fill="#F59E0B" name="Pendientes" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expiredReports" fill="#EF4444" name="Expirados" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Reportes Asignados */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            📊 Médicos por Reportes Asignados
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ranking de médicos por carga total de trabajo (reportes asignados)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={byAssignedReports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="doctorName"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Bar dataKey="assignedReports" fill="#3B82F6" name="Asignados" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Tasa de Completación */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            📈 Tasa de Completación por Médico
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Porcentaje de reportes completados respecto a los asignados (mayor es mejor)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={byCompletionRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="doctorName"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} label={{ value: "(%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend />
              <Bar
                dataKey="completionRate"
                fill="#8B5CF6"
                name="Tasa Completación (%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Tiempo Promedio de Revisión */}
      {byReviewTime.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
              ⚡ Velocidad de Revisión (Médicos Activos)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Tiempo promedio de revisión en horas (menor es mejor) - Solo médicos con reportes completados
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={byReviewTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="doctorName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis label={{ value: "(horas)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  formatter={(value: any) => `${value.toFixed(2)} horas`}
                />
                <Legend />
                <Bar
                  dataKey="averageReviewTimeHours"
                  fill="#EF4444"
                  name="Tiempo Promedio (horas)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Table */}
      <Card className="border-0 shadow-lg bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            📋 Resumen General de Médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-semibold text-blue-900">Médico</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-900">Asignados</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-900">Completados</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-900">Pendientes</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-900">Tasa %</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-900">Tiempo Prom.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((doctor) => (
                  <tr key={doctor.doctorId} className="border-b border-blue-100 hover:bg-blue-100 transition">
                    <td className="py-3 px-4 font-medium text-blue-900">{doctor.doctorName}</td>
                    <td className="text-center py-3 px-4 text-blue-800">{doctor.assignedReports}</td>
                    <td className="text-center py-3 px-4 text-green-600 font-semibold">
                      {doctor.completedReports}
                    </td>
                    <td className="text-center py-3 px-4 text-yellow-600 font-semibold">
                      {doctor.pendingReports}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-white font-semibold"
                        style={{
                          backgroundColor:
                            doctor.completionRate >= 50
                              ? "#10B981"
                              : doctor.completionRate >= 25
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        {doctor.completionRate}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-red-600">
                      {doctor.averageReviewTimeHours > 0
                        ? `${doctor.averageReviewTimeHours.toFixed(1)}h`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
