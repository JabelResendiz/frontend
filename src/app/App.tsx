import { useState } from "react";
import { Navigation } from "@/app/components/navigation";
import { Footer } from "@/app/components/footer";
import { HomePage } from "@/app/components/pages/home-page";
import { ReportPage } from "@/app/components/pages/report-page";
import { ConsultationPage } from "@/app/components/pages/consultation-page";
import { DetailPage } from "@/app/components/pages/detail-page";
import { DashboardPage } from "@/app/components/pages/dashboard-page";
import { InformationPage } from "@/app/components/pages/information-page";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className={`flex-1 page-transition ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "report" && <ReportPage onNavigate={handleNavigate} />}
        {currentPage === "consultation" && <ConsultationPage onNavigate={handleNavigate} />}
        {currentPage === "detail" && <DetailPage reportId={selectedReportId} onNavigate={handleNavigate} />}
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "information" && <InformationPage />}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
