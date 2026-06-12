import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { FormData, UpdateFormData } from "./types";

interface PatientMedicalInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
}

export function PatientMedicalInfoSection({
  formData,
  updateFormData,
}: PatientMedicalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle className="text-xl mb-2">Información Médica Previa del Paciente</CardTitle>
        <CardDescription>
          Complete esta sección con información sobre el historial de salud del paciente antes de la vacunación.
        </CardDescription>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patientMedicalHistory">Problemas de salud que tenía antes de la vacuna</Label>
        <Textarea
          id="patientMedicalHistory"
          placeholder="Ej: diabetes, presión alta, asma, otras enfermedades..."
          value={formData.patientMedicalHistory}
          onChange={(e) => updateFormData("patientMedicalHistory", e.target.value)}
          className="bg-white min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentMedications">¿Toma medicamentos regularmente? (Especifique cuáles)</Label>
        <Textarea
          id="currentMedications"
          placeholder="Ej: insulina, aspirina, antibióticos, etc..."
          value={formData.currentMedications}
          onChange={(e) => updateFormData("currentMedications", e.target.value)}
          className="bg-white min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">¿Tiene alergias conocidas? (Especifique a qué)</Label>
        <Textarea
          id="allergies"
          placeholder="Ej: penicilina, mariscos, látex, etc..."
          value={formData.allergies}
          onChange={(e) => updateFormData("allergies", e.target.value)}
          className="bg-white min-h-[100px]"
        />
      </div>
    </div>
  );
}
