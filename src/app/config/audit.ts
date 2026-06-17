// Simple audit-mode helper.
// Enable by setting VITE_AUDIT_MODE=true in your Vite env for preview/testing only.
// For safety, by default audit mode is disabled in production builds. To explicitly
// allow audit mode in production (not recommended) set VITE_AUDIT_ALLOW_PRODUCTION=true.

const env = (import.meta as any).env || {};

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

export const getAuditUser = (): AuditUser => ({
  id: 'audit-user',
  email: 'audit@example.com',
  name: 'Audit (preview)',
  role: 'Admin',
});

export default { isAuditMode, getAuditUser };
