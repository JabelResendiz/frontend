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

export const doctorService = {
  registerMedicalReviewer: async (data: DoctorRegistrationData): Promise<DoctorRegistrationResponse> => {
    const res = await api.post('/MedicalReviewer/register', data);
    return res.data;
  },
};
