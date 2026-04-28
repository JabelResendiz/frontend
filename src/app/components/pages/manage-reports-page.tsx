import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";

interface Report {
  id: string;
  name: string;
  email: string;
  province: string;
  municipality: string;
  specialty: string;
}

interface ManageReportsPageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

const PROVINCES = Object.keys(PROVINCES_AND_MUNICIPALITIES).sort();

export function ManageReportsPage({ onNavigate }: ManageReportsPageProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    province: "",
    municipality: "",
    specialty: "",
  });

  const handleAddReport = () => {
    if (!formData.name || !formData.email || !formData.province) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    if (editingId) {
      setReports(reports.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Reporte actualizado exitosamente");
    } else {
      setReports([...reports, { id: Date.now().toString(), ...formData }]);
      toast.success("Reporte agregado exitosamente");
    }

    setFormData({ name: "", email: "", province: "", municipality: "", specialty: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (report: Report) => {
    setFormData(report);
    setEditingId(report.id);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setReports(reports.filter(d => d.id !== deleteConfirm));
      toast.success("Reporte eliminado exitosamente");
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", province: "", municipality: "", specialty: "" });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
                Gestionar Reportes
              </h1>
              <p className="text-gray-600">
                Administra los reportes asignados a tu municipio
              </p>
            </div>
            {!showForm && (
              <Button
                className="text-white font-semibold px-6 py-3"
                style={{ backgroundColor: "#0A4B8F" }}
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Reporte
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Reporte" : "Agregar Nuevo Reporte"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value, municipality: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="municipality">Municipio</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                    disabled={!formData.province}
                  >
                    <SelectTrigger disabled={!formData.province}>
                      <SelectValue placeholder={formData.province ? "Selecciona municipio" : "Selecciona provincia primero"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.province && getMunicipalitiesByProvince(formData.province).map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  placeholder="Ej: Pediatría, Cardiología, etc."
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleAddReport}
                >
                  {editingId ? "Actualizar" : "Agregar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No hay reportes agregados aún</p>
                {!showForm && (
                  <Button
                    className="text-white font-semibold"
                    style={{ backgroundColor: "#0A4B8F" }}
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar Primer Reporte
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span> {report.email}
                          </div>
                          <div>
                            <span className="font-medium">Provincia:</span> {report.province}
                          </div>
                          {report.municipality && (
                            <div>
                              <span className="font-medium">Municipio:</span> {report.municipality}
                            </div>
                          )}
                          {report.specialty && (
                            <div>
                              <span className="font-medium">Especialidad:</span> {report.specialty}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Reporte</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este Reporte? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
