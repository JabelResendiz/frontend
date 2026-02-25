import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  patientName: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'completed' | 'in-review';
  content: string;
  symptoms: string;
  severity: 'leve' | 'moderado' | 'grave';
}

interface DoctorDashboardProps {
  onNavigate: (page: string, reportId?: string) => void;
}

// Mock data - Reportes fijos para demostración
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Reporte de Reacción Alérgica - Paciente M.R.',
    patientName: 'M.R.',
    createdAt: '2026-02-22',
    status: 'completed',
    content: 'Paciente presenta reacción alérgica leve después de aplicar la vacuna. Se observó enrojecimiento en el área de inyección aproximadamente 30 minutos después de la administración. La reacción fue controlada con antihistamínico. Paciente evoluciona favorablemente.',
    symptoms: 'Enrojecimiento en sitio de inyección, Prurito leve',
    severity: 'leve',
  },
  {
    id: '2',
    title: 'Seguimiento Post-Vacunación - Paciente J.D.',
    patientName: 'J.D.',
    createdAt: '2026-02-24',
    status: 'sent',
    content: 'Seguimiento a 24 horas de la administración. El paciente reporta fiebre moderada (38.5°C) y dolor muscular leve. Signos vitales estables. Se recomienda reposo y acetaminofén según sea necesario. Reavaluar en 48 horas.',
    symptoms: 'Fiebre moderada, Dolor muscular, Fatiga',
    severity: 'moderado',
  },
  {
    id: '3',
    title: 'Consulta Inicial - Paciente A.M.',
    patientName: 'A.M.',
    createdAt: '2026-02-25',
    status: 'draft',
    content: 'Primera consulta para evaluación pre-vacunación. Antecedentes médicos revisados. Paciente con alergias a penicilina documentadas. Se recomienda vacunación en centro médico con equipo de emergencia disponible.',
    symptoms: 'Sin síntomas (Evaluación pre-vacunación)',
    severity: 'leve',
  },
  {
    id: '4',
    title: 'Evento Adverso Grave - Paciente L.S.',
    patientName: 'L.S.',
    createdAt: '2026-02-20',
    status: 'in-review',
    content: 'Paciente presenta síntomas de anafilaxia aproximadamente 15 minutos después de la vacunación. Se administró epinefrina inmediatamente. Paciente estabilizado y trasladado a unidad de cuidados intensivos. Seguimiento continuo requerido.',
    symptoms: 'Dificultad respiratoria, Hipotensión, Edema facial',
    severity: 'grave',
  },
];

export const DoctorDashboard = ({ onNavigate }: DoctorDashboardProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!user || user.role !== 'doctor') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos pueden acceder a este panel.</p>
      </div>
    );
  }

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    setDeleteId(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'sent':
        return 'bg-blue-500';
      case 'in-review':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'sent':
        return 'Enviado';
      case 'in-review':
        return 'En Revisión';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'leve':
        return 'text-green-600';
      case 'moderado':
        return 'text-yellow-600';
      case 'grave':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'leve':
        return 'Leve';
      case 'moderado':
        return 'Moderado';
      case 'grave':
        return 'Grave';
      default:
        return severity;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Panel del Médico</h1>
        <p className="text-gray-600">Bienvenido, Dr. {user.name}</p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => onNavigate('report')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo Reporte
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600 mb-4">No tienes reportes aún</p>
            <Button onClick={() => onNavigate('report')}>
              Crear tu primer reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge className={`${getStatusBadgeColor(report.status)} text-white whitespace-nowrap`}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>Paciente: <strong>{report.patientName}</strong></span>
                        <span>Fecha: <strong>{report.createdAt}</strong></span>
                        <span className={`font-semibold ${getSeverityColor(report.severity)}`}>
                          Severidad: {getSeverityLabel(report.severity)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Síntomas:</p>
                    <p className="text-sm text-gray-600">{report.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Descripción:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{report.content}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onNavigate('edit-report', report.id)}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Eliminar reporte</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteReport(report.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
