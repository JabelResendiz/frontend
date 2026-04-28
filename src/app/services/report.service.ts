import { api } from './api';

export interface VaccinatedSubject {
  fullName: string;
}

export interface Vaccination {
  vaccineName: string;
  vaccinationCenter: string;
}

export interface AdverseEvent {
  startDate: string;
  visitedDoctor: boolean;
  wentToEmergencyRoom: boolean;
  permanentDisability: boolean;
  isLifeThreatening: boolean;
  resultedInDeath: boolean;
  currentStatus: number;
}

export interface AssignedReport {
  reportDate: string;
  vaccinatedSubject: VaccinatedSubject;
  vaccinations: Vaccination[];
  adverseEvents: AdverseEvent[];
}

export interface AssignedReportsResponse {
  items: AssignedReport[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

// Interfaces for createPublic
export interface Reporter {
  fullName: string;
  reporterRelationship: string;
  identityNumber: string;
  dateOfBirth: string;
  provinceId: number;
  municipalityId: number;
  phoneNumber: string;
  email: string;
}

export interface VaccinatedSubjectCreate {
  fullName: string;
  identityNumber: string;
  dateOfBirth: string;
  gender: string;
  isPregnant: boolean;
  provinceId: number;
  municipalityId: number;
  healthArea: string;
  address: string;
  phoneNumber: string;
  email: string;
  currentMedications: string;
  allergies: string;
  medicalHistory: string;
}

export interface VaccinationCreate {
  vaccineId: string;
  batchNumber: string;
  site: string;
  doseNumber: number;
  administrationDate: string;
  vaccinationCenter: string;
}

export interface AdverseEventCreate {
  startDate: string;
  description: string;
  visitedDoctor: boolean;
  wentToEmergencyRoom: boolean;
  permanentDisability: boolean;
  isLifeThreatening: boolean;
  resultedInDeath: boolean;
  deathDate: string | null;
  currentStatus: string;
  symptoms: string[];
}

export interface CreatePublicReportRequest {
  reportDate: string;
  reporter: Reporter;
  vaccinatedSubject: VaccinatedSubjectCreate;
  vaccinations: VaccinationCreate[];
  adverseEvents: AdverseEventCreate[];
}

export const reportService = {
  getAssignedReports: async (pageNumber: number = 1, pageSize: number = 10): Promise<AssignedReportsResponse> => {
    const res = await api.get('/Report/assigned', {
      params: {
        pageNumber,
        pageSize,
      },
    });

    return res.data;
  },

  createPublic: async (report: CreatePublicReportRequest): Promise<any> => {
    const res = await api.post('/Report/createPublic', report);
    return res.data;
  },
};
