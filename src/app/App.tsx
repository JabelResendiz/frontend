import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { ReportProvider } from "@/app/context/ReportContext";
import { Navigation } from "@/app/components/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Footer } from "@/app/components/footer";
import { HomePage } from "@/app/components/pages/home-page";
import { InformationPage } from "@/app/components/pages/information-page";
import { LoginPage } from "@/app/components/pages/login-page";
import { AssignedReport } from "@/app/services/report.service";
import { Toaster } from "@/app/components/ui/sonner";

// Lazy load heavy pages to reduce initial bundle and improve LCP
const ReportPage = lazy(() => import("@/app/components/pages/report-page"));
const TrackReportPage = lazy(() => import("@/app/components/pages/track-report-page"));
const ConsultationPage = lazy(() => import("@/app/components/pages/consultation-page"));
const DetailPage = lazy(() => import("@/app/components/pages/detail-page"));
const DashboardPage = lazy(() => import("@/app/components/pages/dashboard-page"));
const DoctorDashboard = lazy(() => import("@/app/components/pages/doctor-dashboard"));
const EditReportPage = lazy(() => import("@/app/components/pages/edit-report-page"));
const AdminDashboard = lazy(() => import("@/app/components/pages/admin-dashboard"));
const ManageDoctorsPage = lazy(() => import("@/app/components/pages/manage-doctors-page"));
const ManageReportsPage = lazy(() => import("@/app/components/pages/manage-reports-page"));
const SectionManagerDashboard = lazy(() => import("@/app/components/pages/section-manager-dashboard"));
const AssignedReportsPage = lazy(() => import("@/app/components/pages/assigned-reports-page"));
const ReviewReportPage = lazy(() => import("@/app/components/pages/review-report-page"));
const ActivateAccountPage = lazy(() => import("@/app/components/pages/activate-account-page"));
const ManageCatalogPage = lazy(() => import("@/app/components/pages/manage-catalog-page"));
const ManageSectionResponsiblePage = lazy(() => import("@/app/components/pages/manage-section-responsible-page"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-gray-600">Cargando...</div>
    </div>
  );
}

// Suspense wrapper for route transitions
function RouteWrapper({ children }: { children: React.ReactElement }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

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
          <Route path="/report" element={<RouteWrapper><ReportPage onNavigate={handleNavigate} /></RouteWrapper>} />
          <Route path="/track-report" element={<RouteWrapper><TrackReportPage onNavigate={handleNavigate} /></RouteWrapper>} />
          <Route path="/information" element={<InformationPage />} />
          <Route path="/activate-account" element={<RouteWrapper><ActivateAccountPage onNavigate={handleNavigate} /></RouteWrapper>} />

          <Route
            path="/consultation"
            element={<ProtectedRoute><RouteWrapper><ConsultationPage onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>}
          />

          <Route
            path="/detail"
            element={<ProtectedRoute><RouteWrapper><DetailPage reportId={selectedReportId} onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>}
          />

          <Route path="/dashboard" element={<ProtectedRoute><RouteWrapper><DashboardPage /></RouteWrapper></ProtectedRoute>} />

          <Route
            path="/doctor-dashboard"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><RouteWrapper><DoctorDashboard onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>}
          />

          <Route
            path="/assigned-reports"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><RouteWrapper><AssignedReportsPage onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>}
          />

          <Route
            path="/review-report"
            element={<ProtectedRoute roles={["MedicalReviewer"]}><RouteWrapper><ReviewReportPage reportId={selectedReportId} report={selectedReport} onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>}
          />

          <Route path="/admin-dashboard" element={<ProtectedRoute roles={["Admin"]}><RouteWrapper><AdminDashboard /></RouteWrapper></ProtectedRoute>} />
          <Route path="/manage-catalog" element={<ProtectedRoute roles={["Admin"]}><RouteWrapper><ManageCatalogPage /></RouteWrapper></ProtectedRoute>} />
          <Route path="/manage-section-responsible" element={<ProtectedRoute roles={["Admin"]}><RouteWrapper><ManageSectionResponsiblePage onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>} />

          <Route path="/manage-doctors" element={<ProtectedRoute roles={["SectionResponsible"]}><RouteWrapper><ManageDoctorsPage onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>} />
          <Route path="/manage-reports" element={<ProtectedRoute roles={["SectionResponsible"]}><RouteWrapper><ManageReportsPage onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>} />
          <Route path="/section-manager-dashboard" element={<ProtectedRoute roles={["SectionResponsible"]}><RouteWrapper><SectionManagerDashboard /></RouteWrapper></ProtectedRoute>} />

          <Route path="/edit-report" element={<ProtectedRoute><RouteWrapper><EditReportPage reportId={selectedReportId} onNavigate={handleNavigate} /></RouteWrapper></ProtectedRoute>} />

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
