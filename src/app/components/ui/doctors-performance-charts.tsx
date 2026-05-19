import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
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
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-44" />
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

  const byCompletionRate = [...data].sort((a, b) => b.completionRate - a.completionRate);
  const byCompletedReports = [...data].sort((a, b) => b.completedReports - a.completedReports);
  const byReviewTime = [...data]
    .filter((d) => d.averageReviewTimeHours > 0)
    .sort((a, b) => a.averageReviewTimeHours - b.averageReviewTimeHours);

  const chartHeightForData = (count: number) => Math.max(320, count * 52 + 80);
  const sharedMargin = { top: 20, right: 24, left: 20, bottom: 20 };
  const tooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
  };
  const labelStyle = { fill: "#0f172a", fontSize: 12, fontWeight: 600 };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            📈 Tasa de Completación por Médico
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Los médicos mejor calificados por porcentaje de reportes completados.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={chartHeightForData(byCompletionRate.length)}>
            <BarChart
              layout="vertical"
              data={byCompletionRate}
              margin={sharedMargin}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#334155", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="doctorName"
                type="category"
                width={180}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#334155", fontSize: 13 }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}%`, "Tasa de completación"]} />
              <Bar dataKey="completionRate" fill="#8B5CF6" radius={[12, 12, 12, 12]}>
                <LabelList dataKey="completionRate" position="right" formatter={(value: number) => `${value}%`} style={labelStyle} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
              ✅ Reportes Completados
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Médicos ordenados por cantidad de reportes completados.
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeightForData(byCompletedReports.length)}>
              <BarChart
                layout="vertical"
                data={byCompletedReports}
                margin={sharedMargin}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: "#334155", fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="doctorName"
                  type="category"
                  width={180}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#334155", fontSize: 13 }}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value, "Reportes completados"]} />
                <Bar dataKey="completedReports" fill="#10B981" radius={[12, 12, 12, 12]}>
                  <LabelList dataKey="completedReports" position="right" style={labelStyle} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
              ⚡ Velocidad de Revisión
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Médicos con menor tiempo promedio de revisión en horas.
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeightForData(byReviewTime.length)}>
              <BarChart
                layout="vertical"
                data={byReviewTime}
                margin={sharedMargin}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: "#334155", fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="doctorName"
                  type="category"
                  width={180}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#334155", fontSize: 13 }}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value.toFixed(2)} h`, "Horas promedio"]} />
                <Bar dataKey="averageReviewTimeHours" fill="#EF4444" radius={[12, 12, 12, 12]}>
                  <LabelList
                    dataKey="averageReviewTimeHours"
                    position="right"
                    formatter={(value: number) => `${value.toFixed(1)}h`}
                    style={labelStyle}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#0A4B8F" }}>
            📋 Resumen General de Médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Médico</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Asignados</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Completados</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Pendientes</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Tasa %</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Tiempo Prom.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((doctor) => (
                  <tr key={doctor.doctorId} className="border-b border-slate-200 hover:bg-slate-100 transition">
                    <td className="py-3 px-4 font-medium text-slate-900">{doctor.doctorName}</td>
                    <td className="text-center py-3 px-4 text-slate-700">{doctor.assignedReports}</td>
                    <td className="text-center py-3 px-4 text-emerald-600 font-semibold">{doctor.completedReports}</td>
                    <td className="text-center py-3 px-4 text-amber-600 font-semibold">{doctor.pendingReports}</td>
                    <td className="text-center py-3 px-4 text-violet-700 font-semibold">{doctor.completionRate}%</td>
                    <td className="text-center py-3 px-4 text-rose-600">
                      {doctor.averageReviewTimeHours > 0 ? `${doctor.averageReviewTimeHours.toFixed(1)}h` : "-"}
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
