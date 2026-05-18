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
  lotNumber: string;
  administrationSite: string;
  doseNumber: number;
  administrationDate: string;
  vaccinationCenterName: string;
}

export interface Symptom {
  id: string;
  name: string;
}

export interface AdverseEvent {
  id?: string;
  startDate: string;
  finishDate?: string;
  visitedDoctor: boolean;
  wentToEmergencyRoom: boolean;
  permanentDisability: boolean;
  isLifeThreatening: boolean;
  resultedInDeath: boolean;
  deathDate: string | null;
  currentStatus: string;
  symptom?: Symptom;
  symptoms?: Symptom[];
  severity?: string;
  severityLevel?: string;
  intensity?: string;
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
  status?: string;
  globalSeverityLevel?: string;
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
  lotId: string;
  site: string;
  doseNumber: string;
  administrationDate: string;
  vaccinationCenterId: string;
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
  token?: string;
}

export interface MedicalReviewAssignment {
  medicalReviewerId: string;
  aefiReportId: string;
  assignedAt: string;
}

// Dashboard Statistics Interfaces - Municipal Focus
export interface DoctorWorkload {
  doctorId: string;
  doctorName: string;
  assignedReports: number;
  completedReports: number;
  pendingReports: number;
  overdueDays: number;
  avgReviewTime: number; // in hours
  isSaturated: boolean; // > 80% capacity
}

export interface ReportsPeriodStats {
  period: 'today' | 'week' | 'month' | '3months';
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  overdueReports: number;
  avgProcessingTime: number; // in hours
}

export interface BottleneckReport {
  reportId: string;
  vaccinatedPersonName: string;
  vaccineName: string;
  daysPending: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedDoctor?: string;
  urgencyScore: number; // 0-100
}

export interface UrgentEvent {
  reportId: string;
  patientName: string;
  event: string;
  eventType: 'death' | 'life-threatening' | 'emergency' | 'severe';
  reportedDate: string;
  status: 'pending' | 'in-review' | 'reviewed';
}

export interface VaccinationCenterStats {
  centerId: string;
  centerName: string;
  reportsGenerated: number;
  completionRate: number;
  avgReportTime: number;
}

export interface ReviewMetrics {
  avgReviewTime: number; // hours
  medianReviewTime: number;
  fastestDoctor: { name: string; time: number };
  slowestDoctor: { name: string; time: number };
}

export const reportService = {
  getAssignedReports: async (
    pageNumber: number = 1, 
    pageSize: number = 10,
    severity? : string,
    vaccineName? : string,
    vaccinationCenterId? : string,
    from? : string,
    to? : string,
    sortBy? : string,
    order? : "asc" | "desc"

  ): Promise<AssignedReportsResponse> => {
    const res = await api.get('/Report/sectionResponsible/assigned', {
      params: {
        pageNumber,
        pageSize,
        severity,
        vaccineName,
        vaccinationCenterId,
        from,
        to,
        sortBy,
        order
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

  // Dashboard Statistics Methods - Municipal Focus
  getDoctorWorkload: async (): Promise<DoctorWorkload[]> => {
    try {
      const res = await api.get('/Report/sectionResponsible/doctor-workload');
      return res.data.data ?? res.data ?? [];
    } catch (error) {
      console.warn('Could not fetch doctor workload from backend');
      return [];
    }
  },

  getReportsPeriodStats: async (period: 'today' | 'week' | 'month' | '3months'): Promise<ReportsPeriodStats> => {
    try {
      const res = await api.get('/Report/sectionResponsible/period-stats', {
        params: { period }
      });
      return res.data.data ?? res.data;
    } catch (error) {
      console.warn(`Could not fetch ${period} stats from backend`);
      return {
        period,
        totalReports: 0,
        completedReports: 0,
        pendingReports: 0,
        overdueReports: 0,
        avgProcessingTime: 0,
      };
    }
  },

  getBottleneckReports: async (): Promise<BottleneckReport[]> => {
    try {
      const res = await api.get('/Report/sectionResponsible/bottleneck-reports');
      return res.data.data ?? res.data ?? [];
    } catch (error) {
      console.warn('Could not fetch bottleneck reports');
      return [];
    }
  },

  getUrgentEvents: async (): Promise<UrgentEvent[]> => {
    try {
      const res = await api.get('/Report/sectionResponsible/urgent-events');
      return res.data.data ?? res.data ?? [];
    } catch (error) {
      console.warn('Could not fetch urgent events');
      return [];
    }
  },

  getVaccinationCenterStats: async (): Promise<VaccinationCenterStats[]> => {
    try {
      const res = await api.get('/Report/sectionResponsible/vaccination-centers');
      return res.data.data ?? res.data ?? [];
    } catch (error) {
      console.warn('Could not fetch vaccination center stats');
      return [];
    }
  }
  
};
