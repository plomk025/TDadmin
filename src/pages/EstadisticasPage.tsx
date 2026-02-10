// Página de estadísticas avanzadas con datos del historial
import React from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Banknote,
  Bus
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const EstadisticasPage: React.FC = () => {
  const { 
    historial, 
    stats, 
    historialStats,
    loading, 
    refresh 
  } = useRealtimeData();

  // Datos para gráfica de rutas
  const rutasData = React.useMemo(() => {
    const rutaCount: Record<string, number> = {};
    historial.forEach(h => {
      rutaCount[h.paradaNombre] = (rutaCount[h.paradaNombre] || 0) + 1;
    });
    return Object.entries(rutaCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [historial]);

  // Datos para gráfica de ventas por día
  const ventasPorDia = React.useMemo(() => {
    const diaCount: Record<string, { ventas: number; ingresos: number }> = {};
    historial.forEach(h => {
      if (h.fechaSalida) {
        if (!diaCount[h.fechaSalida]) {
          diaCount[h.fechaSalida] = { ventas: 0, ingresos: 0 };
        }
        diaCount[h.fechaSalida].ventas += 1;
        diaCount[h.fechaSalida].ingresos += h.precio || 0;
      }
    });
    return Object.entries(diaCount)
      .map(([fecha, data]) => ({ fecha, ...data }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-14);
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
    { name: 'Efectivo', value: historialStats.metodoPagoEfectivo, fill: '#22c55e' },
    { name: 'Transferencia', value: historialStats.metodoPagoTransferencia, fill: '#6366f1' }
  ];

  // Datos para gráfica de ganancia por bus
  const gananciaBusData = historialStats.gananciaPorBus.slice(0, 10);

  return (
    <MainLayout>
      <PageHeader
        title="Estadísticas"
        description="Análisis detallado basado en el historial de ventas"
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

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-gradient-to-br from-success/10 to-success/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.ingresosTotales)}</p>
              <p className="text-xs text-muted-foreground mt-1">{historial.length} transacciones</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ruta Más Demandada</p>
              <p className="text-lg font-bold mt-1 truncate">{historialStats.rutaMasDemandada}</p>
              <p className="text-xs text-muted-foreground mt-1">{historialStats.rutaCount} viajes</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-warning/10 to-warning/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Día Más Vendido</p>
              <p className="text-lg font-bold mt-1">{historialStats.diaMasVendido}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-accent/10 to-accent/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hora Más Vendida</p>
              <p className="text-lg font-bold mt-1">{historialStats.horaMasVendida}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas de ventas por fecha y hora */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Ventas e ingresos por día */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Ventas por Fecha
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasPorDia}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                  name="Boletos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por hora */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Ventas por Hora
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hora" 
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
                <Bar 
                  dataKey="ventas" 
                  fill="hsl(var(--warning))" 
                  radius={[4, 4, 0, 0]}
                  name="Boletos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rutas más demandadas y métodos de pago */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Rutas más demandadas */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Rutas Más Demandadas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rutasData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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

        {/* Métodos de pago */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-success" />
            Métodos de Pago
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metodosPagoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {metodosPagoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-success" />
              <span className="font-medium">{historialStats.metodoPagoEfectivo} Efectivo</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">{historialStats.metodoPagoTransferencia} Transferencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ganancia por bus */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          Ganancia por Bus
        </h3>
        <div className="h-80">
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
              >
                {gananciaBusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default EstadisticasPage;
