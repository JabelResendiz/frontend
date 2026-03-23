import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Eye, Download } from 'lucide-react';

interface AssignedReport {
  id: string;
  patientName: string;
  vaccineType: string;
  reportDate: string;
  status: 'pending' | 'in-review' | 'completed';
  createdBy: string;
  severity: 'leve' | 'moderado' | 'grave';
}

interface AssignedReportsPageProps {
  onNavigate: (page: string, reportId?: string) => void;
}

// Mock data - Reportes asignados al médico
const mockAssignedReports: AssignedReport[] = [
  {
    id: 'AR-001',
    patientName: 'Carlos López',
    vaccineType: 'Soberana 02',
    reportDate: '2026-03-20',
    status: 'pending',
    createdBy: 'Usuario - Reportante',
    severity: 'moderado',
  },
  {
    id: 'AR-002',
    patientName: 'María García',
    vaccineType: 'Abdala',
    reportDate: '2026-03-19',
    status: 'pending',
    createdBy: 'Usuario - Reportante',
    severity: 'leve',
  },
  {
    id: 'AR-003',
    patientName: 'Juan Rodríguez',
    vaccineType: 'Soberana Plus',
    reportDate: '2026-03-18',
    status: 'in-review',
    createdBy: 'Usuario - Reportante',
    severity: 'grave',
  },
  {
    id: 'AR-004',
    patientName: 'Ana Martínez',
    vaccineType: 'Mambisa',
    reportDate: '2026-03-17',
    status: 'completed',
    createdBy: 'Usuario - Reportante',
    severity: 'leve',
  },
];

export const AssignedReportsPage = ({ onNavigate }: AssignedReportsPageProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<AssignedReport[]>(mockAssignedReports);

  if (!user || user.role !== 'doctor') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Acceso denegado. Solo médicos pueden acceder a este panel.</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-500';
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
      case 'pending':
        return 'Pendiente';
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
        <h1 className="text-4xl font-bold mb-2">Reportes Asignados</h1>
        <p className="text-gray-600">Revisa y completa los reportes de eventos adversos asignados a ti</p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600 mb-4">No tienes reportes asignados</p>
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
                      <CardTitle className="text-lg">{report.patientName}</CardTitle>
                      <Badge className={`${getStatusBadgeColor(report.status)} text-white whitespace-nowrap`}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>Reporte: <strong>{report.id}</strong></span>
                        <span>Vacuna: <strong>{report.vaccineType}</strong></span>
                        <span>Fecha: <strong>{report.reportDate}</strong></span>
                        <span className={`font-semibold ${getSeverityColor(report.severity)}`}>
                          Severidad: {getSeverityLabel(report.severity)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => onNavigate('review-report', report.id)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver y Completar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
