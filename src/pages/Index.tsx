// Página de autenticación (Login) - Trans Doramald
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithGoogle } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bus, Loader2, Shield, Lock, ChevronRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const AuthPage: React.FC = () => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Función para verificar el rol del usuario
  const checkUserRole = async (userId: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios_registrados', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.rol || null;
      }
      return null;
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return null;
    }
  };

  // Manejar autenticación con Google
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error,
          variant: 'destructive'
        });
        setGoogleLoading(false);
        return;
      }

      if (user) {
        // Verificar el rol del usuario
        const userRole = await checkUserRole(user.uid);

        if (userRole === 'gerente') {
          toast({
            title: '¡Bienvenido!',
            description: `Hola ${user.displayName || 'Gerente'}, has iniciado sesión exitosamente.`,
          });
          navigate(from, { replace: true });
        } else {
          toast({
            title: 'Acceso Denegado',
            description: 'No tienes permisos de administrador para acceder al panel de gestión.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado con Google',
        variant: 'destructive'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        {/* Fondo gradiente refinado */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#940016] via-[#B8001F] to-[#6B0010]" />
        
        {/* Patrón geométrico sutil */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-between px-16 py-16 text-white w-full">
          {/* Header */}
          <div className="space-y-8">
            {/* Logo y nombre */}
            <div className="inline-flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Bus className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-light tracking-wide mb-1">
                  Trans <span className="font-semibold">Doramald</span>
                </h1>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <div className="h-px w-8 bg-white/40" />
                  <span className="tracking-wider uppercase text-xs">Transporte Rural</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido central */}
          <div className="max-w-xl space-y-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-light leading-tight tracking-tight">
                Sistema de
                <br />
                <span className="font-semibold">Gestión Empresarial</span>
              </h2>
              <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg">
                Plataforma integral para la administración eficiente 
                de operaciones de transporte rural.
              </p>
            </div>

            {/* Features minimalistas */}
            <div className="space-y-4">
              {[
                'Control total de flota vehicular',
                'Gestión centralizada de usuarios',
                'Administración de encomiendas',
                'Monitoreo de rutas en tiempo real'
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-4 text-white/70 hover:text-white transition-colors duration-300"
                >
                  <div className="flex items-center justify-center w-1.5 h-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white group-hover:scale-150 transition-all duration-300" />
                  </div>
                  <span className="text-base font-light tracking-wide">{feature}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center justify-between text-white/50 text-sm">
              <p className="font-light">
                © 2024 Trans Doramald
              </p>
              <p className="font-light">
                Conectando comunidades
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex w-full lg:w-2/5 items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="mb-12 flex justify-center lg:hidden">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#940016]/20 rounded-2xl blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#940016] to-[#B8001F]">
                <Bus className="h-7 w-7 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Encabezado */}
          <div className="mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#940016]/10">
              <Shield className="h-5 w-5 text-[#940016]" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-light text-gray-900">
                Panel de <span className="font-semibold">Administración</span>
              </h2>
              <p className="text-base text-gray-500 font-light">
                Accede con tu cuenta autorizada
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-8">
            {/* Botón de Google */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="group relative w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-[#940016]/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#940016]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#940016]" strokeWidth={1.5} />
              ) : (
                <div className="relative flex items-center justify-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium tracking-wide">Continuar con Google</span>
                </div>
              )}
            </Button>

            {/* Información de seguridad */}
            <div className="relative rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#940016]/5 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#940016]/10">
                    <Lock className="w-4 h-4 text-[#940016]" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Acceso Restringido
                  </h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Este panel requiere permisos de administrador. 
                  Solo usuarios autorizados pueden acceder al sistema de gestión.
                </p>
                <div className="pt-3 border-t border-slate-200/60">
                  <p className="text-xs text-gray-500 font-light">
                    Para solicitar acceso, contacta al administrador principal del sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="text-xs font-light text-gray-400 uppercase tracking-widest">
                  Funciones
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Gestión de Flota',
                  'Control de Usuarios',
                  'Encomiendas',
                  'Reportes'
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-xs text-gray-500 font-light"
                  >
                    <div className="w-1 h-1 rounded-full bg-[#940016]/40" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer móvil */}
          <div className="mt-12 pt-8 border-t border-slate-200 lg:hidden">
            <p className="text-xs text-center text-gray-400 font-light">
              © 2024 Trans Doramald
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;