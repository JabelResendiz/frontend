import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'Physician' | 'Admin'>('Physician');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name, userName, userRole);
      // Después de registrarse exitosamente, volver a la pantalla de login
      setIsRegister(false);
      setName('');
      setUserName('');
      setEmail('');
      setPassword('');
      setError('');
      setError('Registro exitoso. Por favor inicia sesión.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister
              ? 'Regístrate para crear tu cuenta'
              : 'Ingresa tus credenciales para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant={isRegister && error.includes('exitoso') ? 'default' : 'destructive'} className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    placeholder="Nombre de usuario único"
                    value={userName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

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

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physician">Médico (Physician)</SelectItem>
                    <SelectItem value="Admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? isRegister
                  ? 'Registrando...'
                  : 'Iniciando sesión...'
                : isRegister
                ? 'Registrarse'
                : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t">
            <p className="text-center text-sm text-gray-600">
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                  setUserName('');
                  setUserRole('Physician');
                }}
                className="ml-1 text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {isRegister ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
