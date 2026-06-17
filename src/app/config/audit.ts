// Simple audit-mode helper.
// Enable by setting VITE_AUDIT_MODE=true in your Vite env for preview/testing only.
// For safety, audit mode is disabled in production builds by default.
// To allow audit mode in production-like builds, set VITE_AUDIT_ALLOW_PRODUCTION=true.
// If you want backend API calls to also work, set VITE_AUDIT_JWT=<jwt-token> for preview/test only.

const env = (import.meta as any).env || {};

const parseJwtPayload = <T extends Record<string, any>>(token: string): T | null => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(
      payload.split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
    ));
  } catch {
    return null;
  }
};

export const isAuditMode = (): boolean => {
  const enabled = env.VITE_AUDIT_MODE === 'true' || env.VITE_AUDIT_MODE === '1';
  const allowInProd = env.VITE_AUDIT_ALLOW_PRODUCTION === 'true' || env.VITE_AUDIT_ALLOW_PRODUCTION === '1';
  const isProd = env.MODE === 'production' || env.VITE_APP_ENV === 'production';

  if (!enabled) return false;
  if (isProd && !allowInProd) return false;
  return true;
};

export type AuditUser = {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'MedicalReviewer' | 'SectionResponsible';
};

export const getAuditJwt = (): string | null => {
  const token = env.VITE_AUDIT_JWT;
  return token && token.length > 0 ? token : null;
};

export const getAuditUser = (): AuditUser => {
  const token = getAuditJwt();
  if (!token) {
    return {
      id: 'audit-user',
      email: 'audit@example.com',
      name: 'Audit (preview)',
      role: 'Admin',
    };
  }

  const payload = parseJwtPayload<Record<string, any>>(token);
  const rawRole = payload?.role || payload?.roles || payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const role = Array.isArray(rawRole)
    ? rawRole[0]
    : typeof rawRole === 'string'
    ? rawRole
    : 'Admin';

  return {
    id: payload?.sub || payload?.nameid || payload?.uid || 'audit-user',
    email: payload?.email || payload?.unique_name || 'audit@example.com',
    name: payload?.given_name || payload?.name || payload?.email || 'Audit (preview)',
    role: role === 'Admin' ? 'Admin' : role === 'SectionResponsible' ? 'SectionResponsible' : 'MedicalReviewer',
  };
};

export default { isAuditMode, getAuditUser, getAuditJwt };

