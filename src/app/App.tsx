import { useState, useEffect } from "react";
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
import { ManageDoctorsPage } from "@/app/components/pages/manage-doctors-page";
import { ManageReportsPage } from "@/app/components/pages/manage-reports-page";
import { SectionManagerDashboard } from "@/app/components/pages/section-manager-dashboard";
import { AssignedReportsPage } from "@/app/components/pages/assigned-reports-page";
import { ReviewReportPage } from "@/app/components/pages/review-report-page";
import { ManageCatalogPage } from "@/app/components/pages/manage-catalog-page";
import { Toaster } from "@/app/components/ui/sonner";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contextAction, setContextAction] = useState<string | undefined>();
  const { isAuthenticated, user } = useAuth();

  // 🔄 Resetear a home cada vez que se autentica o desautentica
  useEffect(() => {
    if (isAuthenticated) {
      // Usuario acaba de autenticarse - ir a home
      setCurrentPage("home");
    }
  }, [isAuthenticated]);

  const handleNavigate = (page: string, reportId?: string, action?: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      if (reportId) {
        setSelectedReportId(reportId);
      }
      if (action) {
        setContextAction(action);
      }
      setIsTransitioning(false);
      // Scroll to top when navigating
      window.scrollTo(0, 0);
    }, 300);
  };

  // Redirigir a login si intenta acceder a páginas protegidas sin estar autenticado
  // Nota: "report" NO está incluido aquí porque cualquiera puede crear un reporte sin autenticarse
  if (!isAuthenticated && (currentPage === "detail" || currentPage === "dashboard" || currentPage === "doctor-dashboard" || currentPage === "admin-dashboard" || currentPage === "edit-report" || currentPage === "consultation" || currentPage === "manage-doctors" ||currentPage === "manage-reports" || currentPage === "section-manager-dashboard" || currentPage === "assigned-reports" || currentPage === "review-report" || currentPage === "manage-catalog")) {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className={`flex-1 page-transition ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        {currentPage === "login" && <LoginPage onNavigate={handleNavigate} contextAction={contextAction} />}
        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "report" && <ReportPage onNavigate={handleNavigate} />}
        {currentPage === "consultation" && isAuthenticated && <ConsultationPage onNavigate={handleNavigate} />}
        {currentPage === "detail" && isAuthenticated && <DetailPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "dashboard" && isAuthenticated && <DashboardPage />}
        {currentPage === "doctor-dashboard" && isAuthenticated && user?.role === 'MedicalReviewer' && <DoctorDashboard onNavigate={handleNavigate} />}
        {currentPage === "assigned-reports" && isAuthenticated && user?.role === 'MedicalReviewer' && <AssignedReportsPage onNavigate={handleNavigate} />}
        {currentPage === "review-report" && isAuthenticated && user?.role === 'MedicalReviewer' && <ReviewReportPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "admin-dashboard" && isAuthenticated && user?.role === 'Admin' && <AdminDashboard />}
        {currentPage === "manage-catalog" && isAuthenticated && user?.role === 'Admin' && <ManageCatalogPage />}
        {currentPage === "manage-doctors" && isAuthenticated && user?.role === 'SectionResponsible' && <ManageDoctorsPage onNavigate={handleNavigate} />}
        {currentPage === "manage-reports" && isAuthenticated && user?.role === 'SectionResponsible' && <ManageReportsPage onNavigate={handleNavigate}/>}
        {currentPage === "section-manager-dashboard" && isAuthenticated && user?.role === 'SectionResponsible' && <SectionManagerDashboard />}
        {currentPage === "edit-report" && isAuthenticated && <EditReportPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "information" && <InformationPage />}
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
