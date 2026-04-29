import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ReportStatusTimeline, ReportStatus } from "@/app/components/ui/report-status-timeline";
import { Search, AlertCircle, CheckCircle2, Calendar, User, Syringe } from "lucide-react";
import { reportService } from "@/app/services/report.service";
import { toast } from "sonner";

interface TrackReportPageProps {
  onNavigate: (page: string) => void;
}

interface ReportData {
  notificationNumber: string;
  reportDate: string;
  status: ReportStatus;
  vaccinatedSubject: {
    fullName: string;
  };
  vaccinations: Array<{
    vaccineName: string;
    vaccinationCenter: string;
  }>;
  statusHistory?: Array<{
    status: ReportStatus;
    date: string;
    comments?: string;
  }>;
}

export function TrackReportPage({ onNavigate }: TrackReportPageProps) {
  const [notificationNumber, setNotificationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  // Función para mapear string del backend al enum ReportStatus
  const mapStatusStringToEnum = (statusString: string): ReportStatus => {
    const statusMap: Record<string, ReportStatus> = {
      "Draft": ReportStatus.Draft,
      "Submitted": ReportStatus.Submitted,
      "UnderReview": ReportStatus.UnderReview,
      "Approved": ReportStatus.Approved,
      "Rejected": ReportStatus.Rejected,
      "Closed": ReportStatus.Closed
    };
    return statusMap[statusString] ?? ReportStatus.Draft;
  };

  // Función para generar historial de estados basado en el estado actual
  const generateStatusHistory = (currentStatus: ReportStatus, reportDate: string): Array<{
    status: ReportStatus;
    date: string;
    comments?: string;
  }> => {
    const history = [];
    const reportDateObj = new Date(reportDate);

    // Siempre incluir Draft como primer estado
    history.push({
      status: ReportStatus.Draft,
      date: new Date(reportDateObj.getTime() - 3600000).toISOString(), // 1 hora antes
      comments: "Reporte creado por el usuario"
    });

    // Agregar estados hasta el actual
    const statusOrder = [
      { status: ReportStatus.Submitted, comment: "Reporte enviado al sistema" },
      { status: ReportStatus.UnderReview, comment: "En revisión por profesional de farmacovigilancia" },
      { status: ReportStatus.Approved, comment: "Reporte validado y aprobado" },
      { status: ReportStatus.Rejected, comment: "Reporte rechazado por datos incorrectos" },
      { status: ReportStatus.Closed, comment: "Caso finalizado" }
    ];

    for (const statusItem of statusOrder) {
      if (statusItem.status <= currentStatus) {
        const dateOffset = (statusItem.status - ReportStatus.Submitted + 1) * 24 * 60 * 60 * 1000; // días
        history.push({
          status: statusItem.status,
          date: new Date(reportDateObj.getTime() + dateOffset).toISOString(),
          comments: statusItem.comment
        });
      }
    }

    return history;
  };

  const handleSearch = async () => {
    if (!notificationNumber.trim()) {
      toast.error("Por favor ingrese un número de notificación");
      return;
    }

    setLoading(true);
    setError("");
    setReportData(null);

    try {
      // Real API call
      const response = await reportService.getReportByNotificationNumber(notificationNumber.trim());

      // Procesar la respuesta del backend como la que describes
      const backendData = response.data;
      const currentStatus = mapStatusStringToEnum(backendData.status);
      const statusHistory = generateStatusHistory(currentStatus, backendData.reportDate);

      const processedReportData: ReportData = {
        notificationNumber: notificationNumber.trim(),
        reportDate: backendData.reportDate,
        status: currentStatus,
        vaccinatedSubject: backendData.vaccinatedSubject,
        vaccinations: backendData.vaccinations,
        statusHistory: statusHistory
      };

      setReportData(processedReportData);
      toast.success("Reporte encontrado");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al buscar el reporte";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => onNavigate("home")}
          >
            ← Volver al Inicio
          </Button>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Seguimiento de Reporte
          </h1>
          <p className="text-gray-600">
            Ingrese su número de notificación para consultar el estado de su reporte
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Reporte
            </CardTitle>
            <CardDescription>
              Use el número de notificación que recibió después de enviar su reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: AEFI-20260429-J6RH68EL"
                value={notificationNumber}
                onChange={(e) => setNotificationNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                style={{ backgroundColor: "#0A4B8F" }}
                className="text-white"
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Report Details */}
        {reportData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-lg border-l-4" style={{ borderLeftColor: "#0A4B8F" }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Reporte Encontrado
                    </CardTitle>
                    <CardDescription>
                      Número de notificación:{" "}
                      <span className="font-mono font-bold text-gray-900">
                        {reportData.notificationNumber}
                      </span>
                    </CardDescription>
                  </div>
                  <span className="text-xs text-gray-500">
                    Fecha del reporte:{" "}
                    {new Date(reportData.reportDate).toLocaleString("es-ES")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paciente</p>
                      <p className="text-sm font-medium">{reportData.vaccinatedSubject.fullName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Vacunas Administradas</p>
                      {reportData.vaccinations.map((vaccination, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{vaccination.vaccineName}</span>
                          {vaccination.vaccinationCenter && (
                            <span className="text-gray-600"> - {vaccination.vaccinationCenter}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline - PRINCIPAL FEATURE - INICIO */}
            <Card className="border-0 shadow-lg border-t-4" style={{ borderTopColor: "#0A4B8F" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Estado del Reporte
                </CardTitle>
                <CardDescription>
                  Línea de tiempo que muestra el progreso de su reporte a través de los diferentes estados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportStatusTimeline
                  currentStatus={reportData.status}
                  statusHistory={reportData.statusHistory}
                />
              </CardContent>
            </Card>

            {/* Current Status Highlight */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Estado Actual: {
                        reportData.status === ReportStatus.Draft ? "Borrador" :
                        reportData.status === ReportStatus.Submitted ? "Enviado" :
                        reportData.status === ReportStatus.UnderReview ? "En Revisión" :
                        reportData.status === ReportStatus.Approved ? "Aprobado" :
                        reportData.status === ReportStatus.Rejected ? "Rechazado" :
                        reportData.status === ReportStatus.Closed ? "Cerrado" : "Desconocido"
                      }
                    </h3>
                    <p className="text-sm text-blue-700">
                      Su reporte se encuentra actualmente en esta fase del proceso de evaluación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-700">
                <strong>¿Qué significa cada estado?</strong>
                <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                  <li>
                    <strong>Borrador:</strong> El usuario está completando el reporte
                  </li>
                  <li>
                    <strong>Enviado:</strong> Reporte enviado por el reportero
                  </li>
                  <li>
                    <strong>En Revisión:</strong> En revisión por un médico/revisor
                  </li>
                  <li>
                    <strong>Aprobado:</strong> Validado y aprobado
                  </li>
                  <li>
                    <strong>Rechazado:</strong> Rechazado (datos incorrectos)
                  </li>
                  <li>
                    <strong>Cerrado:</strong> Caso finalizado
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Contact Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="text-base">¿Preguntas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">
                  Si tiene preguntas sobre el estado de su reporte, puede contactarnos:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:farmacovigilancia@finlay.cu" className="text-blue-600 hover:underline">
                      farmacovigilancia@finlay.cu
                    </a>
                  </li>
                  <li>
                    <strong>Teléfono:</strong>{" "}
                    <a href="tel:+53-7-2690600" className="text-blue-600 hover:underline">
                      +53 (7) 2690600
                    </a>
                  </li>
                  <li>
                    <strong>Horario de atención:</strong> Lunes a viernes, 8:00 AM - 5:00 PM
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!reportData && !error && notificationNumber === "" && (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Comience a buscar
              </h3>
              <p className="text-gray-600">
                Ingrese su número de notificación para ver el estado de su reporte
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
