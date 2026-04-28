import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { MapPin, Users, Globe, Briefcase } from "lucide-react";

interface DoctorsByRegion {
  [key: string]: number;
}

export function SectionManagerDashboard() {
  // Datos de ejemplo - en producción vendrían del backend
  const [doctorsByProvince] = useState<DoctorsByRegion>({
    "Pinar del Río": 8,
    "La Habana": 35,
    "Mayabeque": 12,
    "Matanzas": 15,
    "Cienfuegos": 10,
    "Villa Clara": 18,
    "Sancti Spíritus": 9,
    "Ciego de Ávila": 7,
    "Camagüey": 14,
    "Las Tunas": 6,
    "Holguín": 16,
    "Granma": 11,
    "Santiago de Cuba": 20,
    "Guantánamo": 8,
  });

  const totalDoctors = Object.values(doctorsByProvince).reduce((a, b) => a + b, 0);
  const avgDoctorsPerProvince = (totalDoctors / Object.keys(doctorsByProvince).length).toFixed(1);

  const getColorByDoctorCount = (count: number) => {
    if (count >= 30) return "#0A4B8F"; // Azul oscuro
    if (count >= 20) return "#1E5A96"; // Azul
    if (count >= 10) return "#4A90C2"; // Azul claro
    return "#A0C9E8"; // Azul muy claro
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
            Dashboard de Responsable de Sección
          </h1>
          <p className="text-gray-600">
            Visualización de médicos por provincia y municipio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total de Médicos</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: "#0A4B8F" }}>
                    {totalDoctors}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Provincias Cubiertas</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: "#0A4B8F" }}>
                    {Object.keys(doctorsByProvince).length}
                  </p>
                </div>
                <MapPin className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Promedio por Provincia</p>
                  <p className="text-4xl font-bold mt-2" style={{ color: "#0A4B8F" }}>
                    {avgDoctorsPerProvince}
                  </p>
                </div>
                <Briefcase className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and List Tabs */}
        <Tabs defaultValue="mapa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mapa">Mapa de Provincias</TabsTrigger>
            <TabsTrigger value="lista">Lista Detallada</TabsTrigger>
          </TabsList>

          {/* Map View */}
          <TabsContent value="mapa">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Distribución de Médicos por Provincia</CardTitle>
                <CardDescription>
                  Visualización de la cantidad de médicos en cada provincia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="space-y-4">
                    {/* Mapa simplificado con barras */}
                    <div className="space-y-3">
                      {Object.entries(doctorsByProvince)
                        .sort(([, a], [, b]) => b - a)
                        .map(([province, count]) => (
                          <div key={province} className="flex items-center gap-4">
                            <div className="w-32 font-medium text-sm truncate">
                              {province}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                              <div
                                className="h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-semibold transition-all"
                                style={{
                                  width: `${(count / Math.max(...Object.values(doctorsByProvince))) * 100}%`,
                                  backgroundColor: getColorByDoctorCount(count),
                                }}
                              >
                                {count > 5 ? count : ""}
                              </div>
                            </div>
                            <div className="w-12 text-right font-bold text-lg" style={{ color: "#0A4B8F" }}>
                              {count}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-3">Leyenda de Densidad:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: "#0A4B8F" }}></div>
                        <span className="text-xs">30+ médicos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: "#1E5A96" }}></div>
                        <span className="text-xs">20-29 médicos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: "#4A90C2" }}></div>
                        <span className="text-xs">10-19 médicos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: "#A0C9E8" }}></div>
                        <span className="text-xs">Menos de 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List View */}
          <TabsContent value="lista">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Médicos por Provincia - Vista Detallada</CardTitle>
                <CardDescription>
                  Listado completo de médicos agrupados por provincia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(doctorsByProvince)
                    .sort(([, a], [, b]) => b - a)
                    .map(([province, count]) => (
                      <div
                        key={province}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{province}</h4>
                            <p className="text-sm text-gray-600">
                              {count === 1 ? "1 médico" : `${count} médicos`}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg"
                          style={{
                            backgroundColor: getColorByDoctorCount(count),
                          }}
                        >
                          {count}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <Card className="border-0 shadow-lg mt-8 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Globe className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Cobertura Nacional</h3>
                <p className="text-sm text-blue-800">
                  Tu sección cuenta con una cobertura de {Object.keys(doctorsByProvince).length} provincias
                  con un total de {totalDoctors} médicos registrados. El promedio de médicos por provincia es {avgDoctorsPerProvince}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
