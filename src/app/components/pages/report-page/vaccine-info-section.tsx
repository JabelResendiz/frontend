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
import { getProvinces, getMunicipalitiesByProvince, getProvinceId, getMunicipalityId } from "@/app/data/municipalities";

interface VaccineInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  userRole?: string | null;
  dateErrors?: Record<string, string>;
}

interface VaccinationCenter {
  id: string;
  name: string;
  address: string;
}

interface VaccinationLot {
  id: string;
  lotNumber: string;
}

const EMPTY_VACCINATION: VaccinationProcess = {
  vaccineId: "",

  vaccinationLotId: "",
  vaccinationDate: "",

  doseNumber: "",

  administrationSite: "",
  vaccinationProvince: "",
  vaccinationMunicipality: "",
  vaccinationCenterId: "",
};

export function VaccineInfoSection({ formData, updateFormData, userRole, dateErrors = {} }: VaccineInfoSectionProps) {
  const isDoctor = userRole === "MedicalReviewer" || userRole === "Admin";
  const [vaccines, setVaccines] = useState<VaccineCatalog[]>([]);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);
  const [vaccinationCenters, setVaccinationCenters] = useState<Record<number, VaccinationCenter[]>>({});
  const [isLoadingCenters, setIsLoadingCenters] = useState<Record<number, boolean>>({});
  const [vaccinationLots, setVaccinationLots] = useState<Record<number, VaccinationLot[]>>({});
  const [isLoadingLots, setIsLoadingLots] = useState<Record<number, boolean>>({});
  const [vaccineDuplicateErrors, setVaccineDuplicateErrors] = useState<Record<number, string>>({});

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
    
    // Validar duplicado de vacuna + fecha
    if ((field === "vaccineId" || field === "vaccinationDate") && value) {
      const currentVaccine = updated[index].vaccineId;
      const currentDate = updated[index].vaccinationDate;
      
      // Si ambos campos están llenos, validar
      if (currentVaccine && currentDate) {
        const hasDuplicate = updated.some((vac, idx) => {
          // No comparar consigo mismo
          if (idx === index) return false;
          // Verificar si existe otra vacuna con el mismo ID y fecha
          return vac.vaccineId === currentVaccine && vac.vaccinationDate === currentDate;
        });
        
        if (hasDuplicate) {
          setVaccineDuplicateErrors(prev => ({
            ...prev,
            [index]: `Ya existe un registro de esta vacuna para la fecha ${currentDate}.`
          }));
          return; // No actualizar si hay duplicado
        } else {
          // Limpiar error si se resolvió
          setVaccineDuplicateErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      } else {
        // Limpiar error si uno de los campos está vacío
        setVaccineDuplicateErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    }
    
    updateFormData("vaccinations", updated);
    
    // Clear and fetch lots when vaccine changes
    if (field === "vaccineId") {
      updated[index].vaccinationLotId = "";
      // updated[index].vaccineBatchNumber = "";
      updateFormData("vaccinations", updated);
      
      if (value) {
        fetchVaccinationLots(index, value);
      }
    }
    
    // Clear municipality and center when province changes
    if (field === "vaccinationProvince") {
      updated[index].vaccinationMunicipality = "";
      updated[index].vaccinationCenterId = "";
      // updated[index].vaccinationCenterName = "";
      updateFormData("vaccinations", updated);
    }
    
    // Clear center when municipality changes
    if (field === "vaccinationMunicipality") {
      updated[index].vaccinationCenterId = "";
      // updated[index].vaccinationCenterName = "";
      updateFormData("vaccinations", updated);
      
      // Fetch vaccination centers
      if (value && updated[index].vaccinationProvince) {
        fetchVaccinationCenters(index, updated[index].vaccinationProvince, value);
      }
    }
  };

  const fetchVaccinationCenters = async (index: number, province: string, municipality: string) => {
    try {
      setIsLoadingCenters(prev => ({ ...prev, [index]: true }));
      
      const provinceId = getProvinceId(province);
      const municipalityId = getMunicipalityId(province, municipality);
      
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_BASE_URL}/VaccinationCenter/getByMunicipality?municipalityId=${municipalityId}&provinceId=${provinceId}`
      );
      
      if (!response.ok) {
        throw new Error("Error fetching vaccination centers");
      }
      
      const centers: VaccinationCenter[] = await response.json();
      setVaccinationCenters(prev => ({ ...prev, [index]: centers }));
    } catch (error) {
      console.error("Error loading vaccination centers:", error);
      toast.error("Error al cargar los centros de vacunación");
    } finally {
      setIsLoadingCenters(prev => ({ ...prev, [index]: false }));
    }
  };

  const fetchVaccinationLots = async (index: number, vaccineId: string) => {
    try {
      setIsLoadingLots(prev => ({ ...prev, [index]: true }));
      
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_BASE_URL}/Lot/getByVaccine?vaccineId=${vaccineId}`
      );
      
      if (!response.ok) {
        throw new Error("Error fetching vaccination lots");
      }
      
      const lots: VaccinationLot[] = await response.json();
      setVaccinationLots(prev => ({ ...prev, [index]: lots }));
    } catch (error) {
      console.error("Error loading vaccination lots:", error);
      toast.error("Error al cargar los lotes disponibles");
    } finally {
      setIsLoadingLots(prev => ({ ...prev, [index]: false }));
    }
  };

  const addVaccination = () => {

  //   const lastVaccination = formData.vaccinations[formData.vaccinations.length - 1];

  // console.log("Vacunación guardada:", lastVaccination);


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

            <div className="space-y-2">
                <Label htmlFor={`doseNumber-${index}`}>Número de Dosis</Label>
                <Select
                  value={vaccination.doseNumber || ""}
                  onValueChange={(value) => updateVaccination(index, "doseNumber", value)}
                >
                  <SelectTrigger id={`doseNumber-${index}`} className="bg-white">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primera">Primera</SelectItem>
                    <SelectItem value="Segunda">Segunda</SelectItem>
                    <SelectItem value="Tercer">Tercer</SelectItem>
                    <SelectItem value="Refuerzo">Refuerzo</SelectItem>
                    <SelectItem value="Unica">Unica</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            

            {isDoctor && (
              <div className="space-y-2">
                <Label htmlFor={`administrationRoute-${index}`}>Vía de Administración</Label>
                <Select
                  value={vaccination.administrationRoute || ""}
                  onValueChange={(value) => updateVaccination(index, "administrationRoute", value)}
                >
                  <SelectTrigger id={`administrationRoute-${index}`} className="bg-white">
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
                className={`bg-white ${dateErrors[`vaccination_${index}_date`] || vaccineDuplicateErrors[index] ? "border-red-500" : ""}`}
              />
              {dateErrors[`vaccination_${index}_date`] && (
                <p className="text-sm text-red-600">{dateErrors[`vaccination_${index}_date`]}</p>
              )}
              {vaccineDuplicateErrors[index] && (
                <p className="text-sm text-red-600">{vaccineDuplicateErrors[index]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vaccinationProvince-${index}`}>Provincia del Centro de Vacunación *</Label>
              <Select
                value={vaccination.vaccinationProvince || ""}
                onValueChange={(value) => updateVaccination(index, "vaccinationProvince", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccione provincia" />
                </SelectTrigger>
                <SelectContent>
                  {getProvinces().map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vaccinationMunicipality-${index}`}>Municipio *</Label>
              <Select
                value={vaccination.vaccinationMunicipality || ""}
                onValueChange={(value) => updateVaccination(index, "vaccinationMunicipality", value)}
                disabled={!vaccination.vaccinationProvince}
              >
                <SelectTrigger className={`bg-white ${!vaccination.vaccinationProvince ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <SelectValue placeholder={!vaccination.vaccinationProvince ? "Seleccione provincia primero" : "Seleccione municipio"} />
                </SelectTrigger>
                <SelectContent>
                  {vaccination.vaccinationProvince && getMunicipalitiesByProvince(vaccination.vaccinationProvince).map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vaccinationCenter-${index}`}>Centro de Vacunación *</Label>
              {isLoadingCenters[index] ? (
                <div className="flex items-center justify-center h-10 bg-gray-100 rounded border border-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              ) : (
                <Select
                  value={vaccination.vaccinationCenterId || ""}
                  onValueChange={(value) => {
  const center = vaccinationCenters[index]?.find(
    c => c.id === value
  );

  const updated = [...formData.vaccinations];

  updated[index] = {
    ...updated[index],
    vaccinationCenterId: value,
  };

  updateFormData("vaccinations", updated);
}}
                  disabled={!vaccination.vaccinationMunicipality || !vaccinationCenters[index] || vaccinationCenters[index].length === 0}
                >
                  <SelectTrigger className={`bg-white ${!vaccination.vaccinationMunicipality ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <SelectValue placeholder={vaccination.vaccinationCenterId ? `${vaccination.vaccinationCenterId}` : (!vaccination.vaccinationMunicipality ? "Seleccione municipio primero" : "Seleccione centro")} />
                  </SelectTrigger>
                  <SelectContent>
                    {vaccinationCenters[index] && vaccinationCenters[index].length > 0 ? (
                      vaccinationCenters[index].map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-centers" disabled>
                        {vaccination.vaccinationMunicipality ? "No hay centros disponibles" : ""}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
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

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
            )} */}

            <div className="space-y-2">
              <Label htmlFor={`vaccineBatchNumber-${index}`}>Número de Lote *</Label>
              {isLoadingLots[index] ? (
                <div className="flex items-center justify-center h-10 bg-gray-100 rounded border border-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              ) : (
                <Select
                  value={vaccination.vaccinationLotId || ""}
                  onValueChange={(value) => {
                    //const lot = vaccinationLots[index]?.find(l => l.id === value);
                    updateVaccination(index, "vaccinationLotId", value);
                    // if (lot) {
                    //   updateVaccination(index, "vaccineBatchNumber", lot.lotNumber);
                    // }
                  }}
                  disabled={!vaccination.vaccineId || !vaccinationLots[index] || vaccinationLots[index].length === 0}
                >
                  <SelectTrigger className={`bg-white ${!vaccination.vaccineId ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <SelectValue placeholder={vaccination.vaccinationLotId ? `${vaccination.vaccinationLotId}` : (!vaccination.vaccineId ? "Seleccione vacuna primero" : "Seleccione lote")} />
                  </SelectTrigger>
                  <SelectContent>
                    {vaccinationLots[index] && vaccinationLots[index].length > 0 ? (
                      vaccinationLots[index].map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          {lot.lotNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-lots" disabled>
                        {vaccination.vaccineId ? "No hay lotes disponibles" : ""}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        
      ))}

      <Button type="button" onClick={addVaccination} className="mt-2">
        + Agregar otra vacuna
      </Button>
    </div>
  );
}

