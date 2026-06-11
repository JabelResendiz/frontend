# Implementación de Clave de Idempotencia (Idempotency Key)

## 📋 Resumen
La **clave de idempotencia** es un identificador único que se genera cuando se abre el formulario de reporte. Se envía al backend para prevenir que se procesen reportes duplicados si la solicitud se reintenta múltiples veces.

---

## 🔑 ¿Qué es la Idempotencia?

En sistemas distribuidos, las solicitudes pueden fallar y ser reintentadas. Sin un mecanismo de idempotencia, una solicitud fallida que se reintenta dos veces resultaría en dos reportes creados. La clave de idempotencia permite al backend detectar y rechazar intentos duplicados del mismo reporte.

---

## 🛠️ Generación de la Clave

### Función Utilizada
```typescript
crypto.randomUUID()
```

- **Qué es**: Genera un UUID v4 (universally unique identifier)
- **Formato**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Ejemplo**: `550e8400-e29b-41d4-a716-446655440000`
- **Características**: 
  - 100% único
  - Basado en números aleatorios
  - No necesita sincronización de servidor

### Dónde se Genera
En [report-page.tsx](src/app/components/pages/report-page.tsx#L835), dentro de la función `handleSubmit()`:

```typescript
if (!submissionIdRef.current) {
  submissionIdRef.current = crypto.randomUUID();
}
```

Se genera **una sola vez** cuando se va a enviar el formulario. Si se intenta reenviar, se reutiliza la misma clave.

---

## 💾 Almacenamiento

### Estructura de Datos

```typescript
const submissionIdRef = useRef<string | null>(null);
```

- **Tipo**: `useRef` de React (referencia mutable que persiste entre renders)
- **Razón**: No queremos que cambiar la clave cause re-renders del componente
- **Ciclo de vida**:
  1. `null` al iniciar el formulario
  2. Se asigna el UUID al intentar enviar
  3. Se resetea a `null` después del envío exitoso

---

## 📤 Envío de la Clave

### Ubicación en la Solicitud HTTP

La clave se envía como un **header HTTP**, no en el body:

```typescript
const response = await reportService.createPublic(payload, {
  headers: {
    'Idempotency-Key': submissionIdRef.current || undefined,
  },
});
```

### Estructura de la Solicitud

```http
POST /Report/createPublic HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer [access_token]
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "reportDate": "2024-01-15T10:30:00.000Z",
  "reporter": { ... },
  "vaccinatedSubject": { ... },
  "vaccinations": [ ... ],
  "adverseEvents": [ ... ]
}
```

### ¿Por Qué en Header?

- **Estándar REST**: RFC 7231 define que los headers son el lugar apropiado
- **Semanticidad**: La clave no es parte de la lógica del reporte
- **Cachés**: Los proxies y cachés pueden usar este header sin analizar el body
- **Visibilidad**: Fácil de ver en herramientas de debugging

---

## 🔄 Ciclo de Vida Completo

```
1. Usuario abre formulario
   └─ submissionIdRef.current = null

2. Usuario completa formulario y hace click en "Enviar"
   ├─ if (!submissionIdRef.current)
   │   └─ submissionIdRef.current = crypto.randomUUID()
   │       └─ Genera: "550e8400-e29b-41d4-a716-446655440000"
   └─ Se prepara payload

3. Se envía solicitud HTTP
   ├─ Body: { reportDate, reporter, vaccinatedSubject, ... }
   ├─ Headers: { 'Idempotency-Key': '550e8400-e29b-41d4-a716-446655440000' }
   └─ El backend recibe y procesa

4. Backend procesa la solicitud
   ├─ Verifica si ya vio esta Idempotency-Key
   ├─ Si es NUEVA: crea el reporte normalmente
   ├─ Si ya existe: retorna el reporte anterior (evita duplicado)
   └─ Retorna response exitosa

5. Frontend recibe respuesta exitosa
   ├─ Muestra dialog de éxito
   ├─ Extrae número de notificación
   ├─ submissionIdRef.current = null  ← Se limpia
   └─ setFormData(initialFormData)     ← Se resetea formulario
```

---

## 🔐 Validación en el Backend (Pseudocódigo)

```csharp
public async Task<IActionResult> CreatePublic(CreatePublicReportRequest request, 
    [FromHeader(Name = "Idempotency-Key")] string idempotencyKey)
{
    // 1. Verificar si la clave de idempotencia ya existe
    var existingReport = await _reportRepository.GetByIdempotencyKey(idempotencyKey);
    
    if (existingReport != null)
    {
        // Solicitud duplicada: retornar el reporte anterior
        return Ok(new 
        { 
            notificationNumber = existingReport.NotificationNumber,
            message = "Reporte ya fue procesado"
        });
    }
    
    // 2. Es una solicitud nueva: crear el reporte
    var newReport = new Report
    {
        IdempotencyKey = idempotencyKey,  // Guardar la clave
        ReportDate = request.ReportDate,
        Reporter = request.Reporter,
        // ... más datos
    };
    
    await _reportRepository.Add(newReport);
    await _reportRepository.SaveChangesAsync();
    
    // 3. Retornar el nuevo reporte
    return Ok(new 
    { 
        notificationNumber = newReport.NotificationNumber,
        message = "Reporte registrado exitosamente"
    });
}
```

---

## 🎯 Casos de Uso

### ✅ Caso 1: Envío Exitoso Normal
```
1. Usuario envía formulario con Idempotency-Key: ABC123
2. Backend crea reporte y lo almacena con ABC123
3. Frontend recibe respuesta → muestra éxito
```

### ✅ Caso 2: Reintentos por Timeout
```
1. Usuario envía formulario con Idempotency-Key: ABC123
2. Solicitud se pierde (timeout de red)
3. Usuario hace click en "Enviar" nuevamente
4. Frontend reutiliza ABC123 (no genera nuevo)
5. Backend recibe ABC123 que ya existe → retorna el reporte anterior
6. Frontend muestra éxito sin crear duplicado ✓
```

### ✅ Caso 3: Doble Click Accidental
```
1. Usuario hace click en enviar
2. Mientras se procesa, hace click nuevamente
3. Primera solicitud con ABC123 se procesa
4. Segunda solicitud con ABC123 llega al backend
5. Backend detecta que ya procesó ABC123 → rechaza
6. Sin duplicados ✓
```

---

## 📝 Resumen de Archivos Involucrados

| Archivo | Rol | Línea |
|---------|-----|-------|
| [report-page.tsx](src/app/components/pages/report-page.tsx) | Genera UUID y lo envía en headers | 835, 939 |
| [report.service.ts](src/app/services/report.service.ts) | Realiza la solicitud POST | 246 |
| [api.ts](src/app/services/api.ts) | Configuración de axios | - |
| Backend (no incluido) | Valida y almacena la clave | - |

---

## 🚀 Flujo de Código en el Frontend

```typescript
// 1. En handleSubmit() - Línea 835
if (!submissionIdRef.current) {
  submissionIdRef.current = crypto.randomUUID();
}

// 2. Preparar payload (líneas 809-921)
const payload = {
  reportDate: reportDate.toISOString(),
  reporter: { ... },
  vaccinatedSubject: { ... },
  // ... más datos

// 3. Enviar con header - Línea 938-941
const response = await reportService.createPublic(payload, {
  headers: {
    'Idempotency-Key': submissionIdRef.current || undefined,
  },
});

// 4. Procesar respuesta - Línea 943-945
const notifNumber = response?.data?.notificationNumber || "AEFI-" + Date.now();
const message = response?.message || "Su reporte ha sido registrado exitosamente.";

// 5. Limpiar - Línea 951
submissionIdRef.current = null;
```

---

## 📊 Ventajas de esta Implementación

| Ventaja | Descripción |
|---------|-------------|
| **Previene Duplicados** | Cada reporte es único, incluso con reintentos |
| **Estándar REST** | Sigue mejores prácticas de APIs HTTP |
| **Transparente** | El usuario no necesita hacer nada extra |
| **Eficiente** | No genera carga adicional en el servidor |
| **Debugging Fácil** | Visible en Developer Tools → Network |
| **Seguro** | No expone información sensible |

---

## ⚠️ Consideraciones Importantes

1. **No Guardar en localStorage**: La clave debe ser temporal, solo para la sesión actual
2. **UUID v4 Criptográfico**: `crypto.randomUUID()` usa números aleatorios reales, no predecibles
3. **Header Opcional**: Si por alguna razón no se genera, el backend puede rechazar la solicitud
4. **Limpieza Necesaria**: Se limpia después de éxito para permitir nuevas solicitudes

---

## 🔧 Cómo Agregar/Modificar

### Si necesitas cambiar el formato de la clave:

```typescript
// Cambiar de UUID a timestamp:
submissionIdRef.current = Date.now().toString();

// Cambiar de UUID a combinación:
submissionIdRef.current = `${Date.now()}-${crypto.randomUUID()}`;

// Agregar prefix:
submissionIdRef.current = `AEFI-${crypto.randomUUID()}`;
```

### Si necesitas acceder a la clave en otro componente:

Pásalo por props o por React Context:

```typescript
interface ReportPageProps {
  onNavigate: (page: string) => void;
  idempotencyKey?: string;  // Agregar prop
}
```

---

## 📚 Referencias

- [RFC 7231: HTTP Semantics](https://tools.ietf.org/html/rfc7231)
- [Idempotency-Key Draft Spec](https://datatracker.ietf.org/doc/html/draft-idempotency-http-methods)
- [MDN: crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)
- [HTTP Headers Best Practices](https://httpwg.org/http-core/)

---

**Última actualización**: Junio 2026  
**Estado**: ✅ Implementado y funcionando
