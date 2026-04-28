import { api } from './api';

export interface DoctorRegistrationData {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  institution: string;
  professionalLicense: string;
  identityNumber: string;
  dateOfBirth: string;
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
  fullName: string;
  email: string;
  provinceId: number;
  municipalityId: number;
  institution: string;
  phoneNumber: string;
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

  getMedicalReviewersByCurrentUserMunicipality: async (pageNumber: number = 1, pageSize: number = 3): Promise<PaginatedResponse<MedicalReviewer>> => {
    const res = await api.get('/MedicalReviewer/by-current-user-municipality', {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return res.data;
  },
};
