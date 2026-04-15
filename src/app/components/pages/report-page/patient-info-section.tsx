import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";
import { FormData, UpdateFormData } from "./types";

interface PatientInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  dateErrors?: Record<string, string>;
}

export function PatientInfoSection({ formData, updateFormData, dateErrors = {} }: PatientInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle className="text-xl mb-2">Información del Sujeto Vacunado</CardTitle>
        <CardDescription>Datos de la persona que recibió la vacuna.</CardDescription>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientFullName">Nombre Completo *</Label>
          <Input
            id="patientFullName"
            placeholder="Nombre del paciente"
            value={formData.patientFullName}
            onChange={(e) => updateFormData("patientFullName", e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientIdentityNumber">Número de Identidad</Label>
          <Input
            id="patientIdentityNumber"
            placeholder="Carnet de identidad"
            value={formData.patientIdentityNumber}
            onChange={(e) => updateFormData("patientIdentityNumber", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientDateOfBirth">Fecha de Nacimiento *</Label>
          <Input
            id="patientDateOfBirth"
            type="date"
            value={formData.patientDateOfBirth}
            onChange={(e) => updateFormData("patientDateOfBirth", e.target.value)}
            className={`bg-white ${dateErrors.patientDateOfBirth ? "border-red-500" : ""}`}
          />
          {dateErrors.patientDateOfBirth && (
            <p className="text-sm text-red-600">{dateErrors.patientDateOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientGender">Sexo *</Label>
          <Select value={formData.patientGender} onValueChange={(value) => updateFormData("patientGender", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
              <SelectItem value="O">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.patientGender === "F" && (
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Label htmlFor="patientIsPregnant">¿Estaba la paciente embarazada en el momento de la vacunación? *</Label>
          <Select value={formData.patientIsPregnant} onValueChange={(value) => updateFormData("patientIsPregnant", value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="si">Sí</SelectItem>
              <SelectItem value="desconocido">Desconocido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientProvince">Provincia *</Label>
          <Select
            value={formData.patientProvince}
            onValueChange={(value) => {
              updateFormData("patientProvince", value);
              updateFormData("patientMunicipality", "");
            }}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccione provincia" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PROVINCES_AND_MUNICIPALITIES)
                .sort()
                .map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientMunicipality">Municipio *</Label>
          <Select
            value={formData.patientMunicipality}
            onValueChange={(value) => updateFormData("patientMunicipality", value)}
            disabled={!formData.patientProvince}
          >
            <SelectTrigger className={`bg-white ${!formData.patientProvince ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}>
              <SelectValue placeholder={formData.patientProvince ? "Seleccione municipio" : "Seleccione provincia primero"} />
            </SelectTrigger>
            <SelectContent>
              {formData.patientProvince &&
                getMunicipalitiesByProvince(formData.patientProvince).map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patientAddress">Dirección</Label>
        <Input
          id="patientAddress"
          placeholder="Dirección completa"
          value={formData.patientAddress}
          onChange={(e) => updateFormData("patientAddress", e.target.value)}
          className="bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientPhoneNumber">Teléfono</Label>
          <div className="flex">
            <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-sm">+53</span>
            <Input
              id="patientPhoneNumber"
              type="tel"
              placeholder="Teléfono"
              value={formData.patientPhoneNumber}
              onChange={(e) => updateFormData("patientPhoneNumber", e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientEmail">Email</Label>
          <Input
            id="patientEmail"
            type="email"
            placeholder="correo@example.com"
            value={formData.patientEmail}
            onChange={(e) => updateFormData("patientEmail", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
