export function translateBackendErrorMessage(message?: string): string | null {
  if (!message) return null;

  if (/Error creating user: Email '([^']+)' is already taken\./.test(message)) {
    return message.replace(/Error creating user: Email '([^']+)' is already taken\./, "El correo '$1' ya está registrado.");
  }

  if (/Email '([^']+)' already taken\./.test(message)) {
    return message.replace(/Email '([^']+)' already taken\./, "El correo '$1' ya está registrado.");
  }

  if (/User not found/i.test(message)) {
    return 'Usuario no encontrado.';
  }

  return null;
}
