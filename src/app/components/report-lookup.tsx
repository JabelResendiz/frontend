import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Search, CheckCircle2, AlertCircle, Syringe, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/app/services/api";

interface ReportData {
  reportDate: string;
  status: string;
  vaccinatedSubject: {
    fullName: string;
  };
  vaccinations: Array<{
    vaccineName: string;
    vaccinationCenter: string;
  }>;
  adverseEvents: Array<{
    startDate: string;
    visitedDoctor: boolean;
    wentToEmergencyRoom: boolean;
    permanentDisability: boolean;
    isLifeThreatening: boolean;
    resultedInDeath: boolean;
    currentStatus: string;
  }>;
}

interface ReportLookupProps {
  onNavigate?: (page: string, reportId?: string) => void;
}

export function ReportLookup({ onNavigate }: ReportLookupProps) {
  const [notificationNumber, setNotificationNumber] = useState("");
  const [foundReport, setFoundReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!notificationNumber.trim()) {
      toast.error("Por favor ingrese un número de notificación");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Report/get-report", {
        params: {
          notificationNumber: notificationNumber.trim()
        }
      });

      if (response.data?.data) {
        setFoundReport(response.data.data);
        toast.success("Reporte encontrado exitosamente");
      } else {
        toast.error("No se encontraron datos en la respuesta");
        setFoundReport(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Error al buscar el reporte";
      setError(errorMessage);
      toast.error(errorMessage);
      setFoundReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      "Submitted": { bg: "#F0F9FF", text: "#0369A1", label: "Enviado" },
      "In Review": { bg: "#FEF3C7", text: "#D97706", label: "En Revisión" },
      "Reviewed": { bg: "#E8F5EB", text: "#2D7A3E", label: "Revisado" },
      "Completed": { bg: "#E8F5EB", text: "#2D7A3E", label: "Completado" }
    };

    const style = statusMap[status] || { bg: "#F3F4F6", text: "#6B7280", label: status };

    return (
      <Badge style={{ backgroundColor: style.bg, color: style.text }}>
        {style.label}
      </Badge>
    );
  };

  const getEventStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      "Recovered": { bg: "#E8F5EB", text: "#2D7A3E" },
      "Recovering": { bg: "#FEF3C7", text: "#D97706" },
      "Worsened": { bg: "#FEE2E2", text: "#DC2626" },
      "Fatal": { bg: "#7C2D12", text: "#FFFFFF" }
    };

    const style = statusMap[status] || { bg: "#F3F4F6", text: "#6B7280" };

    return (
      <Badge style={{ backgroundColor: style.bg, color: style.text }}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="flex items-center gap-2" style={{ color: "#0A4B8F" }}>
            <Search className="w-5 h-5" />
            Consultar Estado de Reporte
          </CardTitle>
          <CardDescription>
            Ingrese el número de notificación para ver el estado de su reporte de evento adverso
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {!foundReport ? (
            // Search Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-number">Número de Notificación</Label>
                <p className="text-xs text-gray-500">Formato: AEFI-YYYYMMDD-XXXXXXXXXX</p>
                <div className="flex gap-2">
                  <Input
                    id="notification-number"
                    placeholder="Ej: AEFI-20260428-LM28OQ1P"
                    value={notificationNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNotificationNumber(e.target.value)
                    }
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      e.key === "Enter" && handleSearch()
                    }
                    className="bg-white"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Buscando..." : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Ingrese el número de notificación que recibió por correo electrónico cuando 
                  completó su reporte. Podrá revisar el estado actual y los detalles de su caso.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            // Report Details
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notificación: {notificationNumber}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFoundReport(null);
                    setNotificationNumber("");
                    setError("");
                  }}
                >
                  Nueva Búsqueda
                </Button>
              </div>

              {/* Report Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado del Reporte</p>
                        <div className="mt-2">{getStatusBadge(foundReport.status)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fecha de Reporte</p>
                        <p className="text-sm font-semibold mt-1">
                          {formatDate(foundReport.reportDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vaccinated Subject Section */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#0A4B8F" }} />
                    Información del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-semibold">{foundReport.vaccinatedSubject.fullName}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Vaccinations Section */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Syringe className="w-5 h-5" style={{ color: "#0A4B8F" }} />
                    Vacunas Administradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foundReport.vaccinations && foundReport.vaccinations.length > 0 ? (
                    <div className="space-y-3">
                      {foundReport.vaccinations.map((vaccination, index) => (
                        <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                          <p className="font-medium">{vaccination.vaccineName}</p>
                          <p className="text-sm text-gray-600">
                            Centro: {vaccination.vaccinationCenter || "No especificado"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay información de vacunación</p>
                  )}
                </CardContent>
              </Card>

              {/* Adverse Events Section */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: "#DC2626" }} />
                    Eventos Adversos Reportados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foundReport.adverseEvents && foundReport.adverseEvents.length > 0 ? (
                    <div className="space-y-4">
                      {foundReport.adverseEvents.map((event, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Fecha de Inicio</p>
                              <p className="font-medium">{formatDate(event.startDate)}</p>
                            </div>
                            <div>{getEventStatusBadge(event.currentStatus)}</div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              {event.visitedDoctor ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {event.visitedDoctor
                                  ? "Visitó al médico"
                                  : "No visitó al médico"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {event.wentToEmergencyRoom ? (
                                <CheckCircle2 className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {event.wentToEmergencyRoom
                                  ? "Fue a emergencia"
                                  : "No fue a emergencia"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {event.permanentDisability ? (
                                <CheckCircle2 className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {event.permanentDisability
                                  ? "Discapacidad permanente"
                                  : "Sin discapacidad permanente"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {event.isLifeThreatening ? (
                                <CheckCircle2 className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {event.isLifeThreatening
                                  ? "Amenaza para la vida"
                                  : "Sin amenaza para la vida"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {event.resultedInDeath ? (
                                <CheckCircle2 className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>
                                {event.resultedInDeath
                                  ? "Resultó en muerte"
                                  : "Sin muerte"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay eventos adversos registrados</p>
                  )}
                </CardContent>
              </Card>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  Si tiene preguntas sobre su reporte o necesita reportar nuevos eventos adversos,
                  contacte al sistema de farmacovigilancia. Estamos comprometidos con su seguridad.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
