import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Search, Plus, Edit2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { toast } from "sonner";

// Mock data for reports
const mockReportsDatabase = [
  {
    id: "RPT-2026-0142",
    date: "2026-01-24",
    vaccine: "Soberana 02",
    status: "en-revisión",
    severity: "leve",
    outcome: "recuperado",
    patientName: "María Rodríguez García",
    patientEmail: "maria.rodriguez@email.com",
    patientPhone: "+53-5-123-4567",
    patientAddress: "Calle 5 #123, La Habana",
    symptoms: ["Dolor sitio inyección", "Fiebre leve"],
    description: "Se reporta reacción leve en el sitio de inyección con fiebre moderada.",
    adverseEvents: [
      {
        id: "AE-001",
        date: "2026-01-24",
        event: "Dolor en sitio de inyección",
        severity: "leve",
        resolved: true
      }
    ]
  },
  {
    id: "RPT-2026-0141",
    date: "2026-01-23",
    vaccine: "Abdala",
    status: "completado",
    severity: "moderado",
    outcome: "recuperando",
    patientName: "Juan Pérez López",
    patientEmail: "juan.perez@email.com",
    patientPhone: "+53-5-234-5678",
    patientAddress: "Avenida Principal #456, Santiago",
    symptoms: ["Fiebre alta", "Fatiga", "Dolor muscular"],
    description: "Se reporta fiebre alta con síntomas sistémicos post-vacunación.",
    adverseEvents: [
      {
        id: "AE-001",
        date: "2026-01-23",
        event: "Fiebre alta",
        severity: "moderado",
        resolved: false
      },
      {
        id: "AE-002",
        date: "2026-01-23",
        event: "Dolor muscular",
        severity: "moderado",
        resolved: false
      }
    ]
  },
  {
    id: "RPT-2026-0140",
    date: "2026-01-22",
    vaccine: "Soberana Plus",
    status: "completado",
    severity: "leve",
    outcome: "recuperado",
    patientName: "Carmen González Martínez",
    patientEmail: "carmen.gonzalez@email.com",
    patientPhone: "+53-5-345-6789",
    patientAddress: "Calle 10 #789, Villa Clara",
    symptoms: ["Dolor de cabeza", "Fatiga"],
    description: "Reporte de síntomas leves después de la vacunación.",
    adverseEvents: [
      {
        id: "AE-001",
        date: "2026-01-22",
        event: "Dolor de cabeza",
        severity: "leve",
        resolved: true
      }
    ]
  }
];

interface Report {
  id: string;
  date: string;
  vaccine: string;
  status: "en-revisión" | "completado" | "pendiente";
  severity: string;
  outcome: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  symptoms: string[];
  description: string;
  adverseEvents: Array<{
    id: string;
    date: string;
    event: string;
    severity: string;
    resolved: boolean;
  }>;
}

interface ReportLookupProps {
  onNavigate?: (page: string, reportId?: string) => void;
}

export function ReportLookup({ onNavigate }: ReportLookupProps) {
  const [searchId, setSearchId] = useState("");
  const [foundReport, setFoundReport] = useState<Report | null>(null);
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [editedContact, setEditedContact] = useState({
    email: "",
    phone: "",
    address: ""
  });
  const [addingAdverseEvent, setAddingAdverseEvent] = useState(false);
  const [newAdverseEvent, setNewAdverseEvent] = useState({
    event: "",
    severity: "leve",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast.error("Por favor ingrese un número de reporte");
      return;
    }

    const foundData = mockReportsDatabase.find(r => 
      r.id.toUpperCase() === searchId.toUpperCase()
    );

    if (foundData) {
      const report: Report = {
        ...foundData,
        status: foundData.status as "en-revisión" | "completado" | "pendiente"
      };
      setFoundReport(report);
      setEditedContact({
        email: report.patientEmail,
        phone: report.patientPhone,
        address: report.patientAddress
      });
    } else {
      toast.error("Reporte no encontrado");
      setFoundReport(null);
    }
  };

  const handleUpdateContact = () => {
    if (foundReport) {
      foundReport.patientEmail = editedContact.email;
      foundReport.patientPhone = editedContact.phone;
      foundReport.patientAddress = editedContact.address;
      setEditingContactInfo(false);
      toast.success("Información de contacto actualizada correctamente");
    }
  };

  const handleAddAdverseEvent = () => {
    if (!newAdverseEvent.event.trim()) {
      toast.error("Por favor describa el evento adverso");
      return;
    }

    if (foundReport) {
      const event = {
        id: `AE-${foundReport.adverseEvents.length + 1}`,
        date: newAdverseEvent.date,
        event: newAdverseEvent.event,
        severity: newAdverseEvent.severity,
        resolved: false
      };

      foundReport.adverseEvents.push(event);
      setNewAdverseEvent({ event: "", severity: "leve", date: new Date().toISOString().split('T')[0] });
      setAddingAdverseEvent(false);
      toast.success("Evento adverso agregado correctamente");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      "en-revisión": { bg: "#FEF3C7", text: "#D97706", label: "En Revisión" },
      "completado": { bg: "#E8F5EB", text: "#2D7A3E", label: "Completado" },
      "pendiente": { bg: "#F0F9FF", text: "#0369A1", label: "Pendiente" }
    };
    const style = styles[status] || styles.pendiente;

    return (
      <Badge 
        variant="secondary"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      "leve": { bg: "#E8F5EB", text: "#2D7A3E" },
      "moderado": { bg: "#FEF3C7", text: "#D97706" },
      "severo": { bg: "#FEE2E2", text: "#DC2626" }
    };
    const style = styles[severity] || styles.leve;

    return (
      <Badge 
        variant="secondary"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getOutcomeIcon = (outcome: string) => {
    if (outcome === "recuperado") {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    } else if (outcome === "recuperando") {
      return <Clock className="w-4 h-4 text-orange-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="flex items-center gap-2" style={{ color: "#0A4B8F" }}>
            <Search className="w-5 h-5" />
            Consultar Mi Reporte
          </CardTitle>
          <CardDescription>
            Ingrese el número de su reporte para ver el estado y hacer seguimiento
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {!foundReport ? (
            // Search Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-id">Número de Reporte</Label>
                <div className="flex gap-2">
                  <Input
                    id="report-id"
                    placeholder="Ej: RPT-2026-0142"
                    value={searchId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                    className="bg-white"
                  />
                  <Button 
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Ingrese el número de reporte que recibió cuando completó el formulario inicial. 
                  Puede revisar el estado y realizar seguimiento de su caso.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            // Report Details
            <Tabs defaultValue="estado" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estado">Estado del Reporte</TabsTrigger>
                <TabsTrigger value="eventos">Eventos Adversos</TabsTrigger>
                <TabsTrigger value="contacto">Mi Información</TabsTrigger>
              </TabsList>

              {/* Tab 1: Report Status */}
              <TabsContent value="estado" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">ID: {foundReport.id}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFoundReport(null)}
                  >
                    Realizar otra búsqueda
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Estado del Reporte</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(foundReport.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Fecha de Reporte</Label>
                    <p className="text-sm font-medium">
                      {new Date(foundReport.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Vacuna Administrada</Label>
                    <p className="text-sm font-medium">{foundReport.vaccine}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Severidad del Evento</Label>
                    {getSeverityBadge(foundReport.severity)}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600">Resultado</Label>
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(foundReport.outcome)}
                      <span className="text-sm font-medium capitalize">
                        {foundReport.outcome === "recuperado" ? "Recuperado" : 
                         foundReport.outcome === "recuperando" ? "En recuperación" : 
                         "Pendiente de seguimiento"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción del Evento</h4>
                  <p className="text-sm text-gray-700">{foundReport.description}</p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    Si necesita realizar cambios o agregar más información sobre su reporte, 
                    puede hacerlo en las otras pestañas.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Tab 2: Adverse Events */}
              <TabsContent value="eventos" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Eventos Adversos Reportados</h3>
                  <Dialog open={addingAdverseEvent} onOpenChange={setAddingAdverseEvent}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Evento Adverso</DialogTitle>
                        <DialogDescription>
                          Reporte un nuevo evento adverso relacionado con su vacunación
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date">Fecha del Evento</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newAdverseEvent.date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdverseEvent({
                              ...newAdverseEvent,
                              date: e.target.value
                            })}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-description">Descripción del Evento</Label>
                          <Textarea
                            id="event-description"
                            placeholder="Describa detalladamente el evento adverso..."
                            value={newAdverseEvent.event}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewAdverseEvent({
                              ...newAdverseEvent,
                              event: e.target.value
                            })}
                            className="bg-white"
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-severity">Severidad</Label>
                          <Select 
                            value={newAdverseEvent.severity}
                            onValueChange={(value: string) => setNewAdverseEvent({
                              ...newAdverseEvent,
                              severity: value
                            })}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leve">Leve</SelectItem>
                              <SelectItem value="moderado">Moderado</SelectItem>
                              <SelectItem value="severo">Severo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleAddAdverseEvent}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Guardar Evento
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {foundReport.adverseEvents.length > 0 ? (
                  <div className="space-y-3">
                    {foundReport.adverseEvents.map((event) => (
                      <Card key={event.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{event.event}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(event.date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(event.severity)}
                              {event.resolved && (
                                <Badge className="bg-green-100 text-green-800">
                                  Resuelto
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No hay eventos adversos adicionales reportados. 
                      Puede agregar eventos si experimenta síntomas nuevos.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Tab 3: Contact Information */}
              <TabsContent value="contacto" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Información de Contacto</h3>
                  <Button 
                    size="sm"
                    variant={editingContactInfo ? "outline" : "default"}
                    onClick={() => {
                      if (editingContactInfo) {
                        handleUpdateContact();
                      } else {
                        setEditingContactInfo(true);
                      }
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {editingContactInfo ? "Guardar" : "Editar"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Nombre del Paciente</Label>
                    <p className="text-sm font-medium">{foundReport.patientName}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Correo Electrónico</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      disabled={!editingContactInfo}
                      value={editedContact.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContact({
                        ...editedContact,
                        email: e.target.value
                      })}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Teléfono</Label>
                    <Input
                      id="patient-phone"
                      type="tel"
                      disabled={!editingContactInfo}
                      value={editedContact.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedContact({
                        ...editedContact,
                        phone: e.target.value
                      })}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-address">Dirección</Label>
                    <Textarea
                      id="patient-address"
                      disabled={!editingContactInfo}
                      value={editedContact.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedContact({
                        ...editedContact,
                        address: e.target.value
                      })}
                      className="bg-white"
                      rows={3}
                    />
                  </div>
                </div>

                <Alert className="border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    Su información de contacto es importante para que podamos hacer seguimiento 
                    a su reporte y mantenerlo informado del estado.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
