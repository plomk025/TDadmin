// Dashboard principal con estadísticas en tiempo real
import React from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { formatCurrency } from '@/utils/helpers';
import { 
  Users, 
  Bus, 
  Package, 
  MapPin,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  UserCheck,
  Clock,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DashboardPage: React.FC = () => {
  const { 
    usuarios, 
    buses, 
    conductores, 
    encomiendas, 
    historial,
    stats, 
    historialStats, 
    loading, 
    refresh 
  } = useRealtimeData();

  // Datos para gráfica de rutas demandadas
  const rutasData = React.useMemo(() => {
    const rutaCount: Record<string, number> = {};
    historial.forEach(h => {
      rutaCount[h.paradaNombre] = (rutaCount[h.paradaNombre] || 0) + 1;
    });
    return Object.entries(rutaCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [historial]);

  // Datos para gráfica de ventas por día
  const ventasPorDia = React.useMemo(() => {
    const diaCount: Record<string, number> = {};
    historial.forEach(h => {
      if (h.fechaSalida) {
        diaCount[h.fechaSalida] = (diaCount[h.fechaSalida] || 0) + 1;
      }
    });
    return Object.entries(diaCount)
      .map(([fecha, ventas]) => ({ fecha, ventas }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-7);
  }, [historial]);

  // Datos para gráfica de ventas por hora
  const ventasPorHora = React.useMemo(() => {
    const horaCount: Record<string, number> = {};
    historial.forEach(h => {
      if (h.horaSalida) {
        horaCount[h.horaSalida] = (horaCount[h.horaSalida] || 0) + 1;
      }
    });
    return Object.entries(horaCount)
      .map(([hora, ventas]) => ({ hora, ventas }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [historial]);

  // Datos para gráfica de métodos de pago
  const metodosPagoData = [
    { name: 'Efectivo', value: historialStats.metodoPagoEfectivo },
    { name: 'Transferencia', value: historialStats.metodoPagoTransferencia }
  ];

  // Datos para gráfica de ganancia por bus
  const gananciaBusData = historialStats.gananciaPorBus.slice(0, 6);

  // Datos para gráfica de encomiendas
  const encomiendasData = [
    { name: 'Pendientes', value: stats.encomiendas.pendientes },
    { name: 'En Tránsito', value: stats.encomiendas.enTransito },
    { name: 'Entregadas', value: stats.encomiendas.entregadas }
  ];

  // Usuarios por rol
  const usuariosPorRol = React.useMemo(() => {
    const rolCount: Record<string, number> = {};
    usuarios.forEach(u => {
      rolCount[u.rol] = (rolCount[u.rol] || 0) + 1;
    });
    return Object.entries(rolCount).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));
  }, [usuarios]);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Panel de control en tiempo real"
        actions={
          <Button 
            variant="outline" 
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Usuarios conectados */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Wifi className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.usuariosConectados}</p>
              <p className="text-sm text-muted-foreground">Conectados</p>
            </div>
          </div>
        </div>

        {/* Usuarios desconectados */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <WifiOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.usuariosDesconectados}</p>
              <p className="text-sm text-muted-foreground">Desconectados</p>
            </div>
          </div>
        </div>

        {/* Buses activos */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.busesActivos}</p>
              <p className="text-sm text-muted-foreground">Buses Activos</p>
            </div>
          </div>
        </div>

        {/* Conductores activos */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <UserCheck className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.conductoresActivos}</p>
              <p className="text-sm text-muted-foreground">Conductores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingresos y métricas clave */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-gradient-to-br from-success/10 to-success/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.ingresosTotales)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-success" />
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ruta Más Demandada</p>
              <p className="text-lg font-bold mt-1">{historialStats.rutaMasDemandada}</p>
              <p className="text-xs text-muted-foreground">{historialStats.rutaCount} viajes</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-warning/10 to-warning/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Día Más Vendido</p>
              <p className="text-lg font-bold mt-1">{historialStats.diaMasVendido}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-warning" />
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-accent/10 to-accent/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hora Más Vendida</p>
              <p className="text-lg font-bold mt-1">{historialStats.horaMasVendida}</p>
            </div>
            <Clock className="h-8 w-8 text-accent-foreground" />
          </div>
        </div>
      </div>

      {/* Gráficas principales */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Rutas más demandadas */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Rutas Más Demandadas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rutasData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Viajes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por día */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas por Día</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Boletos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Métodos de pago */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metodosPagoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#6366f1" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-success" />
              <span className="text-sm">Efectivo</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm">Transferencia</span>
            </div>
          </div>
        </div>

        {/* Encomiendas por estado */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Estado Encomiendas</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={encomiendasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usuarios por rol */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Usuarios por Rol</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usuariosPorRol}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {usuariosPorRol.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ganancia por bus */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Ganancia por Bus</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gananciaBusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="bus" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar 
                dataKey="ganancia" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Ganancia"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
