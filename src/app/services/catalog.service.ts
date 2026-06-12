import { api } from './api';
import { PROVINCES_AND_MUNICIPALITIES } from '@/app/data/municipalities';

export interface CatalogItem {
  id: string;
  name: string;
}

export interface VaccineCatalog extends CatalogItem {
  // Propiedades específicas de vacunas si las hay
}

export interface SymptomCatalog extends CatalogItem {
  // Propiedades específicas de síntomas si las hay
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
}

export const catalogService = {
  getActiveVaccines: async (): Promise<VaccineCatalog[]> => {
    const res = await api.get('/GetCatalog/vaccines/actives');
    return res.data;
  },

  getActiveSymptoms: async (): Promise<SymptomCatalog[]> => {
    const res = await api.get('/GetCatalog/symptoms/actives');
    return res.data;
  },

  getFinlayVaccines: async (): Promise<VaccineCatalog[]> => {
    const res = await api.get('/GetCatalog/finlayVaccines');
    return res.data;
  },

  getManufacturers: async (): Promise<Manufacturer[]> => {
    const res = await api.get('/Manufacturer');
    return res.data;
  },

  getProvinces: async (): Promise<string[]> => {
    // Extrae las provincias del archivo municipalities.ts
    return Object.keys(PROVINCES_AND_MUNICIPALITIES);
  },

  getVaccines: async (): Promise<VaccineCatalog[]> => {
    const res = await api.get('/GetCatalog/vaccine?PageNumber=1&PageSize=100');
    return res.data?.items || res.data || [];
  },
};
