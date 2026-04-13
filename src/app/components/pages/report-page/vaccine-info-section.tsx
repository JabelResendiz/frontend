import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { FormData, UpdateFormData, VaccinationProcess } from "./types";

interface VaccineInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  userRole?: string | null;
  dateErrors?: Record<string, string>;
}

const EMPTY_VACCINATION: VaccinationProcess = {
  vaccineName: "",
  vaccineManufacturer: "",
  vaccineBatchNumber: "",
  vaccinationDate: "",
  vaccinationSite: "",
  doseNumber: ""
};

export function VaccineInfoSection({ formData, updateFormData, userRole, dateErrors = {} }: VaccineInfoSectionProps) {
  const isDoctor = userRole === "doctor" || userRole === "admin";

  const updateVaccination = (index: number, field: keyof VaccinationProcess, value: string) => {
    const updatedVaccinations = [...formData.vaccinations];
    updatedVaccinations[index] = { ...updatedVaccinations[index], [field]: value };
    updateFormData("vaccinations", updatedVaccinations);
  };

  const addVaccination = () => {
    updateFormData("vaccinations", [...formData.vaccinations, { ...EMPTY_VACCINATION }]);
  };

  const removeVaccination = (index: number) => {
    if (formData.vaccinations.length <= 1) return;
    const updatedVaccinations = formData.vaccinations.filter((_, idx) => idx !== index);
    updateFormData("vaccinations", updatedVaccinations);
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
        <div key={`vaccination-${index}`} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Vacunación #{index + 1}</h3>
            <Button variant="ghost" size="sm" onClick={() => removeVaccination(index)} disabled={formData.vaccinations.length <= 1}>
              Eliminar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`vaccineName-${index}`}>Nombre de la Vacuna *</Label>
              <Select
                id={`vaccineName-${index}`}
                value={vaccination.vaccineName}
                onValueChange={(value) => updateVaccination(index, "vaccineName", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccione la vacuna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soberana 02">Soberana 02</SelectItem>
                  <SelectItem value="Soberana Plus">Soberana Plus</SelectItem>
                  <SelectItem value="Abdala">Abdala</SelectItem>
                  <SelectItem value="Mambisa">Mambisa</SelectItem>
                  <SelectItem value="Heberpenta-L">Heberpenta-L</SelectItem>
                  <SelectItem value="Heberbiovac-HB">Heberbiovac-HB</SelectItem>
                  <SelectItem value="vAA">vAA (Meningitis A)</SelectItem>
                  <SelectItem value="vABC">vABC (Meningitis BC)</SelectItem>
                  <SelectItem value="Otra">Otra</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor={`vaccinationSite-${index}`}>Sitio de Vacunación *</Label>
              <Input
                id={`vaccinationSite-${index}`}
                value={vaccination.vaccinationSite}
                onChange={(e) => updateVaccination(index, "vaccinationSite", e.target.value)}
                placeholder="Ej: Policlínico Vedado, La Habana"
                className="bg-white"
              />
            </div>
          </div>

          {isDoctor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
              <div className="space-y-2">
                <Label htmlFor={`vaccineBatchNumber-${index}`}>Número de Lote</Label>
                <Input
                  id={`vaccineBatchNumber-${index}`}
                  value={vaccination.vaccineBatchNumber || ""}
                  onChange={(e) => updateVaccination(index, "vaccineBatchNumber", e.target.value)}
                  placeholder="Ej: L-2024-001"
                  className="bg-white"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <Button type="button" onClick={addVaccination} className="mt-2">
        + Agregar otra vacuna
      </Button>
    </div>
  );
}

