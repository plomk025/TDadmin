// Hook para datos en tiempo real de Firebase
import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToUsuarios,
  subscribeToBuses,
  subscribeToConductores,
  subscribeToEncomiendas,
  subscribeToHistorial,
  getUsuariosRegistrados,
  getBusesLaEsperanza,
  getBusesTulcan,
  getConductores,
  getEncomiendas,
  getHistorial,
  getLugaresSalida,
  getConfiguracion,
  calcularHistorialStats
} from '@/services/firebaseCollections';
import type { 
  UsuarioRegistrado, 
  Bus, 
  Conductor, 
  Encomienda, 
  Historial,
  LugarSalida,
  Configuracion,
  DashboardStats,
  HistorialStats
} from '@/types';

interface UseRealtimeDataReturn {
  usuarios: UsuarioRegistrado[];
  buses: Bus[];
  conductores: Conductor[];
  encomiendas: Encomienda[];
  historial: Historial[];
  lugaresSalida: LugarSalida[];
  configuracion: Configuracion | null;
  stats: DashboardStats;
  historialStats: HistorialStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useRealtimeData = (): UseRealtimeDataReturn => {
  const [usuarios, setUsuarios] = useState<UsuarioRegistrado[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [lugaresSalida, setLugaresSalida] = useState<LugarSalida[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcular estadísticas del dashboard
  const stats: DashboardStats = {
    usuariosConectados: usuarios.filter(u => u.estado === 'conectado').length,
    usuariosDesconectados: usuarios.filter(u => u.estado === 'desconectado').length,
    totalUsuarios: usuarios.length,
    busesActivos: buses.filter(b => b.activo).length,
    busesInactivos: buses.filter(b => !b.activo).length,
    conductoresActivos: conductores.filter(c => c.activo !== false).length, // Asume activo si no está definido
    encomiendas: {
      pendientes: encomiendas.filter(e => {
        const estado = e.estado?.toLowerCase() || '';
        return estado === 'pendiente';
      }).length,
      enTransito: encomiendas.filter(e => {
        const estado = e.estado?.toLowerCase() || '';
        return estado === 'en transito' || estado === 'en tránsito' || estado === 'en_transito';
      }).length,
      entregadas: encomiendas.filter(e => {
        const estado = e.estado?.toLowerCase() || '';
        return estado === 'entregado' || estado === 'entregada';
      }).length
    },
    ingresosTotales: historial.reduce((sum, h) => {
      const precio = typeof h.precio === 'string' ? parseFloat(h.precio) : (h.precio || 0);
      return sum + (isNaN(precio) ? 0 : precio);
    }, 0)
  };

  // Calcular estadísticas avanzadas del historial
  const historialStats: HistorialStats = (() => {
    try {
      // Usar la función del servicio si existe, sino calcular aquí
      if (typeof calcularHistorialStats === 'function') {
        return calcularHistorialStats(historial);
      }

      // Cálculo manual como fallback
      // Ruta más demandada
      const rutaCount: Record<string, number> = {};
      historial.forEach(h => {
        if (h.paradaNombre) {
          const ruta = h.paradaNombre;
          rutaCount[ruta] = (rutaCount[ruta] || 0) + 1;
        }
      });
      const rutasMasVendidas = Object.entries(rutaCount)
        .sort((a, b) => b[1] - a[1]);
      const rutaMasDemandada = rutasMasVendidas[0]?.[0] || 'N/A';
      const rutaCount_value = rutasMasVendidas[0]?.[1] || 0;

      // Día más vendido
      const diaCount: Record<string, number> = {};
      historial.forEach(h => {
        if (h.fechaSalida) {
          diaCount[h.fechaSalida] = (diaCount[h.fechaSalida] || 0) + 1;
        }
      });
      const diaMasVendido = Object.entries(diaCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Hora más vendida
      const horaCount: Record<string, number> = {};
      historial.forEach(h => {
        if (h.horaSalida) {
          horaCount[h.horaSalida] = (horaCount[h.horaSalida] || 0) + 1;
        }
      });
      const horaMasVendida = Object.entries(horaCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Métodos de pago
      let metodoPagoEfectivo = 0;
      let metodoPagoTransferencia = 0;
      historial.forEach(h => {
        const metodo = h.metodoPago?.toLowerCase() || '';
        if (metodo === 'efectivo') metodoPagoEfectivo++;
        if (metodo === 'transferencia') metodoPagoTransferencia++;
      });

      // Ganancia por bus
      const busGanancia: Record<string, number> = {};
      historial.forEach(h => {
        if (h.numeroBus) {
          const precio = typeof h.precio === 'string' ? parseFloat(h.precio) : (h.precio || 0);
          if (!isNaN(precio)) {
            busGanancia[h.numeroBus] = (busGanancia[h.numeroBus] || 0) + precio;
          }
        }
      });
      const gananciaPorBus = Object.entries(busGanancia)
        .map(([bus, ganancia]) => ({ bus, ganancia }))
        .sort((a, b) => b.ganancia - a.ganancia);

      return {
        rutaMasDemandada,
        rutaCount: rutaCount_value,
        diaMasVendido,
        horaMasVendida,
        metodoPagoEfectivo,
        metodoPagoTransferencia,
        gananciaPorBus,
        totalVentas: historial.length,
        promedioVentasDiarias: historial.length / (Object.keys(diaCount).length || 1)
      };
    } catch (err) {
      console.error('Error calculando estadísticas del historial:', err);
      return {
        rutaMasDemandada: 'N/A',
        rutaCount: 0,
        diaMasVendido: 'N/A',
        horaMasVendida: 'N/A',
        metodoPagoEfectivo: 0,
        metodoPagoTransferencia: 0,
        gananciaPorBus: [],
        totalVentas: 0,
        promedioVentasDiarias: 0
      };
    }
  })();

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        usuariosData,
        busesEsperanza,
        busesTulcan,
        conductoresData,
        encomiendasData,
        historialData,
        lugaresData,
        configData
      ] = await Promise.all([
        getUsuariosRegistrados(),
        getBusesLaEsperanza(),
        getBusesTulcan(),
        getConductores(),
        getEncomiendas(),
        getHistorial(),
        getLugaresSalida(),
        getConfiguracion()
      ]);

      setUsuarios(usuariosData);
      setBuses([...busesEsperanza, ...busesTulcan]);
      setConductores(conductoresData);
      setEncomiendas(encomiendasData);
      setHistorial(historialData);
      setLugaresSalida(lugaresData);
      setConfiguracion(configData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // Suscribirse a cambios en tiempo real
    const unsubUsuarios = subscribeToUsuarios(setUsuarios);
    const unsubBuses = subscribeToBuses(({ esperanza, tulcan }) => {
      setBuses([...esperanza, ...tulcan]);
    });
    const unsubConductores = subscribeToConductores(setConductores);
    const unsubEncomiendas = subscribeToEncomiendas(setEncomiendas);
    const unsubHistorial = subscribeToHistorial(setHistorial);

    return () => {
      unsubUsuarios();
      unsubBuses.forEach(unsub => unsub());
      unsubConductores();
      unsubEncomiendas();
      unsubHistorial();
    };
  }, [fetchInitialData]);

  return {
    usuarios,
    buses,
    conductores,
    encomiendas,
    historial,
    lugaresSalida,
    configuracion,
    stats,
    historialStats,
    loading,
    error,
    refresh: fetchInitialData
  };
};

export default useRealtimeData;