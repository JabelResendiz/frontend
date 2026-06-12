import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { ReportProvider } from "@/app/context/ReportContext";
import { Navigation } from "@/app/components/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
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
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavigate = (page: string, reportId?: string, action?: string, payload?: AssignedReport) => {
    const path = pagePathMap[page] || "/";
    const state: any = {};
    if (reportId) state.reportId = reportId;
    if (payload) state.report = payload;
    if (action) state.action = action;
    // use react-router navigation instead of manual history manipulation
    navigate(path, { state });
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-700">Cargando sesión...</div>
      </div>
    );
  }

  const locationState = (location.state || {}) as any;
  const selectedReportId = locationState.reportId as string | undefined;
  const selectedReport = locationState.report as AssignedReport | undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation onNavigate={handleNavigate} />
      <main className={`flex-1`}>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} />} />
          <Route path="/report" element={<ReportPage onNavigate={handleNavigate} />} />
          <Route path="/track-report" element={<TrackReportPage onNavigate={handleNavigate} />} />
          <Route path="/information" element={<InformationPage />} />
          <Route path="/activate-account" element={<ActivateAccountPage onNavigate={handleNavigate} />} />

          <Route
            path="/consultation"
            element={<ProtectedRoute><ConsultationPage onNavigate={handleNavigate} /></ProtectedRoute>}
          />

          <Route
            path="/detail"
            element={<ProtectedRoute><DetailPage reportId={selectedReportId} onNavigate={handleNavigate} /></ProtectedRoute>}
          />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route
            path="/doctor-dashboard"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><DoctorDashboard onNavigate={handleNavigate} /></ProtectedRoute>}
          />

          <Route
            path="/assigned-reports"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><AssignedReportsPage onNavigate={handleNavigate} /></ProtectedRoute>}
          />

          <Route
            path="/review-report"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><ReviewReportPage reportId={selectedReportId} report={selectedReport} onNavigate={handleNavigate} /></ProtectedRoute>}
          />

          <Route path="/admin-dashboard" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manage-catalog" element={<ProtectedRoute roles={["Admin"]}><ManageCatalogPage /></ProtectedRoute>} />
          <Route path="/manage-section-responsible" element={<ProtectedRoute roles={["Admin"]}><ManageSectionResponsiblePage onNavigate={handleNavigate} /></ProtectedRoute>} />

          <Route path="/manage-doctors" element={<ProtectedRoute roles={["SectionResponsible"]}><ManageDoctorsPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/manage-reports" element={<ProtectedRoute roles={["SectionResponsible"]}><ManageReportsPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/section-manager-dashboard" element={<ProtectedRoute roles={["SectionResponsible"]}><SectionManagerDashboard /></ProtectedRoute>} />

          <Route path="/edit-report" element={<ProtectedRoute><EditReportPage reportId={selectedReportId} onNavigate={handleNavigate} /></ProtectedRoute>} />

          {/* fallback to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReportProvider>
          <AppContent />
        </ReportProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
