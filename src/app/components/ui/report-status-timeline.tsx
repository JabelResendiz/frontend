import React from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, Archive } from "lucide-react";

export enum ReportStatus {
  Draft = 0,
  Submitted = 1,
  UnderReview = 2,
  Approved = 3,
  Rejected = 4,
  Closed = 5
}

const statusConfig = {
  [ReportStatus.Draft]: {
    label: "Borrador",
    description: "El usuario está completando el reporte",
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300"
  },
  [ReportStatus.Submitted]: {
    label: "Enviado",
    description: "Reporte enviado por el reportero",
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300"
  },
  [ReportStatus.UnderReview]: {
    label: "En Revisión",
    description: "En revisión por un médico/revisor",
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300"
  },
  [ReportStatus.Approved]: {
    label: "Aprobado",
    description: "Validado y aprobado",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300"
  },
  [ReportStatus.Rejected]: {
    label: "Rechazado",
    description: "Rechazado (datos incorrectos)",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300"
  },
  [ReportStatus.Closed]: {
    label: "Cerrado",
    description: "Caso finalizado",
    icon: Archive,
    color: "text-green-700",
    bgColor: "bg-green-200",
    borderColor: "border-green-400"
  }
};

interface ReportStatusTimelineProps {
  currentStatus: ReportStatus;
  statusHistory?: Array<{
    status: ReportStatus;
    date: string;
    comments?: string;
  }>;
}

export function ReportStatusTimeline({ 
  currentStatus, 
  statusHistory 
}: ReportStatusTimelineProps) {
  console.log("ReportStatusTimeline render:", { currentStatus, statusHistory });

  const statuses = Object.values(ReportStatus).filter(
    (val) => typeof val === "number"
  ) as number[];

  console.log("Statuses array:", statuses);

  const isCompleted = (status: number) => status <= currentStatus;
  const isCurrent = (status: number) => status === currentStatus;

export function ReportStatusTimeline({ 
  currentStatus, 
  statusHistory 
}: ReportStatusTimelineProps) {
  console.log("ReportStatusTimeline render:", { currentStatus, statusHistory });

  const statuses = Object.values(ReportStatus).filter(
    (val) => typeof val === "number"
  ) as number[];

  console.log("Statuses array:", statuses);

  return (
    <div className="w-full py-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Estado del Reporte
      </h3>
      
      {/* Debug info */}
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-sm font-mono">
          <strong>Debug:</strong> currentStatus = {currentStatus}, 
          statuses = [{statuses.join(', ')}], 
          historyLength = {statusHistory?.length || 0}
        </p>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-12 bottom-0 w-1 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-8">
          {statuses.map((status, index) => {
            console.log(`Rendering status ${status}, index ${index}`);
            const config = statusConfig[status];
            const Icon = config.icon;
            const completed = status <= currentStatus;
            const current = status === currentStatus;

            const historyItem = statusHistory?.find(
              (item) => item.status === status
            );

            return (
              <div key={status} className="relative pl-20">
                {/* Circle indicator */}
                <div
                  className={`absolute -left-[27px] w-14 h-14 rounded-full border-4 flex items-center justify-center ${
                    current
                      ? `${config.bgColor} ${config.borderColor} ring-4 ring-white`
                      : completed
                      ? `${config.bgColor} ${config.borderColor}`
                      : "bg-gray-100 border-gray-300"
                  } transition-all duration-300`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      current ? config.color : completed ? config.color : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Content */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    current
                      ? `${config.bgColor} ${config.borderColor}`
                      : completed
                      ? `${config.bgColor} ${config.borderColor}`
                      : "bg-gray-50 border-gray-200"
                  } transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-semibold text-sm ${
                          current ? config.color : completed ? config.color : "text-gray-600"
                        }`}
                      >
                        {config.label}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {config.description}
                      </p>
                    </div>
                    {current && (
                      <span className="ml-4 px-3 py-1 text-xs font-semibold bg-white rounded-full border border-current">
                        Actual
                      </span>
                    )}
                  </div>

                  {historyItem && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Fecha:</span>{" "}
                        {new Date(historyItem.date).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      {historyItem.comments && (
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">Notas:</span> {historyItem.comments}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-3">Estados del Reporte:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Draft:</span> El usuario está completando
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Submitted:</span> Enviado por el reportero
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">UnderReview:</span> En revisión por profesional
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Approved:</span> Validado y aprobado
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Rejected:</span> Rechazado por datos incorrectos
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Closed:</span> Caso finalizado
          </div>
        </div>
      </div>
    </div>
  );
}
