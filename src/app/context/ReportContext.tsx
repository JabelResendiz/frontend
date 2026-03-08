import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Report {
  id: string;
  doctorId: string;
  doctorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'reviewed';
}

interface ReportContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReport: (id: string, report: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  getReportsByDoctor: (doctorId: string) => Report[];
  getReportById: (id: string) => Report | undefined;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);

  // Cargar reportes desde localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      // Si no hay reportes guardados, inicializar con ejemplos
      initializeWithExamples();
    }
  }, []);

  const initializeWithExamples = () => {
    // Obtener el usuario actual para usar su ID
    const currentUser = localStorage.getItem('user');
    let doctorId = 'example-doctor';
    let doctorName = 'Dr. Carlos García López';

    if (currentUser) {
      const user = JSON.parse(currentUser);
      doctorId = user.id;
      doctorName = user.userName;
    }

    const exampleReports: Report[] = [
      {
        id: '1',
        doctorId: doctorId,
        doctorName: doctorName,
        title: 'Reporte de Reacción Alérgica - Paciente M.R.',
        content: 'Paciente presenta reacción alérgica leve después de aplicar la vacuna. Se observó enrojecimiento en el área de inyección aproximadamente 30 minutos después de la administración. La reacción fue controlada con antihistamínico. Paciente evoluciona favorablemente.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        doctorId: doctorId,
        doctorName: doctorName,
        title: 'Seguimiento Post-Vacunación - Paciente J.D.',
        content: 'Seguimiento a 24 horas de la administración. El paciente reporta fiebre moderada (38.5°C) y dolor muscular leve. Signos vitales estables. Se recomienda reposo y acetaminofén según sea necesario. Reavaluar en 48 horas.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // hace 12 horas
        status: 'completed',
      },
      {
        id: '3',
        doctorId: doctorId,
        doctorName: doctorName,
        title: 'Consulta Inicial - Paciente A.M.',
        content: 'Primera consulta para evaluación pre-vacunación. Antecedentes médicos revisados. Paciente con alergias a penicilina documentadas. Se recomienda vacunación en centro médico con equipo de emergencia disponible.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      },
    ];

    setReports(exampleReports);
    localStorage.setItem('reports', JSON.stringify(exampleReports));
  };

  // Guardar reportes en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports([...reports, newReport]);
  };

  const updateReport = (id: string, updatedData: Partial<Report>) => {
    setReports(
      reports.map((report) =>
        report.id === id
          ? { ...report, ...updatedData, updatedAt: new Date().toISOString() }
          : report
      )
    );
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter((report) => report.id !== id));
  };

  const getReportsByDoctor = (doctorId: string) => {
    return reports.filter((report) => report.doctorId === doctorId);
  };

  const getReportById = (id: string) => {
    return reports.find((report) => report.id === id);
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReport, deleteReport, getReportsByDoctor, getReportById }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports debe ser usado dentro de ReportProvider');
  }
  return context;
};
