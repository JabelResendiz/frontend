import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportService, type DuplicateDetailResponse } from "@/app/services/report.service";
import { translateReportStatus, translateSeverity, translateGender, translatePossibleDuplicate,
  translatePatientStatus
 } from "@/app/utils/translations";

interface DuplicateDetailDialogProps {
  isOpen: boolean;
  duplicateId: string;
  duplicateData?: DuplicateDetailResponse | null;
  isLoading?: boolean;
  onClose: () => void;
  onResolved?: (duplicateId: string, verdict: string) => void;
}

export function DuplicateDetailDialog({
  isOpen,
  duplicateId,
  duplicateData,
  isLoading = false,
  onClose,
  onResolved,
}: DuplicateDetailDialogProps) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (verdict: 'SeparateAsNew' | 'ConfirmedDuplicate') => {
    setResolving(true);
    try {
      await reportService.resolveDuplicate(duplicateId, verdict);
      const verdictLabel = verdict === 'ConfirmedDuplicate' ? 'Duplicado confirmado' : 'Separado como nuevo';
      toast.success(`${verdictLabel} - Reporte actualizado`);
      onResolved?.(duplicateId, verdict);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al resolver duplicado';
      console.error('Error resolving duplicate:', error);
      toast.error(errorMessage);
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparación de Reportes Duplicados</DialogTitle>
          <DialogDescription>
            Revise ambos reportes lado a lado y determine si son duplicados o no.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando detalles...</span>
          </div>
        ) : duplicateData ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 rounded-3xl border border-slate-200">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Tipo de duplicado:</span> {translatePossibleDuplicate(duplicateData.enumReportDuplicate)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  {/* <span className="text-sm text-slate-600">Original: {duplicateData.aefiReportOriginal.id}</span>
                  <span className="text-sm text-slate-600">Copia: {duplicateData.aefiReportCopy.id}</span> */}
                  <span className="text-sm text-slate-600">Fecha original: {new Date(duplicateData.aefiReportOriginal.reportDate).toLocaleString('es-ES')}</span>
                  <span className="text-sm text-slate-600">Fecha copia: {new Date(duplicateData.aefiReportCopy.reportDate).toLocaleString('es-ES')}</span>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <h4 className="text-lg font-semibold">Información del Paciente</h4>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr] text-sm">
                  <div className="space-y-3 text-slate-600">
                    <div className="font-semibold">Campo</div>
                    <div>Nombre</div>
                    <div>Edad</div>
                    <div>Género</div>
                    <div>Embarazada</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="font-semibold uppercase text-slate-500">Original</div>
                    <div className="text-slate-900">{duplicateData.aefiReportOriginal.vaccinatedSubject.fullName}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportOriginal.vaccinatedSubject.age} años</div>
                    <div className="text-slate-900">{translateGender(duplicateData.aefiReportOriginal.vaccinatedSubject.gender)}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportOriginal.vaccinatedSubject.isPregnant ? 'Sí' : 'No'}</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="font-semibold uppercase text-slate-500">Copia</div>
                    <div className="text-slate-900">{duplicateData.aefiReportCopy.vaccinatedSubject.fullName}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportCopy.vaccinatedSubject.age} años</div>
                    <div className="text-slate-900">{translateGender(duplicateData.aefiReportCopy.vaccinatedSubject.gender)}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportCopy.vaccinatedSubject.isPregnant ? 'Sí' : 'No'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <h4 className="text-lg font-semibold">Estado del Reporte</h4>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr] text-sm">
                  <div className="space-y-3 text-slate-600">
                    <div className="font-semibold">Campo</div>
                    <div>ID</div>
                    <div>Estado</div>
                    <div>Severidad</div>
                    <div>Médico Revisor</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="font-semibold uppercase text-slate-500">Original</div>
                    <div className="text-slate-900 font-mono text-xs break-all">{duplicateData.aefiReportOriginal.notificationNumber}</div>
                    <div className="text-slate-900">{translateReportStatus(duplicateData.aefiReportOriginal.status)}</div>
                    <div className="text-slate-900">{translateSeverity(duplicateData.aefiReportOriginal.globalSeverityLevel)}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportOriginal.lastDoctorName || 'No asignado'}</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="font-semibold uppercase text-slate-500">Copia</div>
                    <div className="text-slate-900 font-mono text-xs break-all">{duplicateData.aefiReportCopy.notificationNumber}</div>
                    <div className="text-slate-900">{translateReportStatus(duplicateData.aefiReportCopy.status)}</div>
                    <div className="text-slate-900">{translateSeverity(duplicateData.aefiReportCopy.globalSeverityLevel)}</div>
                    <div className="text-slate-900">{duplicateData.aefiReportCopy.lastDoctorName || 'No asignado'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Vacunaciones Original</h4>
                    <span className="text-xs text-slate-500">{duplicateData.aefiReportOriginal.vaccinations.length} item(s)</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {duplicateData.aefiReportOriginal.vaccinations.map((vac, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-800">{vac.vaccineName}</p>
                        <p className="text-slate-700">{vac.vaccinationCenterName}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Vacunaciones Copia</h4>
                    <span className="text-xs text-slate-500">{duplicateData.aefiReportCopy.vaccinations.length} item(s)</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {duplicateData.aefiReportCopy.vaccinations.map((vac, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-800">{vac.vaccineName}</p>
                        <p className="text-slate-700">{vac.vaccinationCenterName}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Eventos Adversos Original</h4>
                    <span className="text-xs text-slate-500">{duplicateData.aefiReportOriginal.adverseEvents.length} item(s)</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {duplicateData.aefiReportOriginal.adverseEvents.map((event, idx) => (
                      <div key={idx} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                        <p className="font-medium text-red-900">Inicio: {new Date(event.startDate).toLocaleString('es-ES')}</p>
                        <p className="text-slate-700">Fin: {event.finishDate ? new Date(event.finishDate).toLocaleString('es-ES') : 'Pendiente'}</p>
                        <p className="text-slate-700">Estado: {translatePatientStatus(event.currentStatus)}</p>
                        <p className="text-slate-700">Severidad: {translateSeverity(event.severityLevel)}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                          <span>Doctor: {event.visitedDoctor ? 'Sí' : 'No'}</span>
                          <span>Emergencia: {event.wentToEmergencyRoom ? 'Sí' : 'No'}</span>
                          <span>Hospitalizado: {event.wasHospitalized ? 'Sí' : 'No'}</span>
                          <span>Discapacidad: {event.permanentDisability ? 'Sí' : 'No'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Eventos Adversos Copia</h4>
                    <span className="text-xs text-slate-500">{duplicateData.aefiReportCopy.adverseEvents.length} item(s)</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {duplicateData.aefiReportCopy.adverseEvents.map((event, idx) => (
                      <div key={idx} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                        <p className="font-medium text-red-900">Inicio: {new Date(event.startDate).toLocaleString('es-ES')}</p>
                        <p className="text-slate-700">Fin: {event.finishDate ? new Date(event.finishDate).toLocaleString('es-ES') : 'Pendiente'}</p>
                        <p className="text-slate-700">Estado: {translatePatientStatus(event.currentStatus)}</p>
                        <p className="text-slate-700">Severidad: {translateSeverity(event.severityLevel)}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                          <span>Doctor: {event.visitedDoctor ? 'Sí' : 'No'}</span>
                          <span>Emergencia: {event.wentToEmergencyRoom ? 'Sí' : 'No'}</span>
                          <span>Hospitalizado: {event.wasHospitalized ? 'Sí' : 'No'}</span>
                          <span>Discapacidad: {event.permanentDisability ? 'Sí' : 'No'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => handleResolve('ConfirmedDuplicate')}
                disabled={resolving}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Es un Duplicado'
                )}
              </Button>
              <Button
                onClick={() => handleResolve('SeparateAsNew')}
                disabled={resolving}
                variant="outline"
                className="flex-1"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'No es Duplicado'
                )}
              </Button>
              <Button onClick={onClose} disabled={resolving} variant="secondary" className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-600">No se pudieron cargar los datos del duplicado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
