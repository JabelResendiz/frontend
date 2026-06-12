"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import type { DoctorReportStats, ReportsSummary, VaccineStats } from "@/app/services/report.service";

interface TopDoctorsChartProps {
  data: DoctorReportStats[];
  isLoading?: boolean;
}

interface ReportsSummaryChartProps {
  data: ReportsSummary;
  isLoading?: boolean;
}

interface VaccineStatsChartProps {
  data: VaccineStats[];
  isLoading?: boolean;
}

// Color palette for charts
const COLORS = {
  primary: "#0A4B8F",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  secondary: "#8B5CF6",
};

const CHART_COLORS = [
  COLORS.primary,
  "#1E5A96",
  "#4A90C2",
  "#7BA8D1",
  "#A0C9E8",
];

export function TopDoctorsChart({ data, isLoading = false }: TopDoctorsChartProps) {
  const chartData = useMemo(() => {
    return data.slice(0, 10).map(doc => ({
      name: doc.doctorName.split(" ").slice(0, 2).join(" "),
      completados: doc.completedReports,
      pendientes: doc.pendingReports,
      tasa: parseFloat(doc.completionRate.toFixed(0)),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Médicos</CardTitle>
          <CardDescription>Ordenados por reportes completados</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Top 10 Médicos por Reportes Completados</CardTitle>
        <CardDescription>
          Médicos con mayor cantidad de reportes completados en tu sección
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: `2px solid ${COLORS.primary}`,
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="completados" fill={COLORS.success} name="Completados" />
            <Bar dataKey="pendientes" fill={COLORS.warning} name="Pendientes" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartData.map((doctor, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">{doctor.name}</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {doctor.completados}
              </p>
              <p className="text-xs text-gray-500">reportes completados</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsSummaryChart({ data, isLoading = false }: ReportsSummaryChartProps) {
  const pieData = useMemo(() => [
    { name: "Completados", value: data.completedReports, fill: COLORS.success },
    { name: "Pendientes", value: data.pendingReports, fill: COLORS.warning },
    { name: "Expirados", value: data.expiredReports, fill: COLORS.danger },
  ].filter(item => item.value > 0), [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Reportes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Estado General de Reportes</CardTitle>
        <CardDescription>
          Total de {data.totalReports} reportes en tu municipio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="p-4 bg-green-50 border-l-4" style={{ borderColor: COLORS.success }}>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
                {data.completedReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(data.totalReports > 0 ? ((data.completedReports / data.totalReports) * 100).toFixed(1) : 0)}%
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4" style={{ borderColor: COLORS.warning }}>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>
                {data.pendingReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(data.totalReports > 0 ? ((data.pendingReports / data.totalReports) * 100).toFixed(1) : 0)}%
              </p>
            </div>

            <div className="p-4 bg-red-50 border-l-4" style={{ borderColor: COLORS.danger }}>
              <p className="text-sm text-gray-600">Expirados</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.danger }}>
                {data.expiredReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(data.totalReports > 0 ? ((data.expiredReports / data.totalReports) * 100).toFixed(1) : 0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VaccineStatsChart({ data, isLoading = false }: VaccineStatsChartProps) {
  const chartData = useMemo(() => {
    return data.slice(0, 8).map(vaccine => ({
      name: vaccine.vaccineName.length > 15 
        ? vaccine.vaccineName.substring(0, 15) + "..." 
        : vaccine.vaccineName,
      reportes: vaccine.totalReports,
      eventos: vaccine.adverseEventsCount,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas de Vacunas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Vacunas y Eventos Adversos</CardTitle>
        <CardDescription>
          Distribución de reportes por vacuna y eventos adversos registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="reportes" fill={COLORS.info} name="Reportes" />
            <Bar yAxisId="right" dataKey="eventos" fill={COLORS.danger} name="Eventos Adversos" />
          </BarChart>
        </ResponsiveContainer>

        {/* Top Vaccines List */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Vacunas con Más Reportes</h4>
          <div className="space-y-2">
            {data.slice(0, 5).map((vaccine, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{vaccine.vaccineName}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                  {vaccine.totalReports} reportes
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletionRateChart({ data, isLoading = false }: ReportsSummaryChartProps) {
  const rateData = useMemo(() => {
    const rate = data.totalReports > 0 
      ? ((data.completedReports / data.totalReports) * 100) 
      : 0;
    
    return [
      { name: "Completado", value: rate },
      { name: "Pendiente", value: 100 - rate }
    ];
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Tasa de Completación</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Tasa de Completación Global</CardTitle>
        <CardDescription>
          Porcentaje de reportes completados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rateData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.warning} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 text-center">
            <p className="text-4xl font-bold" style={{ color: COLORS.primary }}>
              {data.totalReports > 0 
                ? ((data.completedReports / data.totalReports) * 100).toFixed(1) 
                : 0}%
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {data.completedReports} de {data.totalReports} reportes completados
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
