import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Search, Filter, Download, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ConsultationPageProps {
  onNavigate: (page: string, reportId?: string) => void;
}

// Mock data for demonstration
const mockReports = [
  {
    id: "RPT-2026-0142",
    date: "2026-01-24",
    vaccine: "Soberana 02",
    age: 45,
    gender: "F",
    severity: "leve",
    outcome: "recuperado",
    province: "La Habana",
    symptoms: "Dolor sitio inyección, Fiebre leve"
  },
  {
    id: "RPT-2026-0141",
    date: "2026-01-23",
    vaccine: "Abdala",
    age: 32,
    gender: "M",
    severity: "moderado",
    outcome: "recuperando",
    province: "Santiago de Cuba",
    symptoms: "Fiebre alta, Fatiga, Dolor muscular"
  },
  {
    id: "RPT-2026-0140",
    date: "2026-01-22",
    vaccine: "Soberana Plus",
    age: 67,
    gender: "F",
    severity: "leve",
    outcome: "recuperado",
    province: "Villa Clara",
    symptoms: "Dolor de cabeza, Fatiga"
  },
  {
    id: "RPT-2026-0139",
    date: "2026-01-22",
    vaccine: "Heberpenta-L",
    age: 2,
    gender: "M",
    severity: "leve",
    outcome: "recuperado",
    province: "Matanzas",
    symptoms: "Fiebre, Irritabilidad"
  },
  {
    id: "RPT-2026-0138",
    date: "2026-01-21",
    vaccine: "Soberana 02",
    age: 54,
    gender: "M",
    severity: "moderado",
    outcome: "recuperado",
    province: "Holguín",
    symptoms: "Fiebre, Escalofríos, Náuseas"
  },
  {
    id: "RPT-2026-0137",
    date: "2026-01-20",
    vaccine: "vABC",
    age: 15,
    gender: "F",
    severity: "leve",
    outcome: "recuperado",
    province: "Camagüey",
    symptoms: "Dolor sitio inyección"
  },
  {
    id: "RPT-2026-0136",
    date: "2026-01-19",
    vaccine: "Abdala",
    age: 41,
    gender: "F",
    severity: "leve",
    outcome: "recuperado",
    province: "Pinar del Río",
    symptoms: "Fatiga, Dolor muscular"
  },
  {
    id: "RPT-2026-0135",
    date: "2026-01-18",
    vaccine: "Soberana 02",
    age: 38,
    gender: "M",
    severity: "severo",
    outcome: "recuperado",
    province: "La Habana",
    symptoms: "Reacción alérgica, Dificultad respiratoria"
  },
];

export function ConsultationPage({ onNavigate }: ConsultationPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVaccine, setFilterVaccine] = useState("todos");
  const [filterSeverity, setFilterSeverity] = useState("todos");
  const [filterProvince, setFilterProvince] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter reports
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVaccine = filterVaccine === "todos" || report.vaccine === filterVaccine;
    const matchesSeverity = filterSeverity === "todos" || report.severity === filterSeverity;
    const matchesProvince = filterProvince === "todos" || report.province === filterProvince;
    
    return matchesSearch && matchesVaccine && matchesSeverity && matchesProvince;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const getSeverityBadge = (severity: string) => {
    const styles = {
      leve: { bg: "#E8F5EB", text: "#2D7A3E", label: "Leve" },
      moderado: { bg: "#FEF3C7", text: "#D97706", label: "Moderado" },
      severo: { bg: "#FEE2E2", text: "#DC2626", label: "Severo" }
    };
    const style = styles[severity as keyof typeof styles] || styles.leve;
    
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

  const getOutcomeIcon = (outcome: string) => {
    if (outcome === "recuperado") {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    } else if (outcome === "recuperando") {
      return <Clock className="w-4 h-4 text-orange-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Búsqueda por ID o Síntomas</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterVaccine">Vacuna</Label>
                <Select value={filterVaccine} onValueChange={setFilterVaccine}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las vacunas</SelectItem>
                    <SelectItem value="Soberana 02">Soberana 02</SelectItem>
                    <SelectItem value="Soberana Plus">Soberana Plus</SelectItem>
                    <SelectItem value="Abdala">Abdala</SelectItem>
                    <SelectItem value="Heberpenta-L">Heberpenta-L</SelectItem>
                    <SelectItem value="vABC">vABC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterSeverity">Severidad</Label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="severo">Severo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterProvince">Provincia</Label>
                <Select value={filterProvince} onValueChange={setFilterProvince}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="La Habana">La Habana</SelectItem>
                    <SelectItem value="Santiago de Cuba">Santiago de Cuba</SelectItem>
                    <SelectItem value="Villa Clara">Villa Clara</SelectItem>
                    <SelectItem value="Holguín">Holguín</SelectItem>
                    <SelectItem value="Camagüey">Camagüey</SelectItem>
                    <SelectItem value="Pinar del Río">Pinar del Río</SelectItem>
                    <SelectItem value="Matanzas">Matanzas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-600">
                {filteredReports.length} reportes encontrados
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
                    <TableHead className="font-semibold">ID Reporte</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Vacuna</TableHead>
                    <TableHead className="font-semibold">Edad/Sexo</TableHead>
                    <TableHead className="font-semibold">Provincia</TableHead>
                    <TableHead className="font-semibold">Severidad</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-medium">
                        {report.id}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(report.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{report.vaccine}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {report.age} años / {report.gender}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {report.province}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(report.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getOutcomeIcon(report.outcome)}
                          <span className="text-sm text-gray-600 capitalize">
                            {report.outcome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onNavigate("detail", report.id)}
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReports.length)} de {filteredReports.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
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
                    disabled={currentPage === totalPages}
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
