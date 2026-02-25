import { useState } from "react";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { ReportProvider } from "@/app/context/ReportContext";
import { Navigation } from "@/app/components/navigation";
import { Footer } from "@/app/components/footer";
import { HomePage } from "@/app/components/pages/home-page";
import { ReportPage } from "@/app/components/pages/report-page";
import { ConsultationPage } from "@/app/components/pages/consultation-page";
import { DetailPage } from "@/app/components/pages/detail-page";
import { DashboardPage } from "@/app/components/pages/dashboard-page";
import { InformationPage } from "@/app/components/pages/information-page";
import { LoginPage } from "@/app/components/pages/login-page";
import { DoctorDashboard } from "@/app/components/pages/doctor-dashboard";
import { EditReportPage } from "@/app/components/pages/edit-report-page";
import { AdminDashboard } from "@/app/components/pages/admin-dashboard";
import { Toaster } from "@/app/components/ui/sonner";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleNavigate = (page: string, reportId?: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      if (reportId) {
        setSelectedReportId(reportId);
      }
      setIsTransitioning(false);
      // Scroll to top when navigating
      window.scrollTo(0, 0);
    }, 300);
  };

  // Redirigir a login si no está autenticado
  if (!isAuthenticated && currentPage !== "login") {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className={`flex-1 page-transition ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        {currentPage === "login" && <LoginPage onNavigate={handleNavigate} />}
        {currentPage === "home" && isAuthenticated && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "report" && isAuthenticated && user?.role === 'doctor' && <ReportPage onNavigate={handleNavigate} />}
        {currentPage === "consultation" && isAuthenticated && <ConsultationPage onNavigate={handleNavigate} />}
        {currentPage === "detail" && isAuthenticated && <DetailPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "dashboard" && isAuthenticated && <DashboardPage />}
        {currentPage === "doctor-dashboard" && isAuthenticated && user?.role === 'doctor' && <DoctorDashboard onNavigate={handleNavigate} />}
        {currentPage === "admin-dashboard" && isAuthenticated && user?.role === 'admin' && <AdminDashboard />}
        {currentPage === "edit-report" && isAuthenticated && <EditReportPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "information" && isAuthenticated && <InformationPage />}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <AppContent />
      </ReportProvider>
    </AuthProvider>
  );
}
