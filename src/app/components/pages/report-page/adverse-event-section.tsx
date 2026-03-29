import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { FormData, UpdateFormData } from "./types";

interface AdverseEventSectionProps {
  userRole?: string | null;
  formData: FormData;
  updateFormData: UpdateFormData;
}

const COMMON_SYMPTOMS = [
  "Dolor en el sitio de inyección",
  "Fiebre",
  "Fatiga",
  "Dolor de cabeza",
  "Náuseas/Vómitos",
  "Dolor muscular",
  "Escalofríos",
  "Hinchazón en sitio de inyección",
  "Mareos",
  "Reacción alérgica",
  "Dificultad respiratoria",
  "Otros"
];

function toggleSymptom(symptom: string, formData: FormData, updateFormData: UpdateFormData) {
  if (formData.eventSymptoms.includes(symptom)) {
    updateFormData("eventSymptoms", formData.eventSymptoms.filter((s) => s !== symptom));
  } else {
    updateFormData("eventSymptoms", [...formData.eventSymptoms, symptom]);
  }
}

export function AdverseEventSection({ userRole, formData, updateFormData }: AdverseEventSectionProps) {
  const isDoctor = userRole === "doctor" || userRole === "admin";

  const isDeathSelected = formData.eventHospitalization?.includes("death");

  if (!isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-xl mb-2">Descripción del Evento Adverso</CardTitle>
          <CardDescription>Describa con detalle lo que sintió y cómo evolucionó después de la vacunación. Use sus propias palabras.</CardDescription>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Fecha de Inicio del Síntoma *</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => updateFormData("eventDate", e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Hora del Síntoma *</Label>
            <Input
              id="eventTime"
              type="time"
              value={formData.eventTime}
              onChange={(e) => updateFormData("eventTime", e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>¿Qué síntomas presentó? *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
            {COMMON_SYMPTOMS.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={symptom}
                  checked={formData.eventSymptoms.includes(symptom)}
                  onCheckedChange={() => toggleSymptom(symptom, formData, updateFormData)}
                />
                <label htmlFor={symptom} className="text-sm font-normal leading-none cursor-pointer">
                  {symptom}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDescription">Cuéntenos en detalle qué ocurrió *</Label>
          <Textarea
            id="eventDescription"
            placeholder="Describa cómo empezaron los síntomas, cuánto tiempo duraron, cómo se sintió, qué hizo para mejorarse, si necesitó ir al médico, etc."
            value={formData.eventDescription}
            onChange={(e) => updateFormData("eventDescription", e.target.value)}
            className="bg-white min-h-[140px]"
          />
        </div>

        <div className="space-y-3">
          <Label> Resultado del evento(s) adverso *</Label>
          <div className="space-y-2">
            {[
              { id: "visited-doctor", value: "doctor", label: "¿Tuvo que visitar al médico o clínica?" },
              { id: "emergency", value: "emergency", label: "¿Fue a la sala de emergencias?" },
              { id: "hospitalized", value: "hospitalized", label: "¿Fue hospitalizado?" },
              { id: "permanent-disability", value: "disability", label: "¿Ha quedado con una discapacidad o limitación permanente?" },
              {id: "death", value: "death", label: "¿El sujeto falleció como consecuencia del evento adverso posiblemente relacionado con la vacunación?"},
              {id: "anomaly", value: "anomaly", label: "¿Hubo alguna anomalía relacionada con la vacunación?"}
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  id={item.id}
                  checked={formData.eventHospitalization.includes(item.value)}
                  onCheckedChange={(checked: any) => {
                    let value = formData.eventHospitalization;
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
                  value={formData.deathDateType || ""}
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

              {formData.deathDateType == "full" && (
                <Input
                  type="date"
                  value={formData.deathDate || ""}
                  onChange={(e) => updateFormData("deathDate",e.target.value)}
                />
              )}

              {formData.deathDateType == "partial" && (
                <Input
                  type="month"
                  value={formData.deathDate || ""}
                  onChange={(e) => updateFormData("deathDate",e.target.value)}
                />
              )}

              </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventOutcome">Estado Actual *</Label>
          <Select value={formData.eventOutcome} onValueChange={(value) => updateFormData("eventOutcome", value)}>
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

        <div className="space-y-2">
          <Label htmlFor="patientMedicalHistory">Problemas de salud que tenía antes de la vacuna</Label>
          <Textarea
            id="patientMedicalHistory"
            placeholder="Ej: diabetes, presión alta, asma, otras enfermedades..."
            value={formData.patientMedicalHistory}
            onChange={(e) => updateFormData("patientMedicalHistory", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMedications">¿Toma medicamentos regularmente? (Especifique cuáles)</Label>
          <Textarea
            id="currentMedications"
            placeholder="Ej: insulina, aspirina, antibióticos, etc..."
            value={formData.currentMedications}
            onChange={(e) => updateFormData("currentMedications", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">¿Tiene alergias conocidas? (Especifique a qué)</Label>
          <Textarea
            id="allergies"
            placeholder="Ej: penicilina, mariscos, látex, etc..."
            value={formData.allergies}
            onChange={(e) => updateFormData("allergies", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>
      </div>
    );
  }

  // Doctor/admin version
  return (
    <div className="space-y-6">
      <div>
        <CardTitle className="text-xl mb-2">Crear Reporte del Evento Adverso</CardTitle>
        <CardDescription>Complete el reporte basado en su evaluación clínica del paciente en el consultorio.</CardDescription>
      </div>

      <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-4">📋 Información del Evento Adverso</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Fecha de Inicio del Evento *</Label>
            <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => updateFormData("eventDate", e.target.value)} className="bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Hora de Inicio del Evento *</Label>
            <Input id="eventTime" type="time" value={formData.eventTime} onChange={(e) => updateFormData("eventTime", e.target.value)} className="bg-white" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label>Síntomas Observados en el Paciente *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border">
            {COMMON_SYMPTOMS.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={`symptom-${symptom}`}
                  checked={formData.eventSymptoms.includes(symptom)}
                  onCheckedChange={() => toggleSymptom(symptom, formData, updateFormData)}
                />
                <label htmlFor={`symptom-${symptom}`} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {symptom}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="eventDescription">Descripción Clínica del Evento *</Label>
          <Textarea
            id="eventDescription"
            placeholder="Describa en detalle el evento: cómo comenzó, evolución, duración, síntomas observados, presentación clínica, etc."
            value={formData.eventDescription}
            onChange={(e) => updateFormData("eventDescription", e.target.value)}
            className="bg-white min-h-[120px]"
          />
        </div>
      </div>

      <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
        <h3 className="font-semibold text-green-900 mb-4">🏥 Evaluación Clínica y Diagnóstico</h3>
        <div className="space-y-2 mb-4">
          <Label htmlFor="professionalDiagnosis">Diagnóstico Clínico Profesional *</Label>
          <Textarea
            id="professionalDiagnosis"
            placeholder="Diagnóstico basado en síntomas, antecedentes clínicos, hallazgos del examen físico y evaluación profesional..."
            value={formData.professionalDiagnosis}
            onChange={(e) => updateFormData("professionalDiagnosis", e.target.value)}
            className="bg-white min-h-[100px]"
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="medicalTerminology">Terminología Médica Estándar (MedDRA) *</Label>
          <Textarea
            id="medicalTerminology"
            placeholder="Expresar el evento en términos médicos estándar usados en farmacovigilancia (ej: 'Anafilaxia', 'Síncope vasovagal', etc.)..."
            value={formData.medicalTerminology}
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
          <Select value={formData.retClassification} onValueChange={(value) => updateFormData("retClassification", value)}>
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
          <Select value={formData.clinicalSignificance} onValueChange={(value) => updateFormData("clinicalSignificance", value)}>
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
            value={formData.laboratoryResults}
            onChange={(e) => updateFormData("laboratoryResults", e.target.value)}
            className="bg-white min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
        <h3 className="font-semibold text-orange-900 mb-4">📝 Información Adicional</h3>
        <div className="space-y-2 mb-4">
          <Label htmlFor="vaccinationFacilityType">Tipo de Centro de Vacunación *</Label>
          <Select value={formData.vaccinationFacilityType} onValueChange={(value) => updateFormData("vaccinationFacilityType", value)}>
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
            value={formData.contraindicationCriterion}
            onChange={(e) => updateFormData("contraindicationCriterion", e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventOutcome">Desenlace del Evento al Momento del Reporte *</Label>
          <Select value={formData.eventOutcome} onValueChange={(value) => updateFormData("eventOutcome", value)}>
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
      </div>
    </div>
  );
}
