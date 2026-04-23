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
};
