import { api } from './api';

export interface MunicipalOverview {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  completedReports: number;
  rejectedReports: number;
  averageReviewTimeHours: number;
  completionRate: number;
}

export interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  assignedReports: number;
  completedReports: number;
  pendingReports: number;
  expiredReports: number;
  cancelledReports: number;
  averageReviewTimeHours: number;
  completionRate: number;
  // Número de casos graves completados (provisto por el backend)
  numeroDeCasosGravesCompletados?: number;
}

export type MunicipalCharacterizationPeriod = '7d' | '1m' | '3m' | '6m' | '1y' | 'all' | 'custom';

export interface TopVaccineStat {
  vaccineName: string;
  totalReports: number;
}

export interface TopSymptomStat {
  symptomName: string;
  totalReports: number;
}

export interface SeverityDistributionItem {
  severity: string;
  totalReports: number;
}

export interface ReportsTimelineItem {
  label: string;
  totalReports: number;
}

export interface MunicipalCharacterization {
  topVaccines: TopVaccineStat[];
  topSymptoms: TopSymptomStat[];
  severityDistribution: SeverityDistributionItem[];
  reportsTimeline: ReportsTimelineItem[];
  totalDeaths?: number;
  totalVisitedDoctor?: number;
  totalEmergencyRoom?: number;
  totalPermanentDisability?: number;
  totalLifeThreatening?: number;
}

export const municipalDashboardService = {
  /**
   * Obtiene el overview del dashboard municipal
   * GET /MunicipalDashboard/overview
   */
  async getOverview(): Promise<MunicipalOverview> {
    const response = await api.get<MunicipalOverview>('/MunicipalDashboard/overview');
    return response.data;
  },

  /**
   * Obtiene el desempeño de los médicos
   * GET /MunicipalDashboard/doctors-performance
   */
  async getDoctorsPerformance(): Promise<DoctorPerformance[]> {
    const response = await api.get<DoctorPerformance[]>('/MunicipalDashboard/doctors-performance');
    return response.data;
  },

  async getCharacterization(
    period?: MunicipalCharacterizationPeriod,
    from?: string,
    to?: string,
  ): Promise<MunicipalCharacterization> {
    const params: Record<string, string> = {};

    if (period && period !== 'all' && period !== 'custom') {
      params.period = period;
    }

    if (from) {
      params.from = from;
    }

    if (to) {
      params.to = to;
    }

    const response = await api.get<MunicipalCharacterization>('/MunicipalDashboard/stats_municipal', {
      params,
    });

    return response.data;
  },
};
