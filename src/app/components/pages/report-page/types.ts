export interface AdverseEvent {
  eventDate: string;
  eventFinishDate: string;
  eventDescription: string;
  eventSymptom: string;
  eventOutcome: string;
  eventHospitalization: string;
  eventMedicalAttention: string;
  eventIntensity: string;
  eventSeverityLevel: string;
  deathDateType?: "full" | "partial";
  deathDate?: string;
  // Doctor specific
  professionalDiagnosis?: string;
  medicalTerminology?: string;
  retClassification?: string;
  laboratoryResults?: string;
  clinicalSignificance?: string;
  vaccinationFacilityType?: string;
  contraindicationCriterion?: string;
}

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
  reporterProfessionalLicense?: string;
  reporterInstitution?: string;

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
  vaccinations: VaccinationProcess[];

  // Adverse Events
  adverseEvents: AdverseEvent[];

  // Patient Medical History (moved from event)
  patientMedicalHistory: string;
  currentMedications: string;
  allergies: string;
  otherVaccinesLastMonth: string;

  // Reporter info (final step - required)
  reporterType: string;
  reporterIdentityNumber: string;
  confidentialityAgreed: boolean;
}

export interface VaccinationProcess {
  vaccineId :string;

  vaccinationLotId?: string;
  vaccinationDate: string;

  doseNumber?: string;

  administrationRoute?: string;
  administrationSite?: string; 
  
  // Vaccination center location
  vaccinationProvince?: string;
  vaccinationMunicipality?: string;
  vaccinationCenterId?: string;
}


export type UpdateFormData = <K extends keyof FormData>(
  field: K,
  value: FormData[K]
) => void;