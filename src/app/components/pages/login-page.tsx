import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  contextAction?: string;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<ReCAPTCHA | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!captchaValue) {
      setError('Por favor completa el captcha antes de iniciar sesión.');
      return;
    }
    setLoading(true);

    try {
      await login(email, password, captchaValue);
      onNavigate('home');
    } catch (err: any) {
      const responseData = err?.response?.data;
      const isInvalidCredentials =
        responseData?.type === 'ValidationError' &&
        responseData?.message?.includes('invalid credentials');

      const errorMessage = isInvalidCredentials
        ? 'Correo electrónico o contraseña incorrectos.'
        : err instanceof Error
        ? err.message
        : 'Error al iniciar sesión';

      setError(errorMessage);
      setCaptchaValue(null);
      (captchaRef.current as any)?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <p className="text-sm text-gray-600 mb-3">Por favor verifica que no eres un robot:</p>
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={((import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY as string) || ''}
                    onChange={(value: string | null) => setCaptchaValue(value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !captchaValue}
                title={!captchaValue ? 'Completa el captcha antes de iniciar sesión' : undefined}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
