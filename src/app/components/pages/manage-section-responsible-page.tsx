import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { PROVINCES_AND_MUNICIPALITIES, getMunicipalitiesByProvince } from "@/app/data/municipalities";
import { api } from "@/app/services/api";

interface SectionResponsible {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  provinceName: string;
  municipalityName: string;
}

interface ManageSectionResponsiblePageProps {
  onNavigate: (page: string, reportId?: string, action?: string) => void;
}

const PROVINCES = Object.keys(PROVINCES_AND_MUNICIPALITIES);

// Get province ID based on name
const getProvinceId = (provinceName: string): number => {
  return PROVINCES.indexOf(provinceName) + 1;
};
// Get municipality ID based on province name and municipality name
const getMunicipalityId = (provinceName: string, municipalityName: string): number => {
  const province = getProvinceId(provinceName);
  let total = 0;
  for (let i = 0; i < province; i++) {
    total += getMunicipalitiesByProvince(PROVINCES[i]).length;
  }
  return total;
};

// Get province name by ID
const getProvinceNameById = (provinceId: number): string => {
  return PROVINCES[provinceId - 1] || "";
};

// Get municipality name by province ID and municipality ID
const getMunicipalityNameById = (provinceId: number, municipalityId: number): string => {
  const provinceName = getProvinceNameById(provinceId);
  const municipalities = getMunicipalitiesByProvince(provinceName);
  // Calculate the actual index within the province
  let provinceStartIndex = 0;
  for (let i = 0; i < provinceId - 1; i++) {
    provinceStartIndex += getMunicipalitiesByProvince(PROVINCES[i]).length;
  }
  const indexInProvince = municipalityId - provinceStartIndex - 1;
  return municipalities[indexInProvince] || "";
};



export function ManageSectionResponsiblePage({ onNavigate }: ManageSectionResponsiblePageProps) {
  const [sectionResponsibles, setSectionResponsibles] = useState<SectionResponsible[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const[totalCount,setTotalCount] = useState(0);
  const[nextPageUrl,setNextPageUrl] = useState<string | null>(null);
  const[previousPageUrl,setPreviousPageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    province: "",
    municipality: "",
  });

  // Cargar datos del backend
  // const loadSectionResponsibles = async (url ?:string) => {
  //   setIsLoadingData(true);
  //   try {
  //     const response = await api.get("/SectionResponsible/GetAll", {
  //       params: {
  //         pageNumber,
  //         pageSize,
  //         search: searchTerm,
  //       },
  //     });

  //     if (response.data?.items && Array.isArray(response.data.items)) {
  //       setSectionResponsibles(
  //         response.data.items.map((item: any) => ({
  //           id: item.id?.toString() || Date.now().toString(),
  //           userName: item.userName || "",
  //           email: item.email || "",
  //           phoneNumber: item.phoneNumber || "",
  //           provinceName: getProvinceNameById(item.provinceId) || "",
  //           municipalityName: getMunicipalityNameById(item.provinceId, item.municipalityId) || "",
  //         }))
  //       );
  //     } else {
  //       setSectionResponsibles([]);
  //     }
  //   } catch (error: any) {
  //     const errorMessage = error.backendData?.message || error.message || "Error al cargar jefes de sección";
  //     toast.error(errorMessage);
  //     console.error("Error loading section responsibles:", error);
  //   } finally {
  //     setIsLoadingData(false);
  //   }
  // };


// const loadSectionResponsibles = async (url?: string) => {
//   setIsLoadingData(true);
//   try {
//     const response = url
//       ? await api.get(url) // 👉 usa next/prev directamente
//       : await api.get("/SectionResponsible/GetAll", {
//           params: {
//             pageNumber,
//             pageSize,
//             search: searchTerm,
//           },
//         });

//     const data = response.data;

//     if (data?.items && Array.isArray(data.items)) {
//       setSectionResponsibles(
//         data.items.map((item: any) => ({
//           id: item.id?.toString() || Date.now().toString(),
//           userName: item.userName || "",
//           email: item.email || "",
//           phoneNumber: item.phoneNumber || "",
//           provinceName: getProvinceNameById(item.provinceId) || "",
//           municipalityName:
//             getMunicipalityNameById(item.provinceId, item.municipalityId) || "",
//         }))
//       );

//       // 🔥 metadata de paginación
//       setTotalCount(data.totalCount);
//       setNextPageUrl(data.nextPageUrl);
//       setPreviousPageUrl(data.previousPageUrl);

//       // 🔥 IMPORTANTÍSIMO
//       setPageNumber(data.pageNumber);
//     } else {
//       setSectionResponsibles([]);
//     }
//   } catch (error: any) {
//     toast.error("Error al cargar jefes de sección");
//     console.error(error);
//   } finally {
//     setIsLoadingData(false);
//   }
// };









const loadSectionResponsibles = async (url?: string) => {
  setIsLoadingData(true);

  try {
    let params = {
      pageNumber,
      pageSize,
      search: searchTerm,
    };

    // 👉 Si viene next/prev, extrae los params
    if (url) {
      const queryString = url.split("?")[1];
      const urlParams = new URLSearchParams(queryString);

      params = {
        pageNumber: Number(urlParams.get("pageNumber")) || 1,
        pageSize: Number(urlParams.get("pageSize")) || 10,
        search: searchTerm,
      };
    }

    const response = await api.get("/SectionResponsible/GetAll", {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    if (data?.items) {
      setSectionResponsibles(
        data.items.map((item: any) => ({
          id: item.id?.toString() || crypto.randomUUID(),
          userName: item.userName || "",
          email: item.email || "",
          phoneNumber: item.phoneNumber || "",
          provinceName: getProvinceNameById(item.provinceId) || "",
          municipalityName:
            getMunicipalityNameById(item.provinceId, item.municipalityId) || "",
        }))
      );

      setTotalCount(data.totalCount);
      setNextPageUrl(data.nextPageUrl);
      setPreviousPageUrl(data.previousPageUrl);
      setPageNumber(data.pageNumber);
    } else {
      setSectionResponsibles([]);
    }
  } catch (error) {
    toast.error("Error al cargar jefes de sección");
    console.error(error);
  } finally {
    setIsLoadingData(false);
  }
};













  // Cargar datos cuando monta el componente o cuando cambia la búsqueda
  useEffect(() => {
    loadSectionResponsibles();
  }, [pageNumber, searchTerm]);

  const validatePassword = (password: string): boolean => {
    // At least one uppercase, one lowercase, one digit, one special character, and 8+ characters
    // Allow any non-space character for special characters
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar && isLongEnough;
  };

  const handleAddSectionResponsible = async () => {
    if (
      !formData.userName ||
      !formData.email ||
      !formData.password ||
      !formData.phoneNumber ||
      !formData.province ||
      !formData.municipality
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error("La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial");
      return;
    }

    setIsLoading(true);

    try {
      const provinceId = getProvinceId(formData.province);
      const municipalityId = getMunicipalityId(formData.province, formData.municipality);

      const payload = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        provinceId,
        municipalityId,
      };

      const response = await api.post("/SectionResponsible/register", payload);

      if (response.data.success) {
        toast.success("Jefe de sección agregado exitosamente");
        setFormData({
          userName: "",
          email: "",
          password: "",
          phoneNumber: "",
          province: "",
          municipality: "",
        });
        setShowForm(false);
        // Recargar datos
        setPageNumber(1);
        loadSectionResponsibles();
      } else {
        toast.error(response.data.message || "Error al agregar jefe de sección");
      }
    } catch (error: any) {
      const errorMessage = error.backendData?.message || error.message || "Error desconocido";
      toast.error(errorMessage);
      console.error("Error adding section responsible:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (responsible: SectionResponsible) => {
    setFormData({
      userName: responsible.userName,
      email: responsible.email,
      password: "",
      phoneNumber: responsible.phoneNumber,
      province: responsible.provinceName,
      municipality: responsible.municipalityName,
    });
    setEditingId(responsible.id);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setSectionResponsibles(
        sectionResponsibles.filter(r => r.id !== deleteConfirm)
      );
      toast.success("Jefe de sección eliminado exitosamente");
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      phoneNumber: "",
      province: "",
      municipality: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSearch = () => {
    setPageNumber(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#0A4B8F" }}>
                Gestionar Jefes de Sección
              </h1>
              <p className="text-gray-600">
                Administra los jefes de sección del sistema
              </p>
            </div>
            {!showForm && (
              <Button
                className="text-white font-semibold px-6 py-3"
                style={{ backgroundColor: "#0A4B8F" }}
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Jefe de Sección
              </Button>
            )}
          </div>
        </div>

        {/* Search Section */}
        {!showForm && (
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre de usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleSearch}
                  disabled={isLoadingData}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {showForm && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>
                {editingId ? "Editar Jefe de Sección" : "Agregar Nuevo Jefe de Sección"}
              </CardTitle>
              <CardDescription>
                Complete todos los campos requeridos (marcados con *)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Nombre de Usuario *</Label>
                  <Input
                    id="userName"
                    placeholder="Ej: carla_admin"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="carla@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password_123!"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial
                  </p>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Teléfono *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="55664266"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) =>
                      setFormData({ ...formData, province: value, municipality: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="municipality">Municipio *</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) =>
                      setFormData({ ...formData, municipality: value })
                    }
                    disabled={!formData.province}
                  >
                    <SelectTrigger disabled={!formData.province}>
                      <SelectValue
                        placeholder={
                          formData.province
                            ? "Selecciona municipio"
                            : "Selecciona provincia primero"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.province &&
                        getMunicipalitiesByProvince(formData.province).map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="text-white font-semibold"
                  style={{ backgroundColor: "#0A4B8F" }}
                  onClick={handleAddSectionResponsible}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Procesando..."
                    : editingId
                    ? "Actualizar"
                    : "Agregar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Responsibles List */}
        <div className="space-y-4">
          {isLoadingData ? (
            <Card className="border border-dashed">
              <CardContent className="p-8 text-center">
                <div className="animate-spin inline-block">
                  <Users className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-gray-500 mt-4">Cargando jefes de sección...</p>
              </CardContent>
            </Card>
          ) : sectionResponsibles.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  No hay jefes de sección {searchTerm ? "con esos criterios" : "agregados aún"}
                </p>
                {!showForm && !searchTerm && (
                  <Button
                    className="text-white font-semibold"
                    style={{ backgroundColor: "#0A4B8F" }}
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar Primer Jefe de Sección
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
            <div className="grid gap-4">
              {sectionResponsibles.map((responsible) => (
                <Card
                  key={responsible.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {responsible.userName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {responsible.email}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span>{" "}
                            {responsible.phoneNumber}
                          </div>
                          <div>
                            <span className="font-medium">Provincia:</span>{" "}
                            {responsible.provinceName}
                          </div>
                          <div>
                            <span className="font-medium">Municipio:</span>{" "}
                            {responsible.municipalityName}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(responsible)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(responsible.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

   {/* PAGINACIÓN */}
<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
  
  {/* Info izquierda */}
  <div className="text-sm text-gray-600">
    Página <span className="font-semibold">{pageNumber}</span> de{" "}
    <span className="font-semibold">
      {Math.ceil(totalCount / pageSize)}
    </span>
  </div>

  {/* Controles */}
  <div className="flex items-center gap-2">
    
    {/* ANTERIOR */}
    <Button
      variant="outline"
      disabled={!previousPageUrl}
      onClick={() => loadSectionResponsibles(previousPageUrl!)}
      className="
        flex items-center gap-2
        px-4 py-2
        rounded-lg
        border-gray-300
        text-gray-700
        hover:bg-gray-100
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all
      "
    >
      <span className="text-lg">←</span>
      Anterior
    </Button>

    {/* SIGUIENTE (MEJORADO) */}
    <Button
      onClick={() => loadSectionResponsibles(nextPageUrl!)}
      disabled={!nextPageUrl}
      className="
        flex items-center gap-2
        px-5 py-2
        rounded-lg
        text-white
        font-semibold
        shadow-md
        transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:scale-[1.02]
      "
      style={{
        backgroundColor: nextPageUrl ? "#0A4B8F" : "#93A4B5",
      }}
    >
      Siguiente
      <span className="text-lg">→</span>
    </Button>

  </div>
</div>
              </>



          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este jefe de sección? Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
