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
import { ActivateAccountPage } from "@/app/components/pages/activate-account-page";
import { AssignedReport } from "@/app/services/report.service";
import { ManageCatalogPage } from "@/app/components/pages/manage-catalog-page";
import { ManageSectionResponsiblePage } from "@/app/components/pages/manage-section-responsible-page";
import { TrackReportPage } from "@/app/components/pages/track-report-page";
import { Toaster } from "@/app/components/ui/sonner";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [selectedReport, setSelectedReport] = useState<AssignedReport | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contextAction, setContextAction] = useState<string | undefined>();
  const { isAuthenticated, user, isLoading } = useAuth();

  // 🔄 Mantener la página actual al recargar si ya hay sesión activa.
  useEffect(() => {
    const publicPages = ["home", "report", "information", "login", "activate-account"];
    if (!isLoading && !isAuthenticated && !publicPages.includes(currentPage)) {
      setCurrentPage("login");
    }
  }, [currentPage, isAuthenticated, isLoading]);

  const pagePathMap: Record<string, string> = {
    "activate-account": "/activate-account",
    login: "/login",
    information: "/information",
    report: "/report",
    "track-report": "/track-report",
    consultation: "/consultation",
    detail: "/detail",
    dashboard: "/dashboard",
    "doctor-dashboard": "/doctor-dashboard",
    "assigned-reports": "/assigned-reports",
    "review-report": "/review-report",
    "admin-dashboard": "/admin-dashboard",
    "manage-catalog": "/manage-catalog",
    "manage-section-responsible": "/manage-section-responsible",
    "manage-doctors": "/manage-doctors",
    "manage-reports": "/manage-reports",
    "section-manager-dashboard": "/section-manager-dashboard",
    "edit-report": "/edit-report",
    home: "/",
  };

  const getPageFromPath = (path: string) => {
    switch (path.replace(/\/+$/, "")) {
      case "/activate-account":
        return "activate-account";
      case "/login":
        return "login";
      case "/information":
        return "information";
      case "/report":
        return "report";
      case "/track-report":
        return "track-report";
      case "/consultation":
        return "consultation";
      case "/detail":
        return "detail";
      case "/dashboard":
        return "dashboard";
      case "/doctor-dashboard":
        return "doctor-dashboard";
      case "/assigned-reports":
        return "assigned-reports";
      case "/review-report":
        return "review-report";
      case "/admin-dashboard":
        return "admin-dashboard";
      case "/manage-catalog":
        return "manage-catalog";
      case "/manage-section-responsible":
        return "manage-section-responsible";
      case "/manage-doctors":
        return "manage-doctors";
      case "/manage-reports":
        return "manage-reports";
      case "/section-manager-dashboard":
        return "section-manager-dashboard";
      case "/edit-report":
        return "edit-report";
      default:
        return "home";
    }
  };

  useEffect(() => {
    const pathPage = getPageFromPath(window.location.pathname);
    setCurrentPage(pathPage);

    const handlePopState = () => {
      setCurrentPage(getPageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, reportId?: string, action?: string, payload?: AssignedReport) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      if (reportId) {
        setSelectedReportId(reportId);
      }
      if (payload) {
        setSelectedReport(payload);
      }
      if (action) {
        setContextAction(action);
      }
      window.history.pushState({}, '', pagePathMap[page] || '/');
      setIsTransitioning(false);
      // Scroll to top when navigating
      window.scrollTo(0, 0);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-700">Cargando sesión...</div>
      </div>
    );
  }

  // Redirigir a login si intenta acceder a páginas protegidas sin estar autenticado
  // Nota: "report" NO está incluido aquí porque cualquiera puede crear un reporte sin autenticarse
  if (!isAuthenticated && (currentPage === "detail" || currentPage === "dashboard" || currentPage === "doctor-dashboard" || currentPage === "admin-dashboard" || currentPage === "edit-report" || currentPage === "consultation" || currentPage === "manage-doctors" ||currentPage === "manage-reports" || currentPage === "section-manager-dashboard" || currentPage === "assigned-reports" || currentPage === "review-report" || currentPage === "manage-catalog" || currentPage === "manage-section-responsible")) {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className={`flex-1 page-transition ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        {currentPage === "login" && <LoginPage onNavigate={handleNavigate} contextAction={contextAction} />}
        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "report" && <ReportPage onNavigate={handleNavigate} />}
        {currentPage === "track-report" && <TrackReportPage onNavigate={handleNavigate} />}
        {currentPage === "consultation" && isAuthenticated && <ConsultationPage onNavigate={handleNavigate} />}
        {currentPage === "detail" && isAuthenticated && <DetailPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "dashboard" && isAuthenticated && <DashboardPage />}
        {currentPage === "doctor-dashboard" && isAuthenticated && user?.role === 'MedicalReviewer' && <DoctorDashboard onNavigate={handleNavigate} />}
        {currentPage === "assigned-reports" && isAuthenticated && user?.role === 'MedicalReviewer' && <AssignedReportsPage onNavigate={handleNavigate} />}
        {currentPage === "review-report" && isAuthenticated && user?.role === 'MedicalReviewer' && <ReviewReportPage reportId={selectedReportId} report={selectedReport} onNavigate={handleNavigate} />}
        {currentPage === "activate-account" && <ActivateAccountPage onNavigate={handleNavigate} />}
        {currentPage === "admin-dashboard" && isAuthenticated && user?.role === 'Admin' && <AdminDashboard />}
        {currentPage === "manage-catalog" && isAuthenticated && user?.role === 'Admin' && <ManageCatalogPage />}
        {currentPage === "manage-section-responsible" && isAuthenticated && user?.role === 'Admin' && <ManageSectionResponsiblePage onNavigate={handleNavigate} />}
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
