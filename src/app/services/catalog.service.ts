import { api } from './api';

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

export const catalogService = {
  getActiveVaccines: async (): Promise<VaccineCatalog[]> => {
    const res = await api.get('/GetCatalog/vaccines/actives');
    return res.data;
  },

  getActiveSymptoms: async (): Promise<SymptomCatalog[]> => {
    const res = await api.get('/GetCatalog/symptoms/actives');
    return res.data;
  },
};
