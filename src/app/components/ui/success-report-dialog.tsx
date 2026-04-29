import React, { useEffect } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { CheckCircle2, Copy, Download, Search } from "lucide-react";
import { toast } from "sonner";

interface SuccessReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notificationNumber: string;
  message: string;
  onNavigate?: (page: string) => void;
}

export function SuccessReportDialog({
  isOpen,
  onClose,
  notificationNumber,
  message,
  onNavigate
}: SuccessReportDialogProps) {
  // Redirigir automáticamente a home después de 5 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onNavigate?.("home");
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onNavigate]);

  const handleCopyNotificationNumber = () => {
    navigator.clipboard.writeText(notificationNumber);
    toast.success("Número de notificación copiado al portapapeles");
  };

  const handleDownloadReceipt = () => {
    // Crear un archivo de recibo simple
    const content = `
REPORTE DE EVENTO ADVERSO - CONFIRMACIÓN DE RECEPCIÓN
======================================================

${message}

Número de Notificación: ${notificationNumber}
Fecha de Envío: ${new Date().toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })}

INSTRUCCIONES IMPORTANTES:
1. Guarde este número de notificación para futuras consultas
2. Podrá seguir el estado de su reporte usando este número
3. Se le notificará de cualquier cambio en el estado del reporte
4. Para más información, visite nuestro portal de farmacovigilancia

Gracias por reportar eventos adversos. Su información es valiosa para la seguridad de la salud pública.
    `.trim();

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `Recibo_${notificationNumber}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success("Recibo descargado exitosamente");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // No permitir cerrar al hacer clic afuera
      if (!open) return;
    }}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            ¡Reporte Enviado Exitosamente!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              Número de Notificación
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-mono font-bold text-blue-600">
                {notificationNumber}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyNotificationNumber}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Guarde este número para seguimiento y consultas futuras
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
            <p className="font-semibold mb-1">¿Qué sucede ahora?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Su reporte ha sido registrado en nuestro sistema</li>
              <li>Será revisado por un profesional de la salud</li>
              <li>Recibirá notificaciones sobre el progreso</li>
              <li>Puede consultar el estado usando su número</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-4">
          <p>Redirigiendo al inicio en <span className="font-semibold">60 segundos</span>...</p>
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
            className="gap-2 flex-1"
          >
            <Download className="w-4 h-4" />
            Descargar Recibo
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onNavigate?.("track-report");
            }}
            className="gap-2 flex-1"
          >
            <Search className="w-4 h-4" />
            Seguir Reporte
          </Button>
          <Button
            onClick={() => {
              onNavigate?.("home");
            }}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            Salir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
