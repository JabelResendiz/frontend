import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { Badge } from "@/app/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Users, 
  Lock, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from "lucide-react";

export function InformationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Información y Transparencia
          </h1>
          <p className="text-gray-600">
            Conozca más sobre nuestro sistema de farmacovigilancia, metodología y principios éticos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About System */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sobre el Sistema
                </CardTitle>
                <CardDescription>
                  Sistema Nacional de Farmacovigilancia de Vacunas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  El Sistema de Farmacovigilancia del Instituto Finlay de Vacunas es una plataforma 
                  desarrollada como parte de un proyecto de tesis académica para fortalecer la vigilancia 
                  de eventos adversos asociados a vacunas en Cuba.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Inspirado en sistemas internacionales como VAERS (USA), pero diseñado con mejoras en 
                  usabilidad, accesibilidad y claridad para usuarios médicos, investigadores y ciudadanos.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Proyecto Académico</h4>
                      <p className="text-sm text-blue-800">
                        Este sistema forma parte de una tesis de investigación en el campo de la 
                        farmacovigilancia y salud pública. Los datos son manejados con fines científicos 
                        y de mejora de la seguridad vacunal.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What is Pharmacovigilance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  ¿Qué es la Farmacovigilancia?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  La <strong>farmacovigilancia</strong> es la ciencia y las actividades relacionadas 
                  con la detección, evaluación, comprensión y prevención de efectos adversos o cualquier 
                  otro problema relacionado con medicamentos y vacunas.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: "#E8F0F7" }}>
                      <Shield className="w-5 h-5" style={{ color: "#0A4B8F" }} />
                    </div>
                    <h4 className="font-semibold mb-2">Detección Temprana</h4>
                    <p className="text-sm text-gray-600">
                      Identificación rápida de señales de seguridad no detectadas en estudios clínicos
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: "#E8F5EB" }}>
                      <Users className="w-5 h-5" style={{ color: "#2D7A3E" }} />
                    </div>
                    <h4 className="font-semibold mb-2">Vigilancia Poblacional</h4>
                    <p className="text-sm text-gray-600">
                      Monitoreo continuo en poblaciones reales durante el uso masivo de vacunas
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-orange-50">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Análisis de Riesgos</h4>
                    <p className="text-sm text-gray-600">
                      Evaluación científica de la relación beneficio-riesgo de las vacunas
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-purple-50">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Acción Regulatoria</h4>
                    <p className="text-sm text-gray-600">
                      Implementación de medidas para prevenir y minimizar riesgos identificados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodology */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Metodología Científica
                </CardTitle>
                <CardDescription>
                  Proceso de evaluación y clasificación de eventos adversos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F", color: "white" }}>
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Recepción del Reporte</h4>
                      <p className="text-sm text-gray-600">
                        Los reportes son recibidos de profesionales de salud, pacientes o familiares 
                        a través de esta plataforma digital segura.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F", color: "white" }}>
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Evaluación Inicial</h4>
                      <p className="text-sm text-gray-600">
                        El equipo de farmacovigilancia revisa cada reporte para verificar completitud, 
                        coherencia y clasificación preliminar de severidad.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F", color: "white" }}>
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Análisis de Causalidad</h4>
                      <p className="text-sm text-gray-600">
                        Aplicación del algoritmo de causalidad de la OMS para determinar la probabilidad 
                        de relación entre la vacuna y el evento.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F", color: "white" }}>
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Seguimiento y Documentación</h4>
                      <p className="text-sm text-gray-600">
                        Seguimiento del caso hasta su resolución, con documentación detallada de 
                        evolución, tratamiento y desenlace.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A4B8F", color: "white" }}>
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Análisis Agregado</h4>
                      <p className="text-sm text-gray-600">
                        Análisis estadístico periódico de todos los reportes para detectar señales 
                        de seguridad y patrones emergentes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ethics and Privacy */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Ética y Confidencialidad
                </CardTitle>
                <CardDescription>
                  Protección de datos y principios éticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Anonimato Garantizado</h4>
                      <p className="text-sm text-green-800">
                        Los datos personales identificables no son requeridos. Solo se solicita 
                        información demográfica básica para análisis epidemiológico.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Confidencialidad de Datos</h4>
                      <p className="text-sm text-green-800">
                        Toda la información es almacenada de forma segura y solo es accesible al 
                        equipo autorizado de farmacovigilancia.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Uso Científico</h4>
                      <p className="text-sm text-green-800">
                        Los datos se utilizan exclusivamente para investigación científica, análisis 
                        epidemiológico y mejora de la seguridad vacunal.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Transparencia</h4>
                      <p className="text-sm text-green-800">
                        Los resultados agregados y análisis estadísticos son publicados de forma 
                        transparente, sin comprometer la privacidad individual.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      ¿Quién puede reportar un evento adverso?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Cualquier persona puede reportar: pacientes, familiares, profesionales de la salud 
                      (médicos, enfermeros, farmacéuticos) o cualquier ciudadano que tenga conocimiento 
                      de un evento adverso. No se requiere ser profesional médico para hacer un reporte.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      ¿Qué información debo proporcionar?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Se solicita información básica sobre: datos demográficos del paciente (edad, sexo, 
                      provincia), detalles de la vacuna (nombre, lote, fecha), descripción del evento 
                      adverso, síntomas y evolución. No se requieren datos personales identificables.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      ¿Cuánto tiempo toma el proceso?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Completar el formulario toma aproximadamente 10-15 minutos. El equipo de 
                      farmacovigilancia revisa cada reporte en un plazo de 24-48 horas. Casos severos 
                      son evaluados con prioridad inmediata.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      ¿Los datos son realmente confidenciales?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Sí, absolutamente. El sistema está diseñado para garantizar la confidencialidad. 
                      No se requiere identificación personal, los datos son encriptados y solo el equipo 
                      autorizado de farmacovigilancia tiene acceso. Los reportes públicos son siempre 
                      anónimos y agregados.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      ¿Qué pasa después de enviar un reporte?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Recibirá un número de confirmación inmediatamente. El equipo de farmacovigilancia 
                      evaluará su reporte, puede contactarlo para información adicional si proporcionó 
                      datos de contacto, y el caso será seguido hasta su resolución. Los datos contribuyen 
                      a la vigilancia continua de seguridad vacunal.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>
                      ¿Cuándo debo reportar un evento adverso?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Reporte cualquier evento de salud que ocurra después de la vacunación, 
                      especialmente si es inesperado, severo o requiere atención médica. Incluso si no 
                      está seguro de que esté relacionado con la vacuna, su reporte es valioso para el 
                      análisis científico.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Contacto</CardTitle>
                <CardDescription>
                  Instituto Finlay de Vacunas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Dirección</div>
                    <div className="text-gray-600">
                      Avenida No. 21, No. 19810, entre 198 y 200, Reparto Atabey<br />
                      Playa, La Habana, Cuba
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Teléfono</div>
                    <div className="text-gray-600">
                      +53 7 208-6086
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Teléfono</div>
                    <div className="text-gray-600">
                      +53 7 208-0976
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">Email</div>
                    <div className="text-gray-600">
                      farmacovigilancia@finlay.edu.cu
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recursos Adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">Guía de Farmacovigilancia</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">Marco Legal y Normativo</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">Publicaciones Científicas</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">Boletines de Seguridad</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </CardContent>
            </Card>

            {/* Badges/Certifications */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: "#0A4B8F" }} />
                  <h4 className="font-semibold mb-2" style={{ color: "#0A4B8F" }}>
                    Sistema Certificado
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Cumple con estándares internacionales de farmacovigilancia
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">OMS</Badge>
                    <Badge variant="secondary" className="text-xs">CECMED</Badge>
                    <Badge variant="secondary" className="text-xs">Ética</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
