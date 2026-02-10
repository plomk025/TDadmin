// Servicio para las colecciones específicas de Firebase
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
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

// Nombres de colecciones reales
const COLLECTIONS = {
  USUARIOS: 'usuarios_registrados',
  BUSES_ESPERANZA: 'buses_la_esperanza_salida',
  BUSES_TULCAN: 'buses_tulcan_salida',
  CONDUCTORES: 'conductores_registrados',
  ENCOMIENDAS: 'encomiendas_registradas',
  HISTORIAL: 'historial',
  LUGARES_SALIDA: 'lugares_salida',
  CONFIGURACION: 'configuracion'
} as const;

// ============================================
// USUARIOS REGISTRADOS
// ============================================

export const getUsuariosRegistrados = async (): Promise<UsuarioRegistrado[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USUARIOS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UsuarioRegistrado[];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

// Escuchar usuarios en tiempo real
export const subscribeToUsuarios = (
  callback: (usuarios: UsuarioRegistrado[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, COLLECTIONS.USUARIOS), (snapshot) => {
    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UsuarioRegistrado[];
    callback(usuarios);
  });
};

// Cambiar rol de usuario
export const updateUsuarioRol = async (
  userId: string, 
  nuevoRol: UsuarioRegistrado['rol']
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.USUARIOS, userId);
    await updateDoc(docRef, { rol: nuevoRol });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

// ============================================
// BUSES
// ============================================

export const getBusesLaEsperanza = async (): Promise<Bus[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BUSES_ESPERANZA));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      origen: 'la_esperanza' as const,
      ...doc.data()
    })) as Bus[];
  } catch (error) {
    console.error('Error al obtener buses La Esperanza:', error);
    return [];
  }
};

export const getBusesTulcan = async (): Promise<Bus[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BUSES_TULCAN));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      origen: 'tulcan' as const,
      ...doc.data()
    })) as Bus[];
  } catch (error) {
    console.error('Error al obtener buses Tulcán:', error);
    return [];
  }
};

// Escuchar buses en tiempo real
export const subscribeToBuses = (
  callback: (buses: { esperanza: Bus[]; tulcan: Bus[] }) => void
): Unsubscribe[] => {
  const unsubEsperanza = onSnapshot(collection(db, COLLECTIONS.BUSES_ESPERANZA), (snapshot) => {
    const esperanza = snapshot.docs.map(doc => ({
      id: doc.id,
      origen: 'la_esperanza' as const,
      ...doc.data()
    })) as Bus[];
    
    getDocs(collection(db, COLLECTIONS.BUSES_TULCAN)).then(tulcanSnapshot => {
      const tulcan = tulcanSnapshot.docs.map(doc => ({
        id: doc.id,
        origen: 'tulcan' as const,
        ...doc.data()
      })) as Bus[];
      callback({ esperanza, tulcan });
    });
  });

  const unsubTulcan = onSnapshot(collection(db, COLLECTIONS.BUSES_TULCAN), (snapshot) => {
    const tulcan = snapshot.docs.map(doc => ({
      id: doc.id,
      origen: 'tulcan' as const,
      ...doc.data()
    })) as Bus[];
    
    getDocs(collection(db, COLLECTIONS.BUSES_ESPERANZA)).then(esperanzaSnapshot => {
      const esperanza = esperanzaSnapshot.docs.map(doc => ({
        id: doc.id,
        origen: 'la_esperanza' as const,
        ...doc.data()
      })) as Bus[];
      callback({ esperanza, tulcan });
    });
  });

  return [unsubEsperanza, unsubTulcan];
};

// ============================================
// CONDUCTORES
// ============================================

export const getConductores = async (): Promise<Conductor[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CONDUCTORES));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conductor[];
  } catch (error) {
    console.error('Error al obtener conductores:', error);
    return [];
  }
};

export const subscribeToConductores = (
  callback: (conductores: Conductor[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, COLLECTIONS.CONDUCTORES), (snapshot) => {
    const conductores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conductor[];
    callback(conductores);
  });
};

// ============================================
// ENCOMIENDAS
// ============================================

export const getEncomiendas = async (): Promise<Encomienda[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ENCOMIENDAS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Encomienda[];
  } catch (error) {
    console.error('Error al obtener encomiendas:', error);
    return [];
  }
};

export const subscribeToEncomiendas = (
  callback: (encomiendas: Encomienda[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, COLLECTIONS.ENCOMIENDAS), (snapshot) => {
    const encomiendas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Encomienda[];
    callback(encomiendas);
  });
};

// ============================================
// HISTORIAL (el más importante)
// ============================================

export const getHistorial = async (): Promise<Historial[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.HISTORIAL));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Historial[];
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
};

export const subscribeToHistorial = (
  callback: (historial: Historial[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, COLLECTIONS.HISTORIAL), (snapshot) => {
    const historial = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Historial[];
    callback(historial);
  });
};

// Calcular estadísticas del historial
export const calcularHistorialStats = (historial: Historial[]): HistorialStats => {
  // Ruta más demandada
  const rutaCount: Record<string, number> = {};
  historial.forEach(h => {
    rutaCount[h.paradaNombre] = (rutaCount[h.paradaNombre] || 0) + 1;
  });
  const rutaMasDemandada = Object.entries(rutaCount)
    .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

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
  const metodoPagoEfectivo = historial.filter(h => h.metodoPago === 'efectivo').length;
  const metodoPagoTransferencia = historial.filter(h => h.metodoPago === 'transferencia').length;

  // Ganancia por bus
  const gananciaBus: Record<string, number> = {};
  historial.forEach(h => {
    gananciaBus[h.numeroBus] = (gananciaBus[h.numeroBus] || 0) + (h.precio || 0);
  });
  const gananciaPorBus = Object.entries(gananciaBus)
    .map(([bus, ganancia]) => ({ bus, ganancia }))
    .sort((a, b) => b.ganancia - a.ganancia);

  return {
    rutaMasDemandada: rutaMasDemandada[0] as string,
    rutaCount: rutaMasDemandada[1] as number,
    diaMasVendido,
    horaMasVendida,
    metodoPagoEfectivo,
    metodoPagoTransferencia,
    gananciaPorBus
  };
};

// ============================================
// LUGARES DE SALIDA
// ============================================

export const getLugaresSalida = async (): Promise<LugarSalida[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.LUGARES_SALIDA));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LugarSalida[];
  } catch (error) {
    console.error('Error al obtener lugares de salida:', error);
    return [];
  }
};

// ============================================
// CONFIGURACIÓN
// ============================================

export const getConfiguracion = async (): Promise<Configuracion | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CONFIGURACION));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Configuracion;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return null;
  }
};

export const updateConfiguracion = async (
  configId: string, 
  data: Partial<Configuracion>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIGURACION, configId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

// ============================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================

export const getDashboardStatsRealtime = async (): Promise<DashboardStats> => {
  try {
    const [usuarios, busesEsperanza, busesTulcan, conductores, encomiendas, historial] = 
      await Promise.all([
        getUsuariosRegistrados(),
        getBusesLaEsperanza(),
        getBusesTulcan(),
        getConductores(),
        getEncomiendas(),
        getHistorial()
      ]);

    const allBuses = [...busesEsperanza, ...busesTulcan];

    return {
      usuariosConectados: usuarios.filter(u => u.estado === 'conectado').length,
      usuariosDesconectados: usuarios.filter(u => u.estado === 'desconectado').length,
      totalUsuarios: usuarios.length,
      busesActivos: allBuses.filter(b => b.activo).length,
      busesInactivos: allBuses.filter(b => !b.activo).length,
      conductoresActivos: conductores.filter(c => c.activo).length,
      encomiendas: {
        pendientes: encomiendas.filter(e => e.estado === 'pendiente').length,
        enTransito: encomiendas.filter(e => e.estado === 'en_transito').length,
        entregadas: encomiendas.filter(e => e.estado === 'entregado').length
      },
      ingresosTotales: historial.reduce((sum, h) => sum + (h.precio || 0), 0)
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      usuariosConectados: 0,
      usuariosDesconectados: 0,
      totalUsuarios: 0,
      busesActivos: 0,
      busesInactivos: 0,
      conductoresActivos: 0,
      encomiendas: { pendientes: 0, enTransito: 0, entregadas: 0 },
      ingresosTotales: 0
    };
  }
};
