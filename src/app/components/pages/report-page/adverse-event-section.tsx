import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { FormData, UpdateFormData } from "./types";
import { useEffect, useState } from "react";
import { catalogService, SymptomCatalog } from "@/app/services/catalog.service";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AdverseEventSectionProps {
  userRole?: string | null;
  formData: FormData;
  updateFormData: UpdateFormData;
  dateErrors?: Record<string, string>;
  currentEventIndex: number;
  onCurrentEventIndexChange: (index: number) => void;
  onAddEvent: () => void;
  onRemoveEvent: (index: number) => void;
}

function toggleSymptom(symptom: string, currentEvent: any, updateFormData: UpdateFormData, field: string = "eventSymptom") {
  // Only allow one symptom per event
  const currentSymptom = currentEvent[field];
  
  if (currentSymptom === symptom) {
    // Deselect if clicking the same symptom
    updateFormData(field, "");
  } else {
    // Replace with new symptom (only one allowed)
    updateFormData(field, symptom);
  }
}

export function AdverseEventSection({ userRole, formData, updateFormData, dateErrors, currentEventIndex, onCurrentEventIndexChange, onAddEvent, onRemoveEvent }: AdverseEventSectionProps) {
  const isDoctor = userRole === "MedicalReviewer" || userRole === "Admin";
  const [symptoms, setSymptoms] = useState<SymptomCatalog[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  // Get current event data
  const currentEvent = formData.adverseEvents[currentEventIndex];
  
  if (!currentEvent) {
    return <div className="text-red-500">Error: No event data found</div>;
  }

  // Validate if current event is complete
  const isEventComplete = (): boolean => {
    const requiredFields = [
      currentEvent.eventDate,
      currentEvent.eventFinishDate,
      currentEvent.eventSymptom,
      currentEvent.eventIntensity,
      currentEvent.eventSeverityLevel,
      currentEvent.eventOutcome,
      currentEvent.eventHospitalization,
    ];
    
    return requiredFields.every(field => field && String(field).trim() !== "");
  };

  const canAddNewEvent = isEventComplete();

  // Cargar síntomas activos desde el catálogo
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        setIsLoadingSymptoms(true);
        const data = await catalogService.getActiveSymptoms();
        setSymptoms(data);
      } catch (error) {
        console.error("Error loading symptoms:", error);
        toast.error("Error al cargar el catálogo de síntomas");
      } finally {
        setIsLoadingSymptoms(false);
      }
    };

    fetchSymptoms();
  }, []);

  const isDeathSelected = currentEvent.eventHospitalization?.includes("death");

  if (!isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">Descripción del Evento Adverso</CardTitle>
              <CardDescription>Describa con detalle lo que sintió y cómo evolucionó después de la vacunación. Use sus propias palabras.</CardDescription>
            </div>
          </div>
          
          {formData.adverseEvents.length > 1 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Label className="text-sm font-semibold">Editando evento</Label>
              <div className="flex items-center gap-2 mt-2">
                <select 
                  value={currentEventIndex} 
                  onChange={(e) => onCurrentEventIndexChange(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {formData.adverseEvents.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Evento {idx + 1} {idx === currentEventIndex ? '(Actual)' : ''}
                    </option>
                  ))}
                </select>
                {formData.adverseEvents.length > 1 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onRemoveEvent(currentEventIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              onClick={() => {
                if (!canAddNewEvent) {
                  toast.error("Evento incompleto", {
                    description: "Complete todos los campos obligatorios antes de agregar un nuevo evento."
                  });
                  return;
                }

                // const lastEvent = formData.adverseEvents[formData.adverseEvents.length - 1];
                // console.log("Evento completado:", lastEvent);


                onAddEvent();
              }} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" /> Nuevo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Fecha de Inicio del Síntoma *</Label>
            <Input
              id="eventDate"
              type="date"
              value={currentEvent.eventDate}
              onChange={(e) => updateFormData("eventDate", e.target.value)}
              className={`bg-white ${dateErrors?.eventDate ? "border-red-500" : ""}`}
            />
            {dateErrors?.eventDate && (
              <p className="text-sm text-red-600">{dateErrors.eventDate}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventFinishDate">Fecha Final del Evento Adverso *</Label>
            <Input
              id="eventFinishDate"
              type="date"
              value={currentEvent.eventFinishDate}
              onChange={(e) => updateFormData("eventFinishDate", e.target.value)}
              className={`bg-white ${dateErrors?.eventFinishDate ? "border-red-500" : ""}`}
            />
            {dateErrors?.eventFinishDate && (
              <p className="text-sm text-red-600">{dateErrors.eventFinishDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>¿Qué síntoma presentó? *</Label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
            <p className="text-sm text-blue-700">
              ℹ️ <strong>Un síntoma por evento:</strong> Cada síntoma debe reportarse como un evento adverso separado. Si el paciente presentó múltiples síntomas, deberá crear eventos adicionales para cada uno.
            </p>
          </div>
          {isLoadingSymptoms ? (
            <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500 mr-2" />
              <span className="text-gray-500">Cargando síntomas...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {currentEvent.eventSymptom && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Síntoma seleccionado: <strong>{symptoms.find(s => s.id === currentEvent.eventSymptom)?.name || currentEvent.eventSymptom}</strong>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                {symptoms.length > 0 ? (
                  symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom.id}
                        checked={currentEvent.eventSymptom === symptom.id}
                        onCheckedChange={() => toggleSymptom(symptom.id, currentEvent, updateFormData, "eventSymptom")}
                      />
                      <label htmlFor={symptom.id} className="text-sm font-normal leading-none cursor-pointer">
                        {symptom.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay síntomas disponibles</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventIntensity">Intensidad del Evento Adverso *</Label>
            <Select value={currentEvent.eventIntensity} onValueChange={(value) => updateFormData("eventIntensity", value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccione intensidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mild">Leve</SelectItem>
                <SelectItem value="Moderate">Moderado</SelectItem>
                <SelectItem value="Severe">Grave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventSeverityLevel">Nivel de Gravedad *</Label>
            <Select value={currentEvent.eventSeverityLevel} onValueChange={(value) => updateFormData("eventSeverityLevel", value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccione gravedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mild">Leve</SelectItem>
                <SelectItem value="Moderate">Moderado</SelectItem>
                <SelectItem value="Severe">Grave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label> Resultado del evento(s) adverso *</Label>
          <div className="space-y-2">
            {[
              { id: "visited-doctor", value: "doctor", label: "¿Tuvo que visitar al médico o clínica?" },
              { id: "emergency", value: "emergency", label: "¿Fue a la sala de emergencias?" },
              { id: "permanent-disability", value: "disability", label: "¿Ha quedado con una discapacidad o limitación permanente?" },
              {id: "death", value: "death", label: "¿El sujeto falleció como consecuencia del evento adverso posiblemente relacionado con la vacunación?"},
              {id: "anomaly", value: "anomaly", label: "¿Hubo alguna anomalía relacionada con la vacunación?"}
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  id={item.id}
                  checked={currentEvent.eventHospitalization?.includes(item.value)}
                  onCheckedChange={(checked: any) => {
                    let value = currentEvent.eventHospitalization || "";
                    if (checked) {
                      value = value ? `${value},${item.value}` : item.value;
                    } else {
                      value = value.replace(`,${item.value}`, "").replace(item.value, "");
                    }
                    updateFormData("eventHospitalization", value);
                  }}
                />
                <label htmlFor={item.id} className="flex-1 cursor-pointer">
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          {isDeathSelected && (
            <div className="p-4 border rounded-lg bg-red-50">
              <Label className="block mb-2">Fecha de fallecimiento *</Label>
                <Select
                  value={currentEvent.deathDateType || ""}
                  onValueChange={(value) => updateFormData("deathDateType",value)}
                >
                      <SelectTrigger className="mb-3">
                    <SelectValue placeholder="Tipo de fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Día / Mes / Año</SelectItem>
                    <SelectItem value="partial">Mes / Año</SelectItem>
                  </SelectContent>
                </Select>

              {currentEvent.deathDateType == "full" && (
                <>
                  <Input
                    type="date"
                    value={currentEvent.deathDate || ""}
                    onChange={(e) => updateFormData("deathDate",e.target.value)}
                    className={dateErrors?.deathDate ? "border-red-500" : ""}
                  />
                  {dateErrors?.deathDate && (
                    <p className="text-sm text-red-600 mt-1">{dateErrors.deathDate}</p>
                  )}
                </>
              )}

              {currentEvent.deathDateType == "partial" && (
                <>
                  <Input
                    type="month"
                    value={currentEvent.deathDate || ""}
                    onChange={(e) => updateFormData("deathDate",e.target.value)}
                    className={dateErrors?.deathDate ? "border-red-500" : ""}
                  />
                  {dateErrors?.deathDate && (
                    <p className="text-sm text-red-600 mt-1">{dateErrors.deathDate}</p>
                  )}
                </>
              )}

              </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventOutcome">Estado Actual *</Label>
          <Select value={currentEvent.eventOutcome} onValueChange={(value) => updateFormData("eventOutcome", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recovered">Totalmente recuperado/a</SelectItem>
              <SelectItem value="recovering">Aún estoy recuperándome</SelectItem>
              <SelectItem value="sequelae">Recuperado/a pero con secuelas</SelectItem>
              <SelectItem value="dangerous">Grave</SelectItem>
              <SelectItem value="unchanged">Sin cambios</SelectItem>
              <SelectItem value="unknown">Desconocido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Cuéntenos en detalle qué ocurrió</Label>
            <Textarea
              id="eventDescription"
              placeholder="Describa algo más que considere relevante sobre el evento adverso. Use sus propias palabras."
              value={currentEvent.eventDescription}
              onChange={(e) => updateFormData("eventDescription", e.target.value)}
              className="bg-white min-h-[140px]"
            />
          </div>
        </div>
      </div>
    );
  }

  // Doctor/admin version
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">Crear Reporte del Evento Adverso</CardTitle>
            <CardDescription>Complete el reporte basado en su evaluación clínica del paciente en el consultorio.</CardDescription>
          </div>
        </div>
        
        {formData.adverseEvents.length > 1 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Label className="text-sm font-semibold">Editando evento</Label>
            <div className="flex items-center gap-2 mt-2">
              <select 
                value={currentEventIndex} 
                onChange={(e) => onCurrentEventIndexChange(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                {formData.adverseEvents.map((_, idx) => (
                  <option key={idx} value={idx}>
                    Evento {idx + 1} {idx === currentEventIndex ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
              {formData.adverseEvents.length > 1 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onRemoveEvent(currentEventIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            onClick={() => {
              if (!canAddNewEvent) {
                toast.error("Evento incompleto", {
                  description: "Complete todos los campos obligatorios antes de agregar un nuevo evento."
                });
                return;
              }
              onAddEvent();
            }} 
            size="sm" 
            className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1" /> Nuevo Evento
          </Button>
        </div>
      </div>

      <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-4">📋 Información del Evento Adverso</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Fecha de Inicio del Evento *</Label>
            <Input id="eventDate" type="date" value={currentEvent.eventDate} onChange={(e) => updateFormData("eventDate", e.target.value)} className={`bg-white ${dateErrors?.eventDate ? "border-red-500" : ""}`} />
            {dateErrors?.eventDate && (
              <p className="text-sm text-red-600">{dateErrors.eventDate}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventFinishDate">Fecha Final del Evento Adverso *</Label>
            <Input id="eventFinishDate" type="date" value={currentEvent.eventFinishDate} onChange={(e) => updateFormData("eventFinishDate", e.target.value)} className={`bg-white ${dateErrors?.eventFinishDate ? "border-red-500" : ""}`} />
            {dateErrors?.eventFinishDate && (
              <p className="text-sm text-red-600">{dateErrors.eventFinishDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label>Síntomas Observados en el Paciente *</Label>
          {isLoadingSymptoms ? (
            <div className="flex items-center justify-center h-20 bg-white rounded-lg border">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500 mr-2" />
              <span className="text-gray-500">Cargando síntomas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border">
              {symptoms.length > 0 ? (
                symptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`symptom-${symptom.id}`}
                      checked={currentEvent.eventSymptom?.includes(symptom.id)}
                      onCheckedChange={() => toggleSymptom(symptom.id, currentEvent, updateFormData, "eventSymptom")}
                    />
                    <label htmlFor={`symptom-${symptom.id}`} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      {symptom.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay síntomas disponibles</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="eventIntensity">Intensidad del Evento Adverso *</Label>
            <Select value={currentEvent.eventIntensity} onValueChange={(value) => updateFormData("eventIntensity", value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccione intensidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mild">Leve</SelectItem>
                <SelectItem value="Moderate">Moderado</SelectItem>
                <SelectItem value="Severe">Grave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventSeverityLevel">Nivel de Gravedad *</Label>
            <Select value={currentEvent.eventSeverityLevel} onValueChange={(value) => updateFormData("eventSeverityLevel", value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccione gravedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mild">Leve</SelectItem>
                <SelectItem value="Moderate">Moderado</SelectItem>
                <SelectItem value="Severe">Grave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
        <h3 className="font-semibold text-green-900 mb-4">🏥 Evaluación Clínica y Diagnóstico</h3>
        <div className="space-y-2 mb-4">
          <Label htmlFor="professionalDiagnosis">Diagnóstico Clínico Profesional *</Label>
          <Textarea
            id="professionalDiagnosis"
            placeholder="Diagnóstico basado en síntomas, antecedentes clínicos, hallazgos del examen físico y evaluación profesional..."
            value={currentEvent.professionalDiagnosis}
            onChange={(e) => updateFormData("professionalDiagnosis", e.target.value)}
            className="bg-white min-h-[100px]"
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="medicalTerminology">Terminología Médica Estándar (MedDRA) *</Label>
          <Textarea
            id="medicalTerminology"
            placeholder="Expresar el evento en términos médicos estándar usados en farmacovigilancia (ej: 'Anafilaxia', 'Síncope vasovagal', etc.)..."
            value={currentEvent.medicalTerminology}
            onChange={(e) => updateFormData("medicalTerminology", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="laboratoryResults">Resultados de Laboratorio y Pruebas Diagnósticas</Label>
          <Textarea
            id="laboratoryResults"
            placeholder="ECG, análisis de sangre, resonancia, biopsias, cultivos, etc. Incluya valores anormales relevantes..."
            value={formData.laboratoryResults}
            onChange={(e) => updateFormData("laboratoryResults", e.target.value)}
            className="bg-white min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
        <h3 className="font-semibold text-purple-900 mb-4">📊 Clasificación RET y Análisis Técnico</h3>
        <div className="space-y-2 mb-4">
          <Label htmlFor="retClassification">Clasificación RET (Tabla de Eventos Reportables) *</Label>
          <Select value={currentEvent.retClassification} onValueChange={(value) => updateFormData("retClassification", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione clasificación RET" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anafilaxis">Anafilaxia</SelectItem>
              <SelectItem value="miopericarditis">Miopericarditis o miocarditis</SelectItem>
              <SelectItem value="trombosis">Trombosis con síndrome de trombocitopenia</SelectItem>
              <SelectItem value="sindrome-guillain">Síndrome de Guillain-Barré</SelectItem>
              <SelectItem value="paralisis-bell">Parálisis de Bell</SelectItem>
              <SelectItem value="sincope">Síncope vasovagal</SelectItem>
              <SelectItem value="encefalopatia">Encefalopatía</SelectItem>
              <SelectItem value="convulsiones">Convulsiones/Episodios convulsivos</SelectItem>
              <SelectItem value="miocarditis">Miocarditis aguda</SelectItem>
              <SelectItem value="no-clasificado">No clasificado en RET</SelectItem>
              <SelectItem value="otro">Otro (especifique)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="clinicalSignificance">Evaluación de Significancia Clínica *</Label>
          <Select value={currentEvent.clinicalSignificance} onValueChange={(value) => updateFormData("clinicalSignificance", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinically-significant">Clínicamente significativo e inesperado</SelectItem>
              <SelectItem value="expected">Evento esperado según prospecto</SelectItem>
              <SelectItem value="significant-unexpected">Significativo pero no en prospecto</SelectItem>
              <SelectItem value="minor">Evento menor</SelectItem>
              <SelectItem value="serious">Evento serio/potencialmente mortal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="laboratoryResults">Resultados de Laboratorio y Pruebas Diagnósticas</Label>
          <Textarea
            id="laboratoryResults"
            placeholder="ECG, análisis de sangre, resonancia, biopsias, cultivos, etc. Incluya valores anormales relevantes..."
            value={currentEvent.laboratoryResults}
            onChange={(e) => updateFormData("laboratoryResults", e.target.value)}
            className="bg-white min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
        <h3 className="font-semibold text-orange-900 mb-4">📝 Información Adicional</h3>
        <div className="space-y-2 mb-4">
          <Label htmlFor="vaccinationFacilityType">Tipo de Centro de Vacunación *</Label>
          <Select value={currentEvent.vaccinationFacilityType} onValueChange={(value) => updateFormData("vaccinationFacilityType", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="polyclinic">Policlínico/Centro de salud</SelectItem>
              <SelectItem value="private-clinic">Clínica privada</SelectItem>
              <SelectItem value="pharmacy">Farmacia</SelectItem>
              <SelectItem value="office">Consultorio privado</SelectItem>
              <SelectItem value="mobile-unit">Unidad móvil</SelectItem>
              <SelectItem value="unknown">Desconocido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="contraindicationCriterion">¿Constituye Contraindicación para Próximas Dosis?</Label>
          <Textarea
            id="contraindicationCriterion"
            placeholder="¿Este evento constituye una contraindicación según el prospecto del fabricante para administrar dosis futuras? Especifique..."
            value={currentEvent.contraindicationCriterion}
            onChange={(e) => updateFormData("contraindicationCriterion", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventOutcome">Desenlace del Evento al Momento del Reporte *</Label>
          <Select value={currentEvent.eventOutcome} onValueChange={(value) => updateFormData("eventOutcome", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recovered">Recuperado sin secuelas</SelectItem>
              <SelectItem value="recovering">En recuperación</SelectItem>
              <SelectItem value="sequelae">Recuperado con secuelas</SelectItem>
              <SelectItem value="fatal">Fatal/Defunción</SelectItem>
              <SelectItem value="unknown">Desconocido/Pendiente de seguimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Descripción Clínica del Evento</Label>
            <Textarea
              id="eventDescription"
              placeholder="Describa en detalle el evento: cómo comenzó, evolución, duración, síntomas observados, presentación clínica, etc."
              value={currentEvent.eventDescription}
              onChange={(e) => updateFormData("eventDescription", e.target.value)}
              className="bg-white min-h-[120px]"
            />
            <p className="text-xs text-gray-500">Nota: Este campo es opcional y puede dejarse en blanco.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
