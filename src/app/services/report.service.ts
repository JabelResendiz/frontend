import { api } from './api';

export interface VaccinatedSubject {
  fullName: string;
}

export interface Reporter {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface Vaccination {
  vaccineName: string;
  batchNumber: string;
  administrationSite: string;
  doseNumber: number;
  administrationDate: string;
  vaccinationCenter: string;
}

export interface Symptom {
  id: string;
  name: string;
}

export interface AdverseEvent {
  id?: number;
  startDate: string;
  visitedDoctor: boolean;
  wentToEmergencyRoom: boolean;
  permanentDisability: boolean;
  isLifeThreatening: boolean;
  resultedInDeath: boolean;
  deathDate: string | null;
  currentStatus: string;
  symptoms: Symptom[];
}

export interface ClinicalMedicalReviewRequest {
  adverseEventId: number | string;
  laboratoryResults: string;
  medDRACode: string;
  retClassification: string;
}

export interface CreateMedicalReviewRequest {
  reportId: number | string;
  causality: string;
  clinicalSignificance: string;
  reviewedAt: string;
  clinicalMedicalReviews: ClinicalMedicalReviewRequest[];
}

export interface AssignedReport {
  id: string;
  reportDate: string;
  vaccinatedSubject: VaccinatedSubject;
  reporter: Reporter;
  vaccinations: Vaccination[];
  adverseEvents: AdverseEvent[];
  medicalReviewAssignmentId?: number;
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

export interface MedicalReviewAssignment {
  medicalReviewerId: string;
  aefiReportId: string;
  assignedAt: string;
}

export const reportService = {
  getAssignedReports: async (pageNumber: number = 1, pageSize: number = 10): Promise<AssignedReportsResponse> => {
    const res = await api.get('/Report/assigned', {
      params: {
        pageNumber,
        pageSize,
      },
    });

    return res.data.data ?? res.data;
  },

  getAssignedReportsForReviewer: async (pageNumber: number = 1, pageSize: number = 10): Promise<AssignedReportsResponse> => {
    const res = await api.get('/Report/get-report-assigment', {
      params: {
        pageNumber,
        pageSize,
      },
    });

    return res.data.data ?? res.data;
  },

  createPublic: async (report: CreatePublicReportRequest): Promise<any> => {
    const res = await api.post('/Report/createPublic', report);
    return res.data;
  },

  createMedicalReview: async (review: CreateMedicalReviewRequest): Promise<any> => {
    const res = await api.post('/MedicalReview', review);
    return res.data;
  },

  getReportByNotificationNumber: async (notificationNumber: string): Promise<any> => {
    const res = await api.get('/Report/get-report', {
      params: { notificationNumber }
    });
    return res.data;
  },

  createMedicalReviewAssignment: async (assignment: MedicalReviewAssignment): Promise<any> => {
    const res = await api.post('/MedicalReviewAssignment/create', assignment);
    return res.data;
  },
};
