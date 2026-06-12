import { Card, CardContent } from "@/app/components/ui/card";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Zap 
} from "lucide-react";
import { MunicipalOverview } from "@/app/services/municipal-dashboard.service";
import { Skeleton } from "@/app/components/ui/skeleton";

interface MunicipalOverviewCardsProps {
  data: MunicipalOverview | null;
  isLoading?: boolean;
}

export function MunicipalOverviewCards({ data, isLoading = false }: MunicipalOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const completionPercentage = data.totalReports > 0 
    ? ((data.completedReports / data.totalReports) * 100).toFixed(1)
    : 0;

  const pendingPercentage = data.totalReports > 0
    ? ((data.pendingReports / data.totalReports) * 100).toFixed(1)
    : 0;

  const underReviewPercentage = data.totalReports > 0
    ? ((data.underReviewReports / data.totalReports) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Reports */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Reportes Totales
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#0A4B8F" }}>
                {data.totalReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Desde el inicio del período
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Reports */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Pendientes
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#F59E0B" }}>
                {data.pendingReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pendingPercentage}% del total ({data.pendingReports}/{data.totalReports})
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Under Review Reports */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                En Revisión
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#8B5CF6" }}>
                {data.underReviewReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {underReviewPercentage}% del total ({data.underReviewReports}/{data.totalReports})
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Reports */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Completados
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#10B981" }}>
                {data.completedReports}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {completionPercentage}% del total ({data.completedReports}/{data.totalReports})
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Review Time */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Tiempo Promedio de Revisión
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#EF4444" }}>
                {data.averageReviewTimeHours.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Horas ({(data.averageReviewTimeHours / 24).toFixed(1)} días)
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Zap className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Tasa de Completación
              </p>
              <p className="text-4xl font-bold mt-2" style={{ color: "#06B6D4" }}>
                {data.completionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                De efectividad operativa
              </p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
