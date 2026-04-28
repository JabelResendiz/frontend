import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { FormData, UpdateFormData, VaccinationProcess } from "./types";
import { useEffect, useState } from "react";
import { catalogService, VaccineCatalog } from "@/app/services/catalog.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VaccineInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  userRole?: string | null;
  dateErrors?: Record<string, string>;
}

const EMPTY_VACCINATION: VaccinationProcess = {
  vaccineId: "",
  vaccineName: "",
  vaccineManufacturer: "",
  vaccineBatchNumber: "",
  vaccinationDate: "",
  vaccinationSite: "",
  doseNumber: "",
  administrationSite: ""
};

export function VaccineInfoSection({ formData, updateFormData, userRole, dateErrors = {} }: VaccineInfoSectionProps) {
  const isDoctor = userRole === "MedicalReviewer" || userRole === "Admin";
  const [vaccines, setVaccines] = useState<VaccineCatalog[]>([]);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);

  // Cargar vacunas activas desde el catálogo
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        setIsLoadingVaccines(true);
        const data = await catalogService.getActiveVaccines();
        setVaccines(data);
      } catch (error) {
        console.error("Error loading vaccines:", error);
        toast.error("Error al cargar el catálogo de vacunas");
      } finally {
        setIsLoadingVaccines(false);
      }
    };

    fetchVaccines();
  }, []);

  const updateVaccination = (index: number, field: keyof VaccinationProcess, value: string) => {
    const updated = [...formData.vaccinations];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData("vaccinations", updated);
  };

  const addVaccination = () => {
    updateFormData("vaccinations", [...formData.vaccinations, { ...EMPTY_VACCINATION }]);
  };

  const removeVaccination = (index: number) => {
    if (formData.vaccinations.length <= 1) return;
    const updated = formData.vaccinations.filter((_, idx) => idx !== index);
    updateFormData("vaccinations", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <CardTitle className="text-xl mb-2">Información de la Vacuna</CardTitle>
        <CardDescription>
          Proporcione uno o más registros de vacunación. Tanto reportantes como médicos pueden agregar varias entradas.
        </CardDescription>
      </div>

      {formData.vaccinations.map((vaccination, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Vacunación #{index + 1}</h3>
            <Button variant="ghost" size="sm" onClick={() => removeVaccination(index)} disabled={formData.vaccinations.length <= 1}>
              Eliminar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`vaccineName-${index}`}>Nombre de la Vacuna *</Label>
              {isLoadingVaccines ? (
                <div className="flex items-center justify-center h-10 bg-gray-100 rounded border border-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              ) : (
                <Select
                  value={vaccination.vaccineId}
                  onValueChange={(value) =>
                    updateVaccination(index, "vaccineId", value)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione la vacuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {vaccines.length > 0 ? (
                      vaccines.map((vaccine) => (
                        <SelectItem key={vaccine.id} value={vaccine.id}>
                          {vaccine.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="otro" disabled>
                        No hay vacunas disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {isDoctor && (
              <div className="space-y-2">
                <Label htmlFor={`doseNumber-${index}`}>Número de Dosis</Label>
                <Select
                  id={`doseNumber-${index}`}
                  value={vaccination.doseNumber || ""}
                  onValueChange={(value) => updateVaccination(index, "doseNumber", value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primera dosis</SelectItem>
                    <SelectItem value="2">Segunda dosis</SelectItem>
                    <SelectItem value="3">Tercera dosis</SelectItem>
                    <SelectItem value="refuerzo">Dosis de refuerzo</SelectItem>
                    <SelectItem value="unica">Dosis única</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isDoctor && (
              <div className="space-y-2">
                <Label htmlFor={`administrationRoute-${index}`}>Vía de Administración</Label>
                <Select
                  id={`administrationRoute-${index}`}
                  value={vaccination.administrationRoute || ""}
                  onValueChange={(value) => updateVaccination(index, "administrationRoute", value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione vía" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="intramuscular">Inyección intramuscular</SelectItem>
                    <SelectItem value="subcutanea">Inyección subcutánea</SelectItem>
                    <SelectItem value="intradermica">Inyección intradérmica</SelectItem>
                    <SelectItem value="jet">Inyección por jet</SelectItem>
                    <SelectItem value="oral">Oral (por la boca)</SelectItem>
                    <SelectItem value="intranasal">Intranasal (por la nariz)</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                    <SelectItem value="desconocida">Desconocida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor={`vaccinationDate-${index}`}>Fecha de Vacunación *</Label>
              <Input
                id={`vaccinationDate-${index}`}
                type="date"
                value={vaccination.vaccinationDate}
                onChange={(e) => updateVaccination(index, "vaccinationDate", e.target.value)}
                className={`bg-white ${dateErrors[`vaccination_${index}_date`] ? "border-red-500" : ""}`}
              />
              {dateErrors[`vaccination_${index}_date`] && (
                <p className="text-sm text-red-600">{dateErrors[`vaccination_${index}_date`]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vaccinationSite-${index}`}>Centro de Vacunación *</Label>
              <Input
                id={`vaccinationSite-${index}`}
                value={vaccination.vaccinationSite}
                onChange={(e) => updateVaccination(index, "vaccinationSite", e.target.value)}
                placeholder="Ej: Policlínico Vedado, La Habana"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`administrationSite-${index}`}>Sitio de Administración *</Label>
              <Select
                value={vaccination.administrationSite || ""}
                onValueChange={(value) => updateVaccination(index, "administrationSite", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccione sitio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LeftArm">Brazo izquierdo</SelectItem>
                  <SelectItem value="RightArm">Brazo derecho</SelectItem>
                  <SelectItem value="LeftThigh">Muslo izquierdo</SelectItem>
                  <SelectItem value="RightThigh">Muslo derecho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {isDoctor && (
              <div className="space-y-2">
                <Label htmlFor={`vaccineManufacturer-${index}`}>Fabricante</Label>
                <Input
                  id={`vaccineManufacturer-${index}`}
                  value={vaccination.vaccineManufacturer || ""}
                  onChange={(e) => updateVaccination(index, "vaccineManufacturer", e.target.value)}
                  placeholder = "Ej: Instituto Finlay"
                  className="bg-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`vaccineBatchNumber-${index}`}>Número de Lote *</Label>
              <Input
                id={`vaccineBatchNumber-${index}`}
                value={vaccination.vaccineBatchNumber || ""}
                onChange={(e) => updateVaccination(index, "vaccineBatchNumber", e.target.value)}
                placeholder="Ej: L-2024-001"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" onClick={addVaccination} className="mt-2">
        + Agregar otra vacuna
      </Button>
    </div>
  );
}

