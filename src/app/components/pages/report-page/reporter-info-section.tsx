import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";
import { FormData, UpdateFormData } from "./types";

interface ReporterInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  isAutoFilled: boolean;
  reporterFieldsRef: React.RefObject<HTMLDivElement>;
  dateErrors?: Record<string, string>;
}

export function ReporterInfoSection({ formData, updateFormData, isAutoFilled, reporterFieldsRef, dateErrors }: ReporterInfoSectionProps) {
  const isPatient = formData.reporterRelationship === "paciente";

  return (
    <div className="space-y-6" ref={reporterFieldsRef}>
      <div>
        <CardTitle className="text-xl mb-2">Datos del Reportante</CardTitle>
        <CardDescription>Información de la persona que reporta el evento adverso.</CardDescription>
      </div>

      <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Label htmlFor="reporterRelationship">Relación con el Sujeto Vacunado *</Label>
        <Select value={formData.reporterRelationship} onValueChange={(value) => updateFormData("reporterRelationship", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Seleccione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medico">Profesional de la salud/personal</SelectItem>
            <SelectItem value="paciente">Sujeto Vacunado (usted mismo)</SelectItem>
            <SelectItem value="familiar">Padre/Tutor/Cuidador</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPatient && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-sm text-green-800">
            <strong>✓ Información auto-completada y protegida:</strong> Se están usando los datos del sujeto vacunado. 
            Estos campos no pueden ser modificados.
          </AlertDescription>
        </Alert>
      )}

      <div className={`p-4 rounded-lg transition-colors duration-300 ${isAutoFilled ? "bg-yellow-100 border-2 border-yellow-400" : "bg-transparent border-0"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterFullName">Nombre Completo *</Label>
            <Input
              id="reporterFullName"
              placeholder="Su nombre completo"
              value={formData.reporterFullName}
              onChange={(e) => updateFormData("reporterFullName", e.target.value)}
              disabled={isPatient}
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterDateOfBirth">Fecha de Nacimiento *</Label>
            <Input
              id="reporterDateOfBirth"
              type="date"
              value={formData.reporterDateOfBirth}
              onChange={(e) => updateFormData("reporterDateOfBirth", e.target.value)}
              disabled={isPatient}
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""} ${dateErrors?.reporterDateOfBirth ? "border-red-500" : ""}`}
            />
            {dateErrors?.reporterDateOfBirth && !isPatient && (
              <p className="text-sm text-red-600">{dateErrors.reporterDateOfBirth}</p>
            )}
          </div>
        </div>

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterGender">Sexo *</Label>
            <Select
              value={formData.reporterGender}
              onValueChange={(value) => !isPatient && updateFormData("reporterGender", value)}
              disabled={isPatient}
            >
              <SelectTrigger className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="O">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterProvince">Provincia *</Label>
            <Select
              value={formData.reporterProvince}
              onValueChange={(value) => {
                if (!isPatient) {
                  updateFormData("reporterProvince", value);
                  updateFormData("reporterMunicipality", "");
                }
              }}
              disabled={isPatient}
            >
              <SelectTrigger className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}>
                <SelectValue placeholder="Seleccione provincia" />
              </SelectTrigger>
              <SelectContent>
                {["", ...(Object.keys(PROVINCES_AND_MUNICIPALITIES).sort())].map((province) =>
                  province ? (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ) : null,
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterMunicipality">Municipio *</Label>
            <Select
              value={formData.reporterMunicipality}
              onValueChange={(value) => !isPatient && updateFormData("reporterMunicipality", value)}
              disabled={isPatient || !formData.reporterProvince}
            >
              <SelectTrigger className={`bg-white ${isPatient || !formData.reporterProvince ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}>
                <SelectValue placeholder={formData.reporterProvince ? "Seleccione municipio" : "Seleccione provincia primero"} />
              </SelectTrigger>
              <SelectContent>
                {formData.reporterProvince &&
                  getMunicipalitiesByProvince(formData.reporterProvince).map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterPhoneNumber">Teléfono *</Label>
            <div className="flex">
              <span className="px-3 py-2 border border-r-0 rounded-l-md text-sm bg-gray-100">+53</span>
              <Input
                id="reporterPhoneNumber"
                type="tel"
                placeholder="Teléfono"
                value={formData.reporterPhoneNumber}
                onChange={(e) => updateFormData("reporterPhoneNumber", e.target.value)}
                disabled={isPatient}
                className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterEmail">Email *</Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="correo@example.com"
              value={formData.reporterEmail}
              onChange={(e) => updateFormData("reporterEmail", e.target.value)}
              disabled={isPatient}
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
