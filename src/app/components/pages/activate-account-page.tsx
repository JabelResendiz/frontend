import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { authService } from '@/app/services/auth.service';

interface ActivateAccountPageProps {
  onNavigate: (page: string) => void;
}

const ActivateAccountPageComponent = ({ onNavigate }: ActivateAccountPageProps) => {
  const [professionalNumber, setProfessionalNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const email = queryParams.get('email') || '';
  const token = queryParams.get('token') || '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token) {
      setError('Falta el email o token de activación en la URL.');
      return;
    }

    if (!professionalNumber.trim()) {
      setError('Ingresa tu número de registro profesional.');
      return;
    }

    if (!password) {
      setError('Ingresa tu nueva contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await authService.completeRegistration({
        email,
        token,
        password,
        professionalNumber,
      });
      setSuccess('Registro completado con éxito. Ya puedes iniciar sesión.');
      setProfessionalNumber('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al completar el registro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Completa tu registro</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu número de registro profesional y tu nueva contraseña para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Email de activación</p>
            <p className="font-medium text-slate-900 break-all">{email || 'No disponible'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professionalNumber">Número de registro profesional</Label>
              <Input
                id="professionalNumber"
                type="text"
                placeholder="334324re1"
                value={professionalNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfessionalNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Completar registro'}
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => onNavigate('login')}>
                Volver a iniciar sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivateAccountPageComponent;
