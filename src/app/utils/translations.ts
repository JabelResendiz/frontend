// utils/translations.ts

// Mapeos de enums (inglés) a texto en español
export const enumTranslations = {

  //Roles

  role:
  {
    SectionResponsible: "Jefe de Vacunación Municipal",
    Admin: "Administrador",
    MedicalReviewer : "Profesional Evaluador"
  },

  // Severidad
  severity: {
    Serious:"Serio",
    NonSerious: "No Serio"
  },
  
  // Estado del reporte
  reportStatus: {
    UnderReview: "En Revisión",
    Submitted: "Enviado",
    Approved: "Aprobado", 
    Rejected: "Rechazado",
    Completed: "Finalizado"
  },

  // estado de la asignación
  reviewAssignmentStatus : {
    Pending : "Pendiente",
    InProgress : "En progreso",
    Completed : "Completado",
    Rejected : "Rechazado",
    Expired : "Expirado",
    Cancelled : "Cancelado"
  },
  
  // Género
  gender: {
    Male: "Masculino",
    Female: "Femenino",
    Other: "Otro",
    Unknown: "Prefiere no decir"
  },
  
  // Sitio de administración
  administrationSite: {
    LeftArm: "Brazo Izquierdo",
    RightArm: "Brazo Derecho",
    LeftThigh: "Muslo Izquierdo",
    RightThigh: "Muslo Derecho",
    LeftGluteal: "Glúteo Izquierdo",
    RightGluteal: "Glúteo Derecho"
  },
  
  // Estado del paciente (evento)
  patientStatus: {
    Recovered: "Recuperado",
    Recovering: "En Recuperación",
    NotRecovered: "No Recuperado",
    Serious: "Serio",
    Unknown: "Desconocido",
    RecoveredWithSequelae: "Recuperado con Secuelas",
    Fatal: "Fatal"
  },
  
  // Intensidad del evento
  intensity: {
    Mild: "Leve",
    Moderate: "Moderado",
    Severe: "Severo",
    LifeThreatening: "Potencialmente mortal"
  },
  
  // Relación del reportante
  reporterRelationship: {
    Self : "Sujeto mismo",
    Parent: "Padre/Madre",
    Guardian: "Tutor",
    HealthcareProfessional: "Profesional de la Salud",
    Other: "Otro"
  },
  
  // Causalidad
  causality: {
    Definitive: "Definitiva",
    Probable: "Probable",
    Possible: "Posible",
    Improbable :"Improbable / No relacionada",
    NotEvaluable : "No evaluable"
  },
  
  // Significancia clínica
  clinicalSignificance: {
    ClinicallySignificantAndUnexpected: "Clínicamente significativo e inesperado",
    ExpectedEvent: "Evento esperado",
    SeriousOrLifeThreatening: "Evento serio o potencialmente mortal",
    MinorEvent : "Evento menor"
  }
};

// Helper genérico para traducir enums
export function translateEnum(
  value: string, 
  category: keyof typeof enumTranslations,
  defaultValue?: string
): string {
  const translations = enumTranslations[category];
  if (!translations) return defaultValue || value;
  
  // Buscar traducción (case-sensitive)
  const translation = translations[value as keyof typeof translations];
  return translation || defaultValue || value;
}

// Helpers específicos para cada tipo (más convenientes)
export const translateSeverity = (severity: string) => 
  translateEnum(severity, 'severity', severity);

export const translateReviewAssignmentStatus = (review: string) => 
  translateEnum(review, 'reviewAssignmentStatus', review);

export const translateRole = (role: string) => 
{
  console.log(role);
  return translateEnum(role, 'role', role);
}
  


export const translateReportStatus = (status: string) => 
  translateEnum(status, 'reportStatus', status);

export const translateGender = (gender: string) => 
  translateEnum(gender, 'gender', gender);

export const translateAdministrationSite = (site: string) => 
  translateEnum(site, 'administrationSite', site);

export const translatePatientStatus = (status: string) => 
  translateEnum(status, 'patientStatus', status);

export const translateIntensity = (intensity: string) => 
  translateEnum(intensity, 'intensity', intensity);

export const translateReporterRelationship = (relationship: string) => 
  translateEnum(relationship, 'reporterRelationship', relationship);

export const translateCausality = (causality: string) => 
  translateEnum(causality, 'causality', causality);

export const translateClinicalSignificance = (significance: string) => 
  translateEnum(significance, 'clinicalSignificance', significance);