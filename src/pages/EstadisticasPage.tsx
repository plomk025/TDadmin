// Página de estadísticas avanzadas con datos del historial
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { formatCurrency } from '@/utils/helpers';
import { ReportService } from '@/services/reportService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Banknote,
  Bus,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'recharts';

const COLORS = ['#007694', '#6500b8', '#006b1b', '#5fd400', '#15008b', '#0073a8'];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const EstadisticasPage: React.FC = () => {
  const { 
    historial, 
    stats, 
    historialStats,
    buses,
    loading, 
    refresh 
  } = useRealtimeData();

  const { toast } = useToast();
  const [selectedBus, setSelectedBus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Obtener mes actual en formato YYYY-MM
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Función para obtener el nombre del mes
  const getMonthName = (dateString: string): string => {
    const [year, month] = dateString.split('-');
    return `${MONTHS[parseInt(month) - 1]} ${year}`;
  };

  // Obtener meses disponibles del historial
  const mesesDisponibles = useMemo(() => {
    const meses = new Set<string>();
    historial.forEach(h => {
      if (h.fechaSalida) {
        const yearMonth = h.fechaSalida.substring(0, 7);
        meses.add(yearMonth);
      }
    });
    return Array.from(meses)
      .sort((a, b) => b.localeCompare(a)) // Ordenar de más reciente a más antiguo
      .map(mes => ({
        value: mes,
        label: getMonthName(mes)
      }));
  }, [historial]);

  // Obtener el mes seleccionado (actual o el especificado)
  const mesActual = useMemo(() => {
    if (selectedMonth === 'current') {
      return getCurrentMonth();
    }
    return selectedMonth;
  }, [selectedMonth]);

  // Filtrar historial por mes Y bus
  const filteredHistorial = useMemo(() => {
    let filtered = historial;

    // Filtrar por mes
    if (selectedMonth !== 'all') {
      const targetMonth = selectedMonth === 'current' ? getCurrentMonth() : selectedMonth;
      filtered = filtered.filter(h => {
        if (!h.fechaSalida) return false;
        const yearMonth = h.fechaSalida.substring(0, 7);
        return yearMonth === targetMonth;
      });
    }

    // Filtrar por bus
    if (selectedBus !== 'all') {
      filtered = filtered.filter(h => h.numeroBus === selectedBus);
    }

    return filtered;
  }, [historial, selectedBus, selectedMonth]);

  // Datos para gráfica de rutas
  const rutasData = useMemo(() => {
    const rutaCount: Record<string, number> = {};
    filteredHistorial.forEach(h => {
      rutaCount[h.paradaNombre] = (rutaCount[h.paradaNombre] || 0) + 1;
    });
    return Object.entries(rutaCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredHistorial]);

  // Datos para gráfica de ventas por MES (histórico completo - no filtrado)
  const ventasPorMes = useMemo(() => {
    const mesCount: Record<string, { ventas: number; ingresos: number }> = {};
    
    // Usar historial completo o filtrado por bus (pero no por mes)
    const historialParaGrafica = selectedBus === 'all' 
      ? historial 
      : historial.filter(h => h.numeroBus === selectedBus);
    
    historialParaGrafica.forEach(h => {
      if (h.fechaSalida) {
        const yearMonth = h.fechaSalida.substring(0, 7);
        if (!mesCount[yearMonth]) {
          mesCount[yearMonth] = { ventas: 0, ingresos: 0 };
        }
        mesCount[yearMonth].ventas += 1;
        mesCount[yearMonth].ingresos += h.precio || 0;
      }
    });
    return Object.entries(mesCount)
      .map(([mes, data]) => ({ 
        mes: getMonthName(mes),
        mesKey: mes,
        ...data 
      }))
      .sort((a, b) => a.mesKey.localeCompare(b.mesKey))
      .slice(-12);
  }, [historial, selectedBus]);

  // Encontrar mes más vendido (del historial completo o filtrado por bus)
  const mesMasVendido = useMemo(() => {
    if (ventasPorMes.length === 0) return 'N/A';
    const maxVentas = Math.max(...ventasPorMes.map(m => m.ventas));
    const mes = ventasPorMes.find(m => m.ventas === maxVentas);
    return mes ? mes.mes : 'N/A';
  }, [ventasPorMes]);

  // Datos para gráfica de ventas por hora (filtrado por mes)
  const ventasPorHora = useMemo(() => {
    const horaCount: Record<string, number> = {};
    filteredHistorial.forEach(h => {
      if (h.horaSalida) {
        horaCount[h.horaSalida] = (horaCount[h.horaSalida] || 0) + 1;
      }
    });
    return Object.entries(horaCount)
      .map(([hora, ventas]) => ({ hora, ventas }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [filteredHistorial]);

  // Calcular estadísticas del filtro actual (mes seleccionado)
  const currentStats = useMemo(() => {
    const totalIngresos = filteredHistorial.reduce((sum, h) => sum + (h.precio || 0), 0);
    
    // Ruta más demandada
    const rutaCount: Record<string, number> = {};
    filteredHistorial.forEach(h => {
      rutaCount[h.paradaNombre] = (rutaCount[h.paradaNombre] || 0) + 1;
    });
    const rutaMasDemandada = Object.entries(rutaCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const rutaCount_value = Object.entries(rutaCount)
      .sort((a, b) => b[1] - a[1])[0]?.[1] || 0;

    // Hora más vendida
    const horaCount: Record<string, number> = {};
    filteredHistorial.forEach(h => {
      if (h.horaSalida) {
        horaCount[h.horaSalida] = (horaCount[h.horaSalida] || 0) + 1;
      }
    });
    const horaMasVendida = Object.entries(horaCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Métodos de pago
    const efectivo = filteredHistorial.filter(h => h.metodoPago === 'efectivo').length;
    const transferencia = filteredHistorial.filter(h => h.metodoPago === 'transferencia').length;

    return {
      totalIngresos,
      totalVentas: filteredHistorial.length,
      rutaMasDemandada,
      rutaCount: rutaCount_value,
      horaMasVendida,
      metodoPagoEfectivo: efectivo,
      metodoPagoTransferencia: transferencia
    };
  }, [filteredHistorial]);

  // Datos para gráfica de métodos de pago
  const metodosPagoData = [
    { name: 'Efectivo', value: currentStats.metodoPagoEfectivo, fill: '#22c55e' },
    { name: 'Transferencia', value: currentStats.metodoPagoTransferencia, fill: '#940016' }
  ];

  // Datos para gráfica de ganancia por bus (filtrado por mes)
  const gananciaBusData = useMemo(() => {
    const busGanancia: Record<string, number> = {};
    filteredHistorial.forEach(h => {
      if (h.numeroBus) {
        busGanancia[h.numeroBus] = (busGanancia[h.numeroBus] || 0) + (h.precio || 0);
      }
    });
    return Object.entries(busGanancia)
      .map(([bus, ganancia]) => ({ bus, ganancia }))
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 10);
  }, [filteredHistorial]);

  // Función para generar reporte mensual completo
  const generarReporteMensual = async () => {
    setGeneratingReport(true);
    try {
      const mesLabel = selectedMonth === 'current' 
        ? getMonthName(getCurrentMonth())
        : selectedMonth === 'all'
        ? 'Histórico Completo'
        : getMonthName(selectedMonth);

      const reportData = {
        fecha: new Date().toLocaleDateString('es-EC'),
        mes: mesLabel,
        filtro: selectedBus === 'all' ? 'Todos los buses' : `Bus ${selectedBus}`,
        stats: currentStats,
        ventasPorMes,
        rutasData,
        ventasPorHora,
        gananciaBusData,
        historial: filteredHistorial
      };

      // Generar PDF
      ReportService.generarReporteCompleto(reportData);
      
      toast({
        title: 'Reporte generado',
        description: `Reporte de ${mesLabel} descargado exitosamente`,
      });
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        variant: 'destructive'
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Función para generar reporte por bus específico (del mes seleccionado)
  const generarReportePorBus = async (busNumero: string) => {
    setGeneratingReport(true);
    try {
      // Filtrar por bus Y mes
      let busHistorial = historial.filter(h => h.numeroBus === busNumero);
      
      if (selectedMonth !== 'all') {
        const targetMonth = selectedMonth === 'current' ? getCurrentMonth() : selectedMonth;
        busHistorial = busHistorial.filter(h => {
          if (!h.fechaSalida) return false;
          const yearMonth = h.fechaSalida.substring(0, 7);
          return yearMonth === targetMonth;
        });
      }

      const busData = buses.find(b => b.numero === busNumero);
      
      const mesLabel = selectedMonth === 'current' 
        ? getMonthName(getCurrentMonth())
        : selectedMonth === 'all'
        ? 'Histórico'
        : getMonthName(selectedMonth);

      const reportData = {
        bus: busNumero,
        placa: busData?.ruta || 'N/A',
        chofer: busData?.chofer || 'N/A',
        mes: mesLabel,
        totalVentas: busHistorial.length,
        totalIngresos: busHistorial.reduce((sum, h) => sum + (h.precio || 0), 0),
        historial: busHistorial
      };

      // Generar PDF
      ReportService.generarReportePorBus(reportData);
      
      toast({
        title: 'Reporte generado',
        description: `Reporte del Bus ${busNumero} - ${mesLabel} descargado exitosamente`,
      });
    } catch (error) {
      console.error('Error al generar reporte por bus:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte del bus',
        variant: 'destructive'
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Etiqueta del período seleccionado
  const periodoLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'Histórico Completo';
    if (selectedMonth === 'current') return getMonthName(getCurrentMonth());
    return getMonthName(selectedMonth);
  }, [selectedMonth]);

  return (
    <MainLayout>
      <PageHeader
        title="Estadísticas"
        description={`Análisis detallado - ${periodoLabel}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {/* Filtro de mes */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Mes Actual
                  </div>
                </SelectItem>
                <SelectItem value="all">Histórico Completo</SelectItem>
                {mesesDisponibles.map(mes => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de bus */}
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por bus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Todos los buses
                  </div>
                </SelectItem>
                {buses.map(bus => (
                  <SelectItem key={bus.id} value={bus.numero}>
                    Bus {bus.numero} - {bus.ruta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button 
              size="sm"
              onClick={generarReporteMensual}
              disabled={generatingReport}
              className="bg-[#940016] hover:bg-[#B8001F]"
            >
              <Download className="mr-2 h-4 w-4" />
              {generatingReport ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
        }
      />

      {/* Badge informativo del período */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#940016]/10 to-[#940016]/5 border border-[#940016]/20 rounded-lg">
          <Filter className="h-4 w-4 text-[#940016]" />
          <span className="text-sm font-medium">
            Mostrando datos de: <span className="font-bold text-[#940016]">{periodoLabel}</span>
            {selectedBus !== 'all' && ` - Bus ${selectedBus}`}
          </span>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-gradient-to-br from-success/10 to-success/5 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ingresos {selectedMonth === 'current' ? 'del Mes' : selectedMonth === 'all' ? 'Totales' : 'del Período'}
              </p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(currentStats.totalIngresos)}</p>
              <p className="text-xs text-muted-foreground mt-1">{currentStats.totalVentas} transacciones</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ruta Más Demandada</p>
              <p className="text-lg font-bold mt-1 truncate">{currentStats.rutaMasDemandada}</p>
              <p className="text-xs text-muted-foreground mt-1">{currentStats.rutaCount} viajes</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-[#940016]/10 to-[#940016]/5 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mes Más Vendido (Histórico)</p>
              <p className="text-lg font-bold mt-1">{mesMasVendido}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#940016]/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#940016]" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-accent/10 to-accent/5 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hora Más Vendida</p>
              <p className="text-lg font-bold mt-1">{currentStats.horaMasVendida}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas de ventas por mes y hora */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Ventas e ingresos por MES (histórico) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#940016]" />
              Evolución Mensual (Histórico)
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasPorMes}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c0094" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2c0094" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'ingresos') return [formatCurrency(value), 'Ingresos'];
                    return [value, 'Boletos'];
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#000f94" 
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                  name="ventas"
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorIngresos)" 
                  name="ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por hora (del período seleccionado) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Ventas por Hora ({periodoLabel})
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
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#940016]" />
            Rutas Más Demandadas ({periodoLabel})
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
                <Bar dataKey="value" fill="#0f0094" radius={[0, 4, 4, 0]} name="Viajes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-success" />
            Métodos de Pago ({periodoLabel})
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
              <span className="font-medium">{currentStats.metodoPagoEfectivo} Efectivo</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#940016]" />
              <span className="font-medium">{currentStats.metodoPagoTransferencia} Transferencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ganancia por bus con botones de reporte individual */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bus className="h-5 w-5 text-[#940016]" />
            Ganancia por Bus ({periodoLabel})
          </h3>
          <p className="text-sm text-muted-foreground">
            Haz clic en una barra para generar reporte individual
          </p>
        </div>
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
                fill="#007694" 
                radius={[4, 4, 0, 0]}
                name="Ganancia"
                onClick={(data) => generarReportePorBus(data.bus)}
                cursor="pointer"
              >
                {gananciaBusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Lista de botones para reportes individuales */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {gananciaBusData.map((busData, index) => (
            <Button
              key={busData.bus}
              variant="outline"
              size="sm"
              onClick={() => generarReportePorBus(busData.bus)}
              disabled={generatingReport}
              className="flex items-center justify-between gap-2 hover:bg-[#940016]/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">Bus {busData.bus}</span>
              </div>
              <FileText className="h-3 w-3" />
            </Button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default EstadisticasPage;