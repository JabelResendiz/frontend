import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

interface EditReportPageProps {
  reportId: string | undefined;
  onNavigate: (page: string) => void;
}

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

// Mock data para simular reportes existentes
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

export const EditReportPage = ({ reportId, onNavigate }: EditReportPageProps) => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'completed' | 'in-review'>('draft');
  const [severity, setSeverity] = useState<'leve' | 'moderado' | 'grave'>('leve');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [patientName, setPatientName] = useState('');
  const isEditing = !!reportId;

  useEffect(() => {
    if (isEditing && reportId) {
      const report = mockReports.find(r => r.id === reportId);
      if (report) {
        setReportTitle(report.title);
        setPatientName(report.patientName);
        setSymptoms(report.symptoms);
        setContent(report.content);
        setStatus(report.status);
        setSeverity(report.severity);
      } else {
        setError('Reporte no encontrado');
      }
    }
  }, [reportId, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!symptoms.trim()) {
        throw new Error('Los síntomas son requeridos');
      }
      if (!content.trim()) {
        throw new Error('El contenido es requerido');
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      setSuccess(isEditing ? 'Reporte actualizado exitosamente' : 'Reporte creado exitosamente');
      
      if (!isEditing) {
        setReportTitle('');
        setPatientName('');
        setSymptoms('');
        setContent('');
        setStatus('draft');
        setSeverity('leve');
      }

      setTimeout(() => {
        onNavigate('doctor-dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => onNavigate('doctor-dashboard')}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Reporte' : 'Crear Nuevo Reporte'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Actualiza los detalles de tu reporte'
              : 'Completa el formulario para crear un nuevo reporte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Reporte (Solo lectura)</Label>
                  <Input
                    id="title"
                    value={reportTitle}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient">Nombre del Paciente (Solo lectura)</Label>
                  <Input
                    id="patient"
                    value={patientName}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="symptoms">Síntomas *</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe los síntomas observados..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Descripción del Reporte *</Label>
              <Textarea
                id="content"
                placeholder="Escribe la descripción detallada del reporte..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severidad</Label>
                <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="grave">Grave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="in-review">En Revisión</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading
                  ? isEditing
                    ? 'Actualizando...'
                    : 'Creando...'
                  : isEditing
                  ? 'Actualizar Reporte'
                  : 'Crear Reporte'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('doctor-dashboard')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
