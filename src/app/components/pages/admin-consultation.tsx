import { useState } from 'react';
import { useReports } from '@/app/context/ReportContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export const AdminConsultation = () => {
  const { reports } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed' | 'reviewed'>('all');
  const [filterDoctor, setFilterDoctor] = useState('all');

  // Obtener lista única de doctores
  const doctors = Array.from(
    new Map(reports.map((r) => [r.doctorId, r.doctorName])).entries()
  ).map(([id, name]) => ({ id, name }));

  // Filtrar reportes
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;

    const matchesDoctor =
      filterDoctor === 'all' || report.doctorId === filterDoctor;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      case 'reviewed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'completed':
        return 'Completado';
      case 'reviewed':
        return 'Revisado';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Consultar Reportes</h1>
        <p className="text-gray-600">Busca y filtra reportes de todos los médicos</p>
      </div>

      {/* Controles de búsqueda y filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Búsqueda */}
            <div className="col-span-4 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, contenido o médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <Select
                value={filterStatus}
                onValueChange={(value: any) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por doctor */}
            <div>
              <Select
                value={filterDoctor}
                onValueChange={(value: any) => setFilterDoctor(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los médicos</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No se encontraron reportes con los filtros seleccionados</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDoctor('all');
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Mostrando <strong>{filteredReports.length}</strong> de <strong>{reports.length}</strong> reportes
              </p>
              <p className="text-sm text-gray-600">
                <Filter className="w-4 h-4 inline mr-1" />
                Filtros activos
              </p>
            </div>

            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{report.title}</CardTitle>
                      <CardDescription>
                        Por: <strong>{report.doctorName}</strong> • Creado:{' '}
                        {new Date(report.createdAt).toLocaleDateString('es-ES')}
                        {new Date(report.updatedAt).toISOString() !== new Date(report.createdAt).toISOString() && (
                          <>
                            {' '}
                            • Actualizado:{' '}
                            {new Date(report.updatedAt).toLocaleDateString('es-ES')}
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(report.status)} text-white`}>
                      {getStatusLabel(report.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {report.content}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    {report.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        Revisar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
