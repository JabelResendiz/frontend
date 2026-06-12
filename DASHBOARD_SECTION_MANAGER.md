# Dashboard de Desempeño - Guía de Implementación

## Descripción General
El nuevo dashboard del Jefe de Sección proporciona gráficos interactivos para tomar decisiones sobre asignación de reportes a médicos. Todos los gráficos son **locales** (se renderizan en el navegador sin necesidad de plugins adicionales).

## 🎯 Características Implementadas

### 1. **Gráficos Principales**

#### Top 10 Médicos (`TopDoctorsChart`)
- **Propósito**: Identificar médicos más eficientes
- **Datos Mostrados**:
  - Reportes completados (barra verde)
  - Reportes pendientes (barra amarilla)
  - Tarjetas detalladas de cada médico
- **Caso de Uso**: Asigna reportes a médicos con mayor carga completada y baja cantidad de pendientes

#### Resumen de Reportes (`ReportsSummaryChart`)
- **Propósito**: Visión general del estado de reportes
- **Datos Mostrados**:
  - Gráfico de torta con distribución de estados
  - Cards con números absolutos y porcentajes
  - Estados: Completados, Pendientes, Expirados
- **Caso de Uso**: Entender en qué estado está la gestión general

#### Tasa de Completación Global (`CompletionRateChart`)
- **Propósito**: KPI principal del desempeño
- **Datos Mostrados**:
  - Gráfico de dona con porcentaje
  - Número de reportes completados vs total
- **Caso de Uso**: Monitorear si se está alcanzando la meta de completación

#### Estadísticas de Vacunas (`VaccineStatsChart`)
- **Propósito**: Identificar vacunas con más eventos adversos
- **Datos Mostrados**:
  - Gráfico de barras: reportes vs eventos adversos
  - Lista de top 5 vacunas por cantidad de reportes
- **Caso de Uso**: Entrenar médicos sobre vacunas problemáticas; priorizar asignaciones

### 2. **Pestañas del Dashboard**

| Pestaña | Contenido |
|---------|-----------|
| **Desempeño** | Top 10 médicos + Criterios de selección |
| **Reportes** | Gráfico de estado + Tasa de completación |
| **Vacunas** | Distribución de reportes por vacuna |
| **Geografía** | Mapa de provincias + Lista detallada |

## 📊 Métodos del Servicio (Backend)

### Endpoints Requeridos

```typescript
// 1. Estadísticas de médicos
GET /Report/sectionResponsible/doctor-stats?limit=10
Response:
{
  "data": [
    {
      "doctorId": "string",
      "doctorName": "string",
      "completedReports": 15,
      "pendingReports": 3,
      "reviewRating": 4.8,
      "completionRate": 83.3
    }
  ]
}

// 2. Resumen de reportes
GET /Report/sectionResponsible/summary
Response:
{
  "data": {
    "totalReports": 100,
    "completedReports": 60,
    "pendingReports": 30,
    "expiredReports": 10,
    "completionPercentage": 60.0
  }
}

// 3. Estadísticas por vacuna
GET /Report/sectionResponsible/vaccine-stats
Response:
{
  "data": [
    {
      "vaccineName": "string",
      "totalReports": 25,
      "adverseEventsCount": 8,
      "severityRate": 32.0
    }
  ]
}

// 4. Estadísticas por municipio (opcional)
GET /Report/sectionResponsible/municipality-stats
Response:
{
  "data": [
    {
      "municipalityId": 1,
      "municipalityName": "string",
      "totalReports": 50,
      "completedReports": 35,
      "doctorCount": 5
    }
  ]
}
```

### Fallback Automático
Si los endpoints no están disponibles, el sistema:
1. Intenta consumir `/Report/sectionResponsible/assigned`
2. Calcula estadísticas localmente en base a reportes asignados
3. Muestra los datos sin problemas (sin errores)

## 🎨 Paleta de Colores

```typescript
COLORS = {
  primary: "#0A4B8F",    // Azul oscuro
  success: "#10B981",    // Verde
  warning: "#F59E0B",    // Amarillo/Naranja
  danger: "#EF4444",     // Rojo
  info: "#3B82F6",       // Azul claro
  secondary: "#8B5CF6",  // Púrpura
}
```

## 🔧 Uso en Código

### Importar Componentes
```tsx
import { 
  TopDoctorsChart, 
  ReportsSummaryChart, 
  VaccineStatsChart,
  CompletionRateChart 
} from "@/app/components/ui/dashboard-charts";

import { 
  reportService, 
  type DoctorReportStats, 
  type ReportsSummary, 
  type VaccineStats 
} from "@/app/services/report.service";
```

### Usar en Componente
```tsx
const [doctorStats, setDoctorStats] = useState<DoctorReportStats[]>([]);
const [reportsSummary, setReportsSummary] = useState<ReportsSummary | null>(null);
const [vaccineStats, setVaccineStats] = useState<VaccineStats[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const [doctors, summary, vaccines] = await Promise.all([
        reportService.getDoctorReportStats(10),
        reportService.getReportsSummary(),
        reportService.getVaccineStats(),
      ]);
      setDoctorStats(doctors);
      setReportsSummary(summary);
      setVaccineStats(vaccines);
    } catch (err) {
      toast.error('Error cargando dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);

return (
  <TopDoctorsChart data={doctorStats} isLoading={isLoading} />
  // ... más componentes
);
```

## 📈 Flujo de Datos

```
Backend API
    ↓
reportService.getDoctorReportStats()
    ↓
Estado React (doctorStats)
    ↓
<TopDoctorsChart data={doctorStats} />
    ↓
Recharts BarChart
    ↓
Renderizado en navegador
```

## 🎯 Recomendaciones para Asignación de Reportes

### 1. Selecciona médicos del Top 10
- Mayor experiencia verificada
- Tasa de completación comprobada

### 2. Verifica carga actual
- No asignes a médicos con muchos pendientes
- Distribuye equitativamente

### 3. Considera especialidad
- Eventos de vacunas específicas → Médicos especializados
- Usa datos de "Estadísticas de Vacunas" para decidir

### 4. Monitorea tasa de completación
- Meta: Mantener > 70% completados
- Capacita médicos con baja tasa

## 🔄 Integración con Manage Reports Page

El componente `manage-reports-page.tsx` complementa este dashboard:
- Dashboard: Visualización estratégica
- Manage Reports: Asignación operativa

Juntos permiten un flujo: **Analizar → Decidir → Asignar**

## 📱 Responsividad

Todos los gráficos son responsivos:
- ✅ Mobile: Stack vertical, gráficos escalados
- ✅ Tablet: 2 columnas
- ✅ Desktop: Múltiples columnas

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| Gráficos sin datos | Verifica endpoint `/Report/sectionResponsible/doctor-stats` |
| "Cargando datos..." | Esperando respuesta de API (timeout default 5s) |
| Error al cargar | Toast mostrará mensaje del backend |
| Fallback activado | Los datos se calculan localmente desde asignados |

## 📚 Tecnologías

- **Recharts**: Gráficos interactivos (responsivos, sin dependencias pesadas)
- **Radix UI**: Componentes base (Card, Tabs)
- **TailwindCSS**: Estilos
- **React Hooks**: State management local

## ✅ Checklist de Implementación Backend

- [ ] Crear endpoint `/Report/sectionResponsible/doctor-stats`
- [ ] Crear endpoint `/Report/sectionResponsible/summary`
- [ ] Crear endpoint `/Report/sectionResponsible/vaccine-stats`
- [ ] Crear endpoint `/Report/sectionResponsible/municipality-stats` (opcional)
- [ ] Documentar respuestas en Swagger/OpenAPI
- [ ] Agregar filtros por fecha (opcional, v2)
- [ ] Agregar caché en backend (para optimizar queries)

---

**Última actualización**: Mayo 14, 2026
**Versión**: 1.0
