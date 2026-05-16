import { api } from './api';

export interface MunicipalOverview {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  completedReports: number;
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
};
