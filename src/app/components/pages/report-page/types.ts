export interface FormData {
  // Reportante info
  reporterFullName: string;
  reporterDateOfBirth: string;
  reporterGender: string;
  reporterProvince: string;
  reporterMunicipality: string;
  reporterPhoneNumber: string;
  reporterEmail: string;
  reporterRelationship: string;

  // Patient (VaccinatedSubject) info
  patientFullName: string;
  patientIdentityNumber: string;
  patientDateOfBirth: string;
  patientGender: string;
  patientProvince: string;
  patientMunicipality: string;
  patientAddress: string;
  patientPhoneNumber: string;
  patientEmail: string;
  patientIsPregnant: string;
  patientAge: string;

  // Vaccine info
  // vaccineName: string;
  // vaccineManufacturer: string;
  // vaccineBatchNumber: string;
  // vaccinationDate: string;
  // vaccinationSite: string;
  // doseNumber: string;
  vaccinations: VaccinationProcess[];

  // Event info - General
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  eventSymptoms: string[];
  eventOutcome: string;
  eventHospitalization: string;
  eventMedicalAttention: string;

  // Event info - Reportante specific
  eventSeverity: string;
  patientMedicalHistory: string;
  currentMedications: string;
  allergies: string;
  otherVaccinesLastMonth: string;
  deathDateType?: "full" | "partial";
  deathDate?:string;

  // Event info - Doctor specific
  professionalDiagnosis: string;
  medicalTerminology: string;
  retClassification: string;
  laboratoryResults: string;
  clinicalSignificance: string;
  vaccinationFacilityType: string;
  contraindicationCriterion: string;

  // Reporter info (final step - required)
  reporterType: string;
  reporterCI: string;
}

export interface VaccinationProcess {
  vaccineName :string;
  vaccineManufacturer?: string;
  vaccineBatchNumber?: string;
  vaccinationDate: string;
  vaccinationSite: string;
  doseNumber?: string;
}

// export type UpdateFormData = (field: keyof FormData, value: any) => void;

export type UpdateFormData = <K extends keyof FormData>(
  field: K,
  value: FormData[K]
) => void;