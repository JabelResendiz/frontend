import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { CardDescription, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";
import { FormData, UpdateFormData } from "./types";
import { useState } from "react";

interface ReporterInfoSectionProps {
  formData: FormData;
  updateFormData: UpdateFormData;
  isAutoFilled: boolean;
  reporterFieldsRef: React.RefObject<HTMLDivElement>;
  dateErrors?: Record<string, string>;
}

export function ReporterInfoSection({ formData, updateFormData, isAutoFilled, reporterFieldsRef, dateErrors }: ReporterInfoSectionProps) {
  const isPatient = formData.reporterRelationship === "paciente";
  const [reporterFieldErrors, setReporterFieldErrors] = useState<Record<string, string>>({});

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

  const validatePhoneNumber = (phoneNumber: string): boolean => /^\d+$/.test(phoneNumber);

  const validateIdentityNumber = (identityNumber: string): boolean => /^\d{11}$/.test(identityNumber);

  const validateIdentityMatchesDate = (identityNumber: string, dateOfBirth: string): boolean => {
    if (!validateIdentityNumber(identityNumber) || !dateOfBirth) return false;
    const yy = identityNumber.substring(0, 2);
    const mm = identityNumber.substring(2, 4);
    const dd = identityNumber.substring(4, 6);
    const year = parseInt(yy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);
    const currentYearTwoDigits = new Date().getFullYear() % 100;
    const fullYear = year > currentYearTwoDigits ? 1900 + year : 2000 + year;
    const extractedDate = new Date(fullYear, month - 1, day);
    if (isNaN(extractedDate.getTime())) return false;
    return extractedDate.toISOString().slice(0, 10) === dateOfBirth;
  };

  const validateReporterField = (field: string, rawValue: string, normalizedValue = rawValue) => {
    const errors = { ...reporterFieldErrors };
    switch (field) {
      case 'reporterIdentityNumber':
        if (rawValue && /\D/.test(rawValue)) {
          errors.reporterIdentityNumber = "Solo se permiten dígitos; no se aceptan letras, espacios ni caracteres especiales.";
        } else if (normalizedValue && normalizedValue.length !== 11) {
          errors.reporterIdentityNumber = "Debe contener exactamente 11 dígitos.";
        } else if (normalizedValue && formData.reporterDateOfBirth && !validateIdentityMatchesDate(normalizedValue, formData.reporterDateOfBirth)) {
          errors.reporterIdentityNumber = "La fecha de nacimiento no coincide con la cédula.";
        } else {
          delete errors.reporterIdentityNumber;
        }
        break;
      case 'reporterDateOfBirth':
        if (rawValue && formData.reporterIdentityNumber && !validateIdentityMatchesDate(formData.reporterIdentityNumber, rawValue)) {
          errors.reporterDateOfBirth = "La fecha debe coincidir con la cédula (YYMMDD).";
        } else {
          delete errors.reporterDateOfBirth;
        }
        break;
      case 'reporterPhoneNumber':
        if (rawValue && !validatePhoneNumber(normalizedValue)) {
          errors.reporterPhoneNumber = "Solo se permiten dígitos.";
        } else {
          delete errors.reporterPhoneNumber;
        }
        break;
      case 'reporterEmail':
        if (rawValue && !validateEmail(rawValue)) {
          errors.reporterEmail = "Email inválido.";
        } else {
          delete errors.reporterEmail;
        }
        break;
    }
    setReporterFieldErrors(errors);
  };

  const handleReporterFieldChange = (field: string, value: string) => {
    let normalizedValue = value;
    if (field === 'reporterIdentityNumber') {
      normalizedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    if (field === 'reporterPhoneNumber') {
      normalizedValue = value.replace(/\D/g, '');
    }

    updateFormData(field as keyof FormData, normalizedValue);
    validateReporterField(field, value, normalizedValue);
  };

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
            <Label htmlFor="reporterIdentityNumber">Número de Identidad *</Label>
            <Input
              id="reporterIdentityNumber"
              placeholder="Carnet de identidad"
              value={formData.reporterIdentityNumber}
              onChange={(e) => handleReporterFieldChange("reporterIdentityNumber", e.target.value)}
              disabled={isPatient}
              inputMode="numeric"
              maxLength={11}
              pattern="\d*"
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
            {reporterFieldErrors.reporterIdentityNumber && !isPatient && (
              <p className="text-sm text-red-600">{reporterFieldErrors.reporterIdentityNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterDateOfBirth">Fecha de Nacimiento *</Label>
            <Input
              id="reporterDateOfBirth"
              type="date"
              value={formData.reporterDateOfBirth}
              onChange={(e) => handleReporterFieldChange("reporterDateOfBirth", e.target.value)}
              disabled={isPatient}
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""} ${(dateErrors?.reporterDateOfBirth || reporterFieldErrors.reporterDateOfBirth) ? "border-red-500" : ""}`}
            />
            {(dateErrors?.reporterDateOfBirth || reporterFieldErrors.reporterDateOfBirth) && !isPatient && (
              <p className="text-sm text-red-600">{reporterFieldErrors.reporterDateOfBirth || dateErrors?.reporterDateOfBirth}</p>
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
                onChange={(e) => handleReporterFieldChange("reporterPhoneNumber", e.target.value)}
                disabled={isPatient}
                className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
              />
              {reporterFieldErrors.reporterPhoneNumber && !isPatient && (
                <p className="text-sm text-red-600">{reporterFieldErrors.reporterPhoneNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterEmail">Email *</Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="correo@example.com"
              value={formData.reporterEmail}
              onChange={(e) => handleReporterFieldChange("reporterEmail", e.target.value)}
              disabled={isPatient}
              className={`bg-white ${isPatient ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
            {reporterFieldErrors.reporterEmail && !isPatient && (
              <p className="text-sm text-red-600">{reporterFieldErrors.reporterEmail}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
