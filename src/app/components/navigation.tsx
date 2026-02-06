import { Shield, FileText, BarChart3, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Inicio", icon: Shield },
    { id: "report", label: "Reportar Evento", icon: FileText },
    { id: "consultation", label: "Consultar Reportes", icon: BarChart3 },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "information", label: "Información", icon: Info },
  ];

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
          </div>
        )}
      </div>
    </nav>
  );
}
