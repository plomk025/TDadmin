// Componente de sidebar para navegación - Trans Doramald
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Bus,
  History,
  Settings,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/usuarios', icon: Users, adminOnly: true },
  { label: 'Buses', href: '/buses', icon: Bus, adminOnly: true },
  { label: 'Encomiendas', href: '/encomiendas', icon: Package, adminOnly: true },
  { label: 'Historial', href: '/historial', icon: History, adminOnly: true },
  { label: 'Estadísticas', href: '/estadisticas', icon: BarChart3, adminOnly: true },
  { label: 'Configuración', href: '/configuracion', icon: Settings, adminOnly: true },
];

const Sidebar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex h-full flex-col">
        {/* Logo y Branding */}
        <div className="border-b bg-gradient-to-r from-[#940016] to-[#B8001F] px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            {/* Logo Icon */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#940016] shadow-lg overflow-hidden">
                <img 
                  src="/icon.png" 
                  alt="Trans Doramald" 
                  className="h-full w-full object-contain p-1"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>';
                  }}
                />
              </div>
            </div>
            
            {/* Texto del Logo */}
            <div className="flex-1">
              <span className="block text-lg font-bold text-white tracking-tight group-hover:text-white/90 transition-colors">
                Trans Doramald
              </span>
              <span className="block text-xs text-white/70 font-medium">
                Panel de Gestión
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#940016] to-[#B8001F] text-white shadow-md shadow-[#940016]/20'
                    : 'text-gray-700 hover:bg-[#940016]/5 hover:text-[#940016]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 group-hover:bg-[#940016]/10"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-gray-600 group-hover:text-[#940016]"
                    )} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t bg-gray-50/50 p-4">
          {/* Info del Usuario */}
          <div className="mb-3 rounded-xl bg-white border p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#940016] to-[#B8001F] ring-2 ring-white shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 border-2 border-white">
                    <span className="text-[10px] font-bold text-amber-900">A</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.displayName || 'Usuario'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#940016]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#940016]" />
                      Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Usuario
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={signOut}
            className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-red-100">
                <LogOut className="h-5 w-5 transition-colors group-hover:text-red-600" />
              </div>
              <span>Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;