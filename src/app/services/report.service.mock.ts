/**
 * MOCK DATA - Para testing sin backend
 * Copia estas funciones al final de report.service.ts si necesitas testear sin API
 */

export const MOCK_DOCTOR_STATS = [
  {
    doctorId: "1",
    doctorName: "Dr. Carlos García López",
    completedReports: 45,
    pendingReports: 3,
    reviewRating: 4.8,
    completionRate: 93.75,
  },
  {
    doctorId: "2",
    doctorName: "Dra. María Rodríguez Silva",
    completedReports: 42,
    pendingReports: 5,
    reviewRating: 4.6,
    completionRate: 89.36,
  },
  {
    doctorId: "3",
    doctorName: "Dr. Juan Pérez Martínez",
    completedReports: 38,
    pendingReports: 7,
    reviewRating: 4.4,
    completionRate: 84.44,
  },
  {
    doctorId: "4",
    doctorName: "Dra. Ana Fernández Torres",
    completedReports: 35,
    pendingReports: 8,
    reviewRating: 4.3,
    completionRate: 81.40,
  },
  {
    doctorId: "5",
    doctorName: "Dr. Roberto Sánchez Díaz",
    completedReports: 32,
    pendingReports: 10,
    reviewRating: 4.1,
    completionRate: 76.19,
  },
  {
    doctorId: "6",
    doctorName: "Dra. Patricia Gómez Ruiz",
    completedReports: 28,
    pendingReports: 12,
    reviewRating: 3.9,
    completionRate: 70.00,
  },
  {
    doctorId: "7",
    doctorName: "Dr. Luis Hernández Vega",
    completedReports: 25,
    pendingReports: 15,
    reviewRating: 3.7,
    completionRate: 62.50,
  },
  {
    doctorId: "8",
    doctorName: "Dra. Elena García Cruz",
    completedReports: 22,
    pendingReports: 18,
    reviewRating: 3.5,
    completionRate: 55.00,
  },
  {
    doctorId: "9",
    doctorName: "Dr. Francisco López Moreno",
    completedReports: 18,
    pendingReports: 22,
    reviewRating: 3.2,
    completionRate: 45.00,
  },
  {
    doctorId: "10",
    doctorName: "Dra. Sofía Martínez Blanco",
    completedReports: 15,
    pendingReports: 25,
    reviewRating: 2.9,
    completionRate: 37.50,
  },
];

export const MOCK_REPORTS_SUMMARY = {
  totalReports: 425,
  completedReports: 312,
  pendingReports: 88,
  expiredReports: 25,
  completionPercentage: 73.41,
};

export const MOCK_VACCINE_STATS = [
  {
    vaccineName: "Pfizer-BioNTech COVID-19",
    totalReports: 85,
    adverseEventsCount: 18,
    severityRate: 21.18,
  },
  {
    vaccineName: "Moderna COVID-19",
    totalReports: 62,
    adverseEventsCount: 12,
    severityRate: 19.35,
  },
  {
    vaccineName: "Influenza Trivalente",
    totalReports: 48,
    adverseEventsCount: 6,
    severityRate: 12.50,
  },
  {
    vaccineName: "Sarampión-Rubéola-Paperas",
    totalReports: 35,
    adverseEventsCount: 8,
    severityRate: 22.86,
  },
  {
    vaccineName: "Hepatitis B Recombinante",
    totalReports: 28,
    adverseEventsCount: 3,
    severityRate: 10.71,
  },
  {
    vaccineName: "Poliomielitis Inactivada",
    totalReports: 24,
    adverseEventsCount: 2,
    severityRate: 8.33,
  },
  {
    vaccineName: "Varicela",
    totalReports: 18,
    adverseEventsCount: 5,
    severityRate: 27.78,
  },
  {
    vaccineName: "Fiebre Amarilla",
    totalReports: 12,
    adverseEventsCount: 4,
    severityRate: 33.33,
  },
];

export const MOCK_MUNICIPALITY_STATS = [
  {
    municipalityId: 1,
    municipalityName: "La Habana",
    totalReports: 125,
    completedReports: 95,
    doctorCount: 25,
  },
  {
    municipalityId: 2,
    municipalityName: "Santiago de Cuba",
    totalReports: 85,
    completedReports: 62,
    doctorCount: 18,
  },
  {
    municipalityId: 3,
    municipalityName: "Santa Clara",
    totalReports: 65,
    completedReports: 48,
    doctorCount: 12,
  },
  {
    municipalityId: 4,
    municipalityName: "Camagüey",
    totalReports: 52,
    completedReports: 38,
    doctorCount: 10,
  },
  {
    municipalityId: 5,
    municipalityName: "Guantánamo",
    totalReports: 38,
    completedReports: 28,
    doctorCount: 7,
  },
  {
    municipalityId: 6,
    municipalityName: "Holguín",
    totalReports: 35,
    completedReports: 25,
    doctorCount: 6,
  },
  {
    municipalityId: 7,
    municipalityName: "Matanzas",
    totalReports: 25,
    completedReports: 16,
    doctorCount: 5,
  },
];

/**
 * Funciones para usar con los datos mockados
 * Descomenta en report.service.ts para testing
 */

/*
// Reemplazar método getDoctorReportStats
getDoctorReportStats: async (limit: number = 10): Promise<DoctorReportStats[]> => {
  // Simulación de delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_DOCTOR_STATS.slice(0, limit);
},

// Reemplazar método getReportsSummary
getReportsSummary: async (): Promise<ReportsSummary> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_REPORTS_SUMMARY;
},

// Reemplazar método getVaccineStats
getVaccineStats: async (): Promise<VaccineStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_VACCINE_STATS;
},

// Reemplazar método getMunicipalityStats
getMunicipalityStats: async (): Promise<MunicipalityStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 350));
  return MOCK_MUNICIPALITY_STATS;
},
*/

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Para testing sin backend:
 *    - Copia las 4 funciones mockadas arriba
 *    - Reemplaza los métodos en report.service.ts
 *    - Los gráficos mostrarán datos realistas
 * 
 * 2. Para cambiar los datos de prueba:
 *    - Edita los arrays MOCK_* arriba
 *    - Recarga el navegador
 * 
 * 3. Para volver a llamadas API:
 *    - Comenta las funciones mockadas
 *    - Descomenta los métodos originales en report.service.ts
 * 
 * 4. Para agregar más datos:
 *    - El sistema soporta arrays grandes sin problemas
 *    - Recharts escala automáticamente
 *    - Las tarjetas limitan a top 10 automáticamente
 */
