# Implementación del frontend

## 1. Arquitectura del frontend

- `src/main.tsx`
  - Punto de entrada del SPA.
  - Renderiza el componente principal `<App />` y carga `./styles/index.css`.

- `src/app/App.tsx`
  - Núcleo de la aplicación.
  - Contiene la lógica de navegación interna basada en estado (`currentPage`, `selectedReportId`, `selectedReport`, `isTransitioning`, `contextAction`).
  - Define el mapa de rutas internas `pagePathMap` y la función `getPageFromPath` para sincronizar el `window.location.pathname` con la página actual.
  - Protege el acceso a páginas restringidas con `useAuth()` y redirige a `login` si no hay sesión activa.
  - Envuelve el contenido con `AuthProvider` y `ReportProvider`.

- `src/app/context/AuthContext.tsx`
  - Contexto global de autenticación.
  - Gestiona `user`, `isAuthenticated`, `isLoading`, `login` y `logout`.
  - Usa `useEffect` para restaurar la sesión con `authService.refreshToken()` al cargar la aplicación.
  - Exporta `useAuth()` para que cualquier componente pueda acceder al estado y acciones de autenticación.

- `src/app/context/ReportContext.tsx`
  - Aunque no se leyó en detalle, su presencia en `App.tsx` indica un contexto de estado compartido para reportes.

- `src/app/components/pages/*`
  - Cada página es un componente React independiente.
  - El enrutamiento no es de React Router, sino interno: `App.tsx` renderiza el componente según `currentPage`.

## 2. Gestión del estado y comunicación con la API

### Estado global y local

- Estado global de autenticación: `src/app/context/AuthContext.tsx`.
  - `user`: datos del usuario autenticado.
  - `isAuthenticated`: booleano de sesión activa.
  - `isLoading`: control de estado inicial de carga.

- Estado de navegación y selección de reporte: `src/app/App.tsx`.
  - `currentPage`: página actual.
  - `selectedReportId`, `selectedReport`: para pasar datos entre vistas.
  - `isTransitioning`: para animaciones de cambio de página.

- Estado local de páginas: `useState` y `useEffect` en cada página.
  - Ejemplo: `src/app/components/pages/activate-account-page.tsx` usa `professionalNumber`, `password`, `confirmPassword`, `error`, `success` y `loading`.

### Comunicación con API

- `src/app/services/api.ts`
  - Instancia `axios` configurada con `baseURL`, `timeout` y `withCredentials`.
  - Interceptores request/response para inyectar `Authorization: Bearer <token>` y gestionar refresh de token.
  - Maneja expiración de sesión con `401` y reintento automático cuando se renueva el token.
  - `registerLogoutHandler()` permite cerrar sesión desde cualquier parte del frontend cuando el backend rechaza el token.

- `src/app/services/auth.service.ts`
  - Servicio especializado para auth.
  - Métodos:
    - `login(email, password, token)` => POST `/Authentication/login`
    - `completeRegistration(payload)` => POST `/Authentication/complete-registration`
    - `refreshToken()` => POST `/v2/Authentication/refresh`
    - `logout()` => POST `/v2/Authentication/logout`

- `src/app/services/token-manager.ts`
  - Administra el token de acceso en memoria.
  - Métodos: `getAccessToken`, `setAccessToken`, `clearAccessToken`.

- Librerías usadas:
  - `axios` para llamadas HTTP.
  - `react` para estado local y hooks.

## 3. Construcción de interfaces de usuario

### Componentes UI reutilizables

- `src/app/components/ui/*`
  - Componente `Button`, `Input`, `Label`, `Card`, `Alert`, etc.
  - Estos componentes proporcionan estilos y comportamiento consistentes entre páginas.

- Librerías de UI y utilidades:
  - `@radix-ui/react-*` para componentes accesibles (accordion, alert-dialog, checkbox, dialog, select, tabs, etc.).
  - `lucide-react` para íconos.
  - `class-variance-authority`, `clsx` para clases condicionales.
  - `tailwindcss` con utilidades de diseño y responsive.

### Diseño de páginas

- Páginas como `src/app/components/pages/dashboard-page.tsx` usan `grid`, `flex`, `gap`, `max-w-7xl`, `px-4`, `sm:px-6`, `lg:px-8`.
- Usan `Card` para agrupar información y `ResponsiveContainer` de `recharts` para gráficos adaptables.
- El layout general emplea `min-h-screen`, contenedores centrados y tarjetas con sombras para una UX moderna.

## 4. Implementación de formularios

- Formularios de ejemplo:
  - `src/app/components/pages/login-page.tsx`
  - `src/app/components/pages/activate-account-page.tsx`

- Características de formularios:
  - Uso de `form onSubmit={...}` con prevención de comportamiento predeterminado.
  - Control de inputs con `useState`.
  - Campos `required` en elementos `Input`.
  - Validaciones manuales en el handler antes de enviar datos al backend.

- Componentes de formulario:
  - `Input` y `Label` desde `src/app/components/ui/*`.
  - `Button` para envío y acciones.

## 5. Validaciones y experiencia de usuario

### Validaciones

- `login-page.tsx`:
  - Verifica que el captcha esté presente antes de llamar a `login()`.
  - Interpreta errores del backend y muestra mensajes específicos para credenciales inválidas.

- `activate-account-page.tsx`:
  - Comprueba existencia de `email` y `token` en URL.
  - Valida que `professionalNumber` no esté vacío.
  - Valida que `password` y `confirmPassword` coincidan.

- Los errores se muestran con `Alert` de `src/app/components/ui/alert.tsx`.

### Experiencia de usuario

- Mensajes claros en pantalla y estados de carga:
  - `loading` controla el texto del botón y evita dobles envíos.
  - `error` y `success` muestran feedback visual.

- `FriendlyCaptcha` en `src/app/components/pages/login-page.tsx`:
  - Mejora la seguridad y evita bots.
  - Usa la librería `@friendlycaptcha/sdk`.

- Navegación fluida y transición de páginas:
  - `App.tsx` usa `page-transition`, `slide-out` y `slide-in` para animaciones.
  - `window.scrollTo(0, 0)` garantiza que el usuario siempre vea el inicio del contenido al cambiar de vista.

## 6. Manejo de autenticación en el cliente

- `src/app/context/AuthContext.tsx`:
  - `login()` llama a `authService.login()` y guarda el token en `token-manager.ts`.
  - Decodifica JWT con `parseJwt()` para extraer datos de usuario (`id`, `email`, `name`, `role`).
  - `logout()` limpia token y estado local.
  - `restoreSession` intenta refrescar token al cargar la app.

- `src/app/services/api.ts`:
  - Añade el token `Authorization` en cada petición.
  - Refresca el token automáticamente ante `401` si no se trata de endpoints de auth.
  - Si el refresh falla, limpia la sesión y dispara `logoutHandler`.

- `src/app/components/navigation.tsx`:
  - Usa `useAuth()` para mostrar rutas diferentes según `user.role`.
  - Controla lógica de logout y muestra botones condicionados.

## 7. Diseño responsivo

- `tailwindcss` es la principal herramienta de responsividad.
- Clases usadas en varias páginas:
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
  - `flex flex-col sm:flex-row sm:items-center sm:justify-between`
  - `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  - `hidden md:flex` y `md:hidden` para alternar navegación desktop/mobile.

- `src/app/components/navigation.tsx`:
  - Implementa un menú de escritorio y un menú móvil separado.
  - Controla `mobileMenuOpen` con `useState`.

- `src/app/components/pages/dashboard-page.tsx` y otras páginas usan `ResponsiveContainer` de `recharts` para gráficos que se adaptan automáticamente al ancho del contenedor.

- Formulario y tarjetas usan `max-w-md`, `w-full` y `space-y-4` para mantener buen aspecto en móviles.

## Conclusión

Este frontend está construido como un SPA en React con:

- Enrutamiento interno en `src/app/App.tsx`.
- Autenticación centralizada en `src/app/context/AuthContext.tsx`.
- Comunicación HTTP con `axios` y manejo avanzado de tokens en `src/app/services/api.ts`.
- Formularios controlados manualmente con validaciones en páginas de login y activación.
- Interfaz basada en componentes reutilizables y Tailwind CSS.
- Diseño responsivo gracias a clases de Tailwind y componentes adaptativos.

## 8. Conexión segura con el backend (cómo se garantiza y librerías)

- Archivo principal de conexión: [src/app/services/api.ts](src/app/services/api.ts)
  - Librería: `axios`.
  - Se usa `baseURL` configurable via `import.meta.env.VITE_API_BASE_URL` y `timeout` para evitar peticiones colgadas.
  - `withCredentials: true` cuando el backend usa cookies de sesión/refresh.
  - Interceptores:
    - Request: inyecta `Authorization: Bearer <token>` desde `token-manager` (memoria).
    - Response: detecta `401` y hace refresh automático con `authService.refreshToken()` antes de reintentar la petición.
  - Buenas prácticas aplicadas:
    - Tiempo de espera configurable.
    - Manejo centralizado de errores y mensajes amigables al frontend.
    - `registerLogoutHandler()` para forzar logout cuando el backend invalida la sesión.

- Recomendaciones adicionales para robustez:
  - Usar HTTPS con HSTS en producción y validar certificados.
  - Configurar CORS en el backend para restringir orígenes permitidos.
  - Considerar reintentos exponenciales para llamadas idempotentes.
  - Para llamadas críticas o largas, usar cancel tokens (`AbortController`) o `axios` cancel.

## 9. Validación en tiempo real (librerías y patrón recomendado)

- Librerías recomendadas:
  - `react-hook-form` — para formularios controlados y rendimiento.
  - `zod` (o `yup`) — para esquemas y validación declarativa.
  - `@hookform/resolvers` — para integrar `zod` con `react-hook-form`.

- Dónde integrarlo en el proyecto:
  - Formularios: ej. [src/app/components/pages/activate-account-page.tsx](src/app/components/pages/activate-account-page.tsx) y [src/app/components/pages/login-page.tsx](src/app/components/pages/login-page.tsx).
  - Extraer lógica a componentes reutilizables en `src/app/components/ui/` cuando tenga sentido.

- Beneficios:
  - Validación instantánea en el cliente mientras el usuario escribe (debounce + `onChange`/`onBlur`).
  - Menor número de peticiones fallidas al backend y mejor UX.

- Fragmento de ejemplo (React + react-hook-form + zod):

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) ctx.addIssue({ code: 'custom', message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });
});

type FormValues = z.infer<typeof schema>;

function AccountForm() {
  const { register, handleSubmit, formState, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange', // validación en tiempo real
  });

  // ejemplo de validación async (comprobar email en backend con debounce)
  const email = watch('email');
  // useEffect + debounce + llamada a /users/check-email para mostrar feedback

  const onSubmit = async (data: FormValues) => {
    // enviar a authService.completeRegistration
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {formState.errors.email && <span>{formState.errors.email.message}</span>}
      <input type="password" {...register('password')} />
      <input type="password" {...register('confirmPassword')} />
      {formState.errors.confirmPassword && <span>{formState.errors.confirmPassword.message}</span>}
      <button type="submit" disabled={!formState.isValid}>Enviar</button>
    </form>
  );
}
```

## 10. Gráficos y rendimiento

- Librería usada: `recharts` (ej.: [src/app/components/pages/dashboard-page.tsx](src/app/components/pages/dashboard-page.tsx)).

- Recomendaciones para garantizar fluidez y rendimiento:
  - Envolver gráficos con `ResponsiveContainer` para adaptabilidad al tamaño del contenedor.
  - Memoizar datos y configuraciones con `useMemo` para evitar re-render innecesarios.
  - Reducir puntos de datos enviados al cliente cuando no sean necesarios (agrupar/aglomerar en backend).
  - Para datasets muy grandes, renderizar solo un resumen en el dashboard y ofrecer una vista detallada con paginación o cargas bajo demanda.
  - Evitar cálculos pesados en el render; preprocesarlos fuera del componente o en web worker si es necesario.

- Ejemplo mínimo de uso responsivo (extracto):

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={eventsByMonth}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="total" stroke="#0A4B8F" />
  </LineChart>
</ResponsiveContainer>
```

## 11. JWT en memoria — implementación, riesgos y mitigaciones

- Implementación actual del proyecto:
  - `src/app/services/token-manager.ts` guarda el `accessToken` en memoria (variable JS) y provee `getAccessToken`, `setAccessToken`, `clearAccessToken`.
  - `src/app/context/AuthContext.tsx` usa `authService.refreshToken()` en el arranque para restaurar sesión y `setAccessToken()` una vez recibido el token.

- Por qué guardar el access token en memoria:
  - Evita exposición directa a XSS (localStorage/sessionStorage están accesibles desde JavaScript inyectado).
  - Reduce riesgo de robo de token mediante scripts maliciosos en caso de XSS.

- Riesgos y el "gran problema":
  - El token en memoria se pierde al recargar la página; la sesión solo puede restaurarse si existe un mecanismo de refresh (por ejemplo, refresh token en cookie httpOnly que no es accesible por JS).
  - Si el backend no provee refresh token via cookie segura, el usuario se desconectará tras reload y necesitará autenticarse de nuevo.

- Mitigaciones y patrón recomendado (seguro y práctico):
  1. Mantener el `accessToken` en memoria (corto plazo, p. ej. 5-15 minutos de vida).
  2. Guardar el `refreshToken` en cookie `httpOnly`, `Secure`, `SameSite=Strict` administrada por el servidor.
  3. Implementar rotación de refresh tokens y revocación en el servidor.
  4. Usar el endpoint `POST /v2/Authentication/refresh` que devuelve un nuevo access token (y opcionalmente nuevo refresh token). El frontend llamará este endpoint automáticamente (como ya hace `src/app/services/api.ts`) cuando reciba `401`.
  5. Detectar actividad inusual y forzar logout si la rotación falla (ya hay `registerLogoutHandler()` en `api.ts`).

- Fragmento de código (ilustrativo) — `token-manager.ts` (existente) y uso en `api.ts`:

```ts
// src/app/services/token-manager.ts (simplificado)
let accessToken: string | null = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

// Uso en interceptores (src/app/services/api.ts):
// - Request: añadir Authorization: `Bearer ${getAccessToken()}`
// - Response: ante 401 -> llamar authService.refreshToken() -> setAccessToken(nuevoToken)
```

- Flujos recomendados:
  - Inicio: `login()` devuelve access token; el frontend `setAccessToken(token)` y renderiza la app.
  - Reload/restore: en `AuthProvider` al montar, llamar a `authService.refreshToken()` (backend valida refresh cookie y responde con nuevo access token) y usar `setAccessToken()`.
  - Expiración en peticiones: `api.ts` ya implementa reintento tras refresh.

- Consideraciones de seguridad adicionales:
  - Proteger endpoints de refresh con tasa límite y medidas anti-abuso.
  - Implementar detección de token replay y rotación de refresh tokens.
  - Si no se pueden usar cookies httpOnly, evaluar usar PKCE + short-lived access tokens y forzar re-login.

---

Si quieres, aplico ejemplos concretos en archivos nuevos (`src/app/components/ui/validated-form.tsx`) o adapto el `login-page.tsx` para usar `react-hook-form` y `zod` como ejemplo real en el repo. ¿Quieres que lo implemente ahora?
