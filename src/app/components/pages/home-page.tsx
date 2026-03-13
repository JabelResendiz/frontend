import { Shield, FileText, Search, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useAuth } from "@/app/context/AuthContext";

interface HomePageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0A4B8F" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Sistema de Farmacovigilancia
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-2">
              Instituto Finlay de Vacunas
            </p>
            <p className="text-base text-white/80 max-w-2xl mx-auto mb-8">
              Plataforma de monitoreo y reporte de eventos adversos asociados a vacunas.
              Contribuya a la seguridad y eficacia de las inmunizaciones en Cuba.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                // Botones para usuarios autenticados
                <>
                  {(user?.role === 'doctor' || user?.role === 'paciente') && (
                    <Button
                      size="lg"
                      className="bg-white hover:bg-gray-100 text-[#0A4B8F] font-semibold px-8 py-6 text-lg shadow-lg"
                      onClick={() => onNavigate("report")}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Reportar Evento Adverso
                    </Button>
                  )}
                  {user?.role === 'doctor' ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm"
                      onClick={() => onNavigate("doctor-dashboard")}
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Ver Mi Panel
                    </Button>
                  ) : user?.role === 'admin' ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm"
                      onClick={() => onNavigate("consultation")}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Consultar Reportes
                    </Button>
                  ) : user?.role === 'responsable-seccion' ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm"
                      onClick={() => onNavigate("section-manager-dashboard")}
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Ver Mi Panel
                    </Button>
                  ) : null}
                </>
              ) : (
                // Botones para usuarios no autenticados
                <>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-[#0A4B8F] font-semibold px-8 py-6 text-lg shadow-lg"
                    onClick={() => onNavigate("login", undefined, "registerAsDoctor")}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Reportar Evento Adverso
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm"
                    onClick={() => onNavigate("login")}
                  >
                    Registrarse / Iniciar Sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About System Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#0A4B8F" }}>
            ¿Qué es Farmacovigilancia?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            La farmacovigilancia es la ciencia y las actividades relacionadas con la detección, 
            evaluación, comprensión y prevención de eventos adversos asociados a medicamentos y vacunas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: "#E8F0F7" }}>
                <Shield className="w-6 h-6" style={{ color: "#0A4B8F" }} />
              </div>
              <CardTitle className="text-lg">Seguridad del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Monitoreo continuo de la seguridad de las vacunas para proteger la salud de la población
                y detectar rápidamente cualquier señal de riesgo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: "#E8F5EB" }}>
                <BarChart3 className="w-6 h-6" style={{ color: "#2D7A3E" }} />
              </div>
              <CardTitle className="text-lg">Análisis de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Recopilación y análisis sistemático de datos para identificar patrones, 
                tendencias y posibles relaciones causales entre vacunas y eventos adversos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-blue-50">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Acción Preventiva</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Implementación de medidas preventivas y correctivas basadas en evidencia científica
                para minimizar riesgos y mejorar la práctica de vacunación.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section - Para usuarios autenticados médicos */}
      {isAuthenticated && user?.role === 'doctor' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <Card className="border-0 shadow-xl overflow-hidden" style={{ backgroundColor: "#E8F0F7" }}>
            <CardContent className="p-8 sm:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "#0A4B8F" }}>
                  ¿Ha experimentado un evento adverso post-vacunación?
                </h2>
                <p className="text-gray-700 mb-6">
                  Su reporte es fundamental para mejorar la seguridad de las vacunas. 
                  El proceso es confidencial, seguro y toma aproximadamente 10 minutos.
                </p>
                <Button
                  size="lg"
                  className="text-white font-semibold px-8 py-6 text-lg shadow-lg"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={() => onNavigate("report")}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Comenzar Reporte Ahora
                </Button>
                <p className="text-xs text-gray-600 mt-4">
                  Todos los datos son tratados con estricta confidencialidad según normas éticas y legales
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
