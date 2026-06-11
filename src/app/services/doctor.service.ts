import { api } from './api';

export interface DoctorRegistrationData {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  institution: string;
  professionalLicense: string;
  identityNumber: string;
  specialty: string;
}

export interface DoctorRegistrationResponse {
  message: string;
  success?: boolean;
  type?: 'OperationError' | 'OperationSuccess' | string;
  data?: any;
}

export interface Doctor {
  id?: string;
  userName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  professionalLicense: string;
  identityNumber: string;
  dateOfBirth: string;
  specialty: string;
}

export interface MedicalReviewer {
  id: string;
  fullName: string;
  institution: string;
  phoneNumber: string;
  totalAssignments:number;
  pendingAssignments:number;
  completedAssignments:number;
  expiredAssignments:number;
  averageTimeReview:number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  nextPageUrl?: string;
  previousPageUrl?: string;
}

export const doctorService = {
  registerMedicalReviewer: async (data: DoctorRegistrationData): Promise<DoctorRegistrationResponse> => {
    const res = await api.post('/MedicalReviewer/register', data);
    return res.data;
  },


  getAllMedicalReviewer: async (
  ): Promise<PaginatedResponse<MedicalReviewer>> => {
    const res = await api.get('/MedicalReviewer/summary');
    const data = res.data;
    if (Array.isArray(data)) {
      return {
        items: data,
        totalCount: data.length,
        pageNumber: 1,
        pageSize: data.length,
        nextPageUrl: null,
        previousPageUrl: null,
      };
    }
    return data;
  },

  getMedicalReviewersByCurrentUserMunicipality: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    search: string = '',
    speciality: string = '',
    sortBy: string = '',
    order: string = ''
  ): Promise<PaginatedResponse<MedicalReviewer>> => {
    const res = await api.get('/MedicalReviewer/by-current-user-municipality', {
      params: {
        pageNumber,
        pageSize,
        search: search || undefined,
        speciality: speciality || undefined,
        sortBy: sortBy || undefined,
        order: order || undefined,
      },
    });
    return res.data;
  },
};
