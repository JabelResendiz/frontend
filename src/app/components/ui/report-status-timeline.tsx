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
  const statuses = Object.values(ReportStatus).filter(
    (val) => typeof val === "number"
  ) as number[];

  const isCompleted = (status: number) => status <= currentStatus;
  const isCurrent = (status: number) => status === currentStatus;

  return (
    <div className="w-full py-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Estado del Reporte
      </h3>
      
      {/* Horizontal Timeline */}
      <div className="relative w-full">
        {/* Horizontal Timeline line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="relative flex justify-between items-start">
          {statuses.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const completed = status <= currentStatus;
            const current = status === currentStatus;

            const historyItem = statusHistory?.find(
              (item) => item.status === status
            );

            return (
              <div key={status} className="flex flex-col items-center flex-1 max-w-[200px]">
                {/* Circle indicator */}
                <div
                  className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center mb-3 ${
                    current
                      ? `${config.bgColor} ${config.borderColor} ring-4 ring-white shadow-lg`
                      : completed
                      ? `${config.bgColor} ${config.borderColor} shadow-md`
                      : "bg-gray-100 border-gray-300"
                  } transition-all duration-300 z-10`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      current ? config.color : completed ? config.color : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Status label */}
                <div className="text-center mb-2">
                  <h4
                    className={`font-semibold text-sm ${
                      current ? config.color : completed ? config.color : "text-gray-600"
                    }`}
                  >
                    {config.label}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-[180px]">
                    {config.description}
                  </p>
                </div>

                {/* Date and comments if available */}
                {historyItem && (
                  <div className="text-center mt-2 p-2 bg-gray-50 rounded border max-w-[180px]">
                    <p className="text-xs text-gray-700 font-medium">
                      {new Date(historyItem.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                    {historyItem.comments && (
                      <p className="text-xs text-gray-600 mt-1">
                        {historyItem.comments}
                      </p>
                    )}
                  </div>
                )}
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
