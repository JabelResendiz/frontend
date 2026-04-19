import { Shield, FileText, BarChart3, Info, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { id: "home", label: "Inicio", icon: Shield },
    ...(user?.role === 'MedicalReviewer' ? [
      { id: "report", label: "Reportar Evento", icon: FileText },
      { id: "assigned-reports", label: "Reportes Asignados", icon: BarChart3 },
      { id: "doctor-dashboard", label: "Mi Panel", icon: BarChart3 },
    ] : []),
    ...(user?.role === 'paciente' ? [
      { id: "report", label: "Reportar Evento", icon: FileText },
    ] : []),
    ...(user?.role === 'SectionResponsible' ? [
      { id: "manage-doctors", label: "Gestionar Médicos", icon: FileText },
      { id: "manage-reports", label: "Gestionar Reportes", icon: FileText },
      { id: "section-manager-dashboard", label: "Dashboard", icon: BarChart3 },
    ] : []),
    ...(user?.role === 'Admin' ? [
      { id: "consultation", label: "Consultar Reportes", icon: BarChart3 },
      { id: "admin-dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "manage-catalog", label: "Gestionar Catálogo", icon: FileText },
      { id: "manage-section-responsible", label: "Gestionar Jefes Sección", icon: FileText },
    ] : []),
    ...(!user ? [
      { id: "report", label: "Reportar Evento", icon: FileText },
    ] : []),
    { id: "information", label: "Información", icon: Info },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0A4B8F" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold" style={{ color: "#0A4B8F" }}>
                Sistema de Farmacovigilancia
              </div>
              <div className="text-xs text-gray-600">
                Instituto Finlay de Vacunas
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={isActive ? { backgroundColor: "#0A4B8F" } : {}}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
            {user && (
              <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  {user.name} <span className="text-xs text-gray-500">({user.role})</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </Button>
              </div>
            )}
            {!user && (
              <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('login')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Registrarse
                </Button>
                <Button
                  onClick={() => onNavigate('login')}
                  style={{ backgroundColor: "#0A4B8F" }}
                >
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive 
                      ? "text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={isActive ? { backgroundColor: "#0A4B8F" } : {}}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
            {user && (
              <>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </>
            )}
            {!user && (
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-sm">Registrarse</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-white"
                  style={{ backgroundColor: "#0A4B8F" }}
                >
                  <span className="text-sm">Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
