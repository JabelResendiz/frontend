"use client";

import React, { useMemo } from "react";
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
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import type { DoctorWorkload, BottleneckReport, ReviewMetrics, UrgentEvent } from "@/app/services/report.service";
import { AlertTriangle, Clock, Users, TrendingDown } from "lucide-react";

interface DoctorWorkloadChartProps {
  data: DoctorWorkload[];
  isLoading?: boolean;
}

interface BottleneckReportsProps {
  data: BottleneckReport[];
  isLoading?: boolean;
}

interface UrgentEventsProps {
  data: UrgentEvent[];
  isLoading?: boolean;
}

interface ReviewMetricsProps {
  data: ReviewMetrics;
  isLoading?: boolean;
}

const COLORS = {
  primary: "#0A4B8F",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  secondary: "#8B5CF6",
};

// Doctor Workload & Saturation Chart
export function DoctorWorkloadChart({ data, isLoading = false }: DoctorWorkloadChartProps) {
  const chartData = useMemo(() => {
    return data.map(doc => ({
      name: doc.doctorName.split(" ").slice(0, 2).join(" "),
      assigned: doc.assignedReports,
      completed: doc.completedReports,
      pending: doc.pendingReports,
      saturation: ((doc.assignedReports / (doc.completedReports + doc.assignedReports + 1)) * 100).toFixed(0),
      isSaturated: doc.isSaturated,
    }));
  }, [data]);

  const saturatedDoctors = data.filter(d => d.isSaturated).length;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Carga de Médicos</CardTitle>
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
        <CardTitle>Carga de Trabajo de Médicos</CardTitle>
        <CardDescription>
          Reportes asignados, completados y pendientes por médico
        </CardDescription>
      </CardHeader>
      <CardContent>
        {saturatedDoctors > 0 && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              ⚠️ {saturatedDoctors} médico(s) con sobrecarga (&gt;80% capacidad)
            </AlertDescription>
          </Alert>
        )}

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: `2px solid ${COLORS.primary}`,
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="completed" fill={COLORS.success} name="Completados" />
            <Bar dataKey="pending" fill={COLORS.warning} name="Pendientes" />
            <Bar dataKey="assigned" fill={COLORS.info} name="Asignados" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((doctor, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-l-4 ${
                doctor.isSaturated
                  ? "bg-red-50 border-red-500"
                  : "bg-gray-50 border-green-500"
              }`}
            >
              <p className="text-xs font-bold text-gray-700 truncate">
                {doctor.doctorName.split(" ").slice(0, 2).join(" ")}
              </p>
              <p className={`text-lg font-bold mt-1 ${
                doctor.isSaturated ? "text-red-600" : "text-green-600"
              }`}>
                {doctor.assignedReports}
              </p>
              <p className="text-xs text-gray-500">
                {doctor.completedReports} completados
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Bottleneck Reports
export function BottleneckReportsChart({ data, isLoading = false }: BottleneckReportsProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Reportes Atrasados</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  const critical = data.filter(r => r.severity === 'critical').length;
  const high = data.filter(r => r.severity === 'high').length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Cuellos de Botella - Reportes Atrasados</CardTitle>
        <CardDescription>
          {data.length} reportes pendientes por más de lo esperado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(critical > 0 || high > 0) && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              🚨 {critical} críticos, {high} de alta prioridad requieren atención inmediata
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sin reportes atrasados 👍</p>
          ) : (
            data.map((report, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  report.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : report.severity === 'high'
                    ? 'bg-orange-50 border-orange-500'
                    : report.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {report.vaccinatedPersonName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {report.vaccineName} • {report.daysPending} días pendiente
                    </p>
                    {report.assignedDoctor && (
                      <p className="text-xs text-gray-500 mt-1">
                        Asignado a: {report.assignedDoctor}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      report.severity === 'critical'
                        ? 'bg-red-200 text-red-800'
                        : report.severity === 'high'
                        ? 'bg-orange-200 text-orange-800'
                        : report.severity === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {report.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Urgent Events / Critical Cases
export function UrgentEventsChart({ data, isLoading = false }: UrgentEventsProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Eventos Urgentes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  const deaths = data.filter(e => e.eventType === 'death').length;
  const lifeThreatening = data.filter(e => e.eventType === 'life-threatening').length;
  const emergency = data.filter(e => e.eventType === 'emergency').length;

  const pendingUrgent = data.filter(e => e.status === 'pending').length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Eventos Que Requieren Atención Urgente</CardTitle>
        <CardDescription>
          Casos críticos: defunciones, amenazas de vida, emergencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(deaths > 0 || lifeThreatening > 0) && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              ⚠️ {deaths} defunciones, {lifeThreatening} amenazas de vida
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-gray-600 font-semibold">Defunciones</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{deaths}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-gray-600 font-semibold">Amenaza de Vida</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{lifeThreatening}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-600 font-semibold">Emergencias</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{emergency}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-semibold">Pendientes</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{pendingUrgent}</p>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sin eventos urgentes registrados 👍</p>
          ) : (
            data.map((event, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  event.eventType === 'death'
                    ? 'bg-red-50 border-red-500'
                    : event.eventType === 'life-threatening'
                    ? 'bg-orange-50 border-orange-500'
                    : event.eventType === 'emergency'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {event.patientName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{event.event}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reportado: {new Date(event.reportedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded block mb-2 ${
                      event.eventType === 'death'
                        ? 'bg-red-200 text-red-800'
                        : event.eventType === 'life-threatening'
                        ? 'bg-orange-200 text-orange-800'
                        : event.eventType === 'emergency'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {event.eventType.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      event.status === 'pending'
                        ? 'bg-red-100 text-red-700'
                        : event.status === 'in-review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {event.status === 'pending' ? '⏳ PENDIENTE' : event.status === 'in-review' ? '📋 EN REVISIÓN' : '✅ REVISADO'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Review Metrics - Speed Analysis
export function ReviewMetricsChart({ data, isLoading = false }: ReviewMetricsProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Velocidad de Revisión</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  const metricsData = [
    {
      label: 'Promedio',
      value: data.avgReviewTime.toFixed(1),
      icon: Clock,
      color: COLORS.info,
    },
    {
      label: 'Mediana',
      value: data.medianReviewTime.toFixed(1),
      icon: Clock,
      color: COLORS.primary,
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Velocidad de Revisión de Reportes</CardTitle>
        <CardDescription>Tiempo promedio en horas desde asignación hasta revisión</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-gray-600">Promedio de Revisión</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {data.avgReviewTime.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">horas desde asignación</p>
            </div>

            <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
              <p className="text-sm text-gray-600">Mediana</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {data.medianReviewTime.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">tiempo típico</p>
            </div>

            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm text-gray-600">Más Rápido</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {data.fastestDoctor.name}
              </p>
              <p className="text-xs text-gray-500">
                {data.fastestDoctor.time.toFixed(1)}h
              </p>
            </div>

            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-gray-600">Más Lento</p>
              <p className="text-lg font-bold text-red-600 mt-1">
                {data.slowestDoctor.name}
              </p>
              <p className="text-xs text-gray-500">
                {data.slowestDoctor.time.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">💡 Recomendaciones</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Mantén promedio &lt; 24h para revisiones ágiles</li>
              <li>✓ Identifica médicos lentos para capacitación</li>
              <li>✓ Aprende de los médicos rápidos</li>
              <li>✓ Reportes críticos: máximo 4-6h</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
