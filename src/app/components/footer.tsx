import { Shield, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0A4B8F" }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-white font-semibold">
                Farmacovigilancia
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Sistema de vigilancia de eventos adversos asociados a vacunas del 
              Instituto Finlay de Vacunas, Cuba.
            </p>
            <p className="text-xs text-gray-400">
              Proyecto de tesis académica © 2026
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>Avenida No.21, No. 19810, entre 198 y 200, Reparto Atabey, Playa, La Habana</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>+53-7-2086086</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>+53-7-2080976</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>farmacovigilancia@finlay.edu.cu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <div className="space-y-2 text-sm">
              <div>
                <a href="#" className="hover:text-white transition-colors">
                  Guía de Farmacovigilancia
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors">
                  Términos de Uso
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            Sistema desarrollado con fines académicos y de investigación científica. 
            Todos los datos son tratados con estricta confidencialidad.
          </p>
        </div>
      </div>
    </footer>
  );
}
