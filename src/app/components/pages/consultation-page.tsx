import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Filter, Download, Eye, Loader2 } from "lucide-react";
import { api } from "@/app/services/api";
import { catalogService } from "@/app/services/catalog.service";
import { translateGender} from "@/app/utils/translations";

interface ConsultationPageProps {
  onNavigate: (page: string, reportId?: string) => void;
}

interface VaccinatedSubject {
  age: number;
  gender: string;
  isPregnant: boolean;
  provinceName: string;
  currentMedications: string;
  allergies: string;
  medicalHistory: string;
}

interface Report {
  id: string;
  notificationNumber: string;
  reportDate: string;
  status: string;
  globalSeverityLevel: string;
  vaccinatedSubject: VaccinatedSubject;
  vaccinesName: string[];
  adverseEventsName: string[];
  medicalReviewerName: string | null;
}

interface ApiResponse {
  items: Report[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  nextPageUrl?: string;
  previousPageUrl?: string;
}

export function ConsultationPage({ onNavigate }: ConsultationPageProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterVaccine, setFilterVaccine] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [vaccines, setVaccines] = useState<{id: string; name: string}[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Load vaccines and provinces
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vaccinesData, provincesData] = await Promise.all([
          catalogService.getVaccines(),
          catalogService.getProvinces()
        ]);
        setVaccines(vaccinesData || []);
        setProvinces(provincesData || []);
      } catch (error) {
        console.error('Error loading vaccines and provinces:', error);
      }
    };
    loadData();
  }, []);

  // Fetch reports from API
  useEffect(() => {
    fetchReports();
  }, [currentPage, filterVaccine, filterSeverity, filterStatus, filterProvince]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        PageNumber: currentPage.toString(),
        PageSize: itemsPerPage.toString(),
      });

      if (filterVaccine && filterVaccine !== "all") params.append("vaccineName", filterVaccine);
      if (filterSeverity && filterSeverity !== "all") params.append("severity", filterSeverity);
      if (filterStatus && filterStatus !== "all") params.append("reportStatus", filterStatus);
      if (filterProvince && filterProvince !== "all") params.append("provinceName", filterProvince);

      const response = await api.get<ApiResponse>(
        `/Report/admin/summary?${params.toString()}`
      );

      setReports(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      Serious: { bg: "#FEE2E2", text: "#DC2626", label: "Serio" },
      NonSerious: { bg: "#E8F5EB", text: "#2D7A3E", label: "No serio" }

    };
    const style = styles[severity] || { bg: "#F3F4F6", text: "#374151", label: severity || "No definida" };

    return (
      <Badge
        variant="secondary"
        className="font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      UnderReview: { bg: "#FEF3C7", text: "#D97706", label: "En Revisión" },
      Submitted: { bg: "#DBEAFE", text: "#1E40AF", label: "Enviado" },
      Approved: { bg: "#E8F5EB", text: "#2D7A3E", label: "Aprobado" },
      Rejected: { bg: "#FEE2E2", text: "#DC2626", label: "Rechazado" }
    };
    const statusStyle = statusMap[status] || statusMap.Submitted;

    return (
      <Badge
        variant="secondary"
        className="font-medium"
        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
      >
        {statusStyle.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Consulta de Reportes
          </h1>
          <p className="text-gray-600">
            Base de datos de eventos adversos reportados. Los datos son anónimos y con fines científicos.
          </p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Utilice los filtros para refinar su búsqueda de reportes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterVaccine">Vacuna</Label>
                <Select value={filterVaccine} onValueChange={(value) => {
                  setFilterVaccine(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todas las vacunas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las vacunas</SelectItem>
                    {vaccines.map((vaccine) => (
                      <SelectItem key={vaccine.id} value={vaccine.name}>
                        {vaccine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterSeverity">Severidad</Label>
                <Select value={filterSeverity} onValueChange={(value) => {
                  setFilterSeverity(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="NonSerious">No serio</SelectItem>
                    <SelectItem value="Serious">Serio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus">Estado</Label>
                <Select value={filterStatus} onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Submitted">Enviado</SelectItem>
                    <SelectItem value="UnderReview">En Revisión</SelectItem>
                    <SelectItem value="Approved">Aprobado</SelectItem>
                    <SelectItem value="Rejected">Rechazado</SelectItem>
                    <SelectItem value="Closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterProvince">Provincia</Label>
                <Select value={filterProvince} onValueChange={(value) => {
                  setFilterProvince(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-600">
                {totalCount} reportes encontrados
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Notificación</TableHead>
                    <TableHead className="font-semibold">Paciente</TableHead>
                    <TableHead className="font-semibold">Vacunas</TableHead>
                    <TableHead className="font-semibold">Eventos Adversos</TableHead>
                    <TableHead className="font-semibold">Severidad</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Médico Asignado</TableHead>
                    {/* <TableHead className="font-semibold">Acciones</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No hay reportes disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm font-medium">
                          <button
                            className="text-left text-sky-600 hover:text-sky-800 transition-colors"
                            onClick={() => onNavigate("detail", report.id)}
                          >
                            {report.notificationNumber}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{report.vaccinatedSubject.age} años, {translateGender(report.vaccinatedSubject.gender)}</div>
                          <div className="text-xs text-gray-500">{report.vaccinatedSubject.provinceName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {report.vaccinesName.map((vaccine) => (
                              <div key={vaccine} className="text-xs bg-blue-50 px-2 py-1 rounded mb-1">
                                {vaccine}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs">
                            {report.adverseEventsName.map((event) => (
                              <div key={event} className="text-xs bg-orange-50 px-2 py-1 rounded mb-1">
                                {event}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(report.globalSeverityLevel)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.medicalReviewerName ? (
                            <span className="font-medium">{report.medicalReviewerName}</span>
                          ) : (
                            <span className="text-gray-400 italic">Sin asignar</span>
                          )}
                        </TableCell>
                        {/* <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => onNavigate("detail", report.id)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                        </TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} - {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      style={page === currentPage ? { backgroundColor: "#0A4B8F" } : {}}
                      className={page === currentPage ? "text-white" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
