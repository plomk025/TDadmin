// Tipos para el sistema de gestión de transporte

import { Timestamp } from 'firebase/firestore';

// Usuario registrado en Firebase
export interface UsuarioRegistrado {
  id?: string;
  uid?: string;
  nombre?: string;
  email: string;
  estado: 'conectado' | 'desconectado';
  rol: 'administrador' | 'usuario' | 'conductor';
  telefono?: string;
  fechaRegistro?: Timestamp | Date;
  ultimaDesconexion?: Timestamp | Date;
  createdAt?: Timestamp | Date;
  lastLogin?: Timestamp | Date;
  photoURL?: string | null;
  displayName?: string | null;
}

// Usuario del sistema de autenticación local
export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  rol: 'usuario' | 'administrador' | 'conductor';
  createdAt: Timestamp | Date;
  lastLogin?: Timestamp | Date | null;
  photoURL?: string | null;
  
}

// Bus (para buses_la_esperanza_salida y buses_tulcan_salida)
export interface Bus {
  id: string;
  numero: string;
  ruta: string;
  capacidad: number;
  chofer?: string;
  activo: boolean;
  origen: 'la_esperanza' | 'tulcan';
}

// Conductor registrado
export interface Conductor {
  id: string;
  chofer: string;
  placa: string;
  capacidad?: string;
  licencia?: string;
  activo: boolean;
}

// Encomienda registrada
export interface Encomienda {
  id: string;
  codigo_envio: string;
  estado: 'pendiente' | 'en_transito' | 'entregado';
  numero: string;
  remitente?: string;
  destinatario?: Destinatario; // 👈 objeto
  observaciones?: string;
  precio?: number;
  createdAt?: Timestamp | Date;
}

export interface Destinatario {
  nombre: string;
  cedula: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  correo?: string;
  referencia?: string;
}


// Historial de ventas (el más importante)
export interface Historial {
  id: string;
  paradaNombre: string; // Ruta más demandada
  fechaSalida: string; // Para calcular día más vendido
  horaSalida: string; // Hora más vendida
  metodoPago: 'efectivo' | 'transferencia';
  numeroBus: string;
  precio: number;
  pasajero?: string;
  asiento?: string;
}

// Lugar de salida
export interface LugarSalida {
  id: string;
  lugar: string;
  activo?: boolean;
}

// Configuración de versión de la app
export interface Configuracion {
  id: string;
  obligatorio: boolean;
  urlAPK: string;
  versionActual: string;
  versionMinima: string;
}

// Estadísticas del dashboard
export interface DashboardStats {
  usuariosConectados: number;
  usuariosDesconectados: number;
  totalUsuarios: number;
  busesActivos: number;
  busesInactivos: number;
  conductoresActivos: number;
  encomiendas: {
    pendientes: number;
    enTransito: number;
    entregadas: number;
  };
  ingresosTotales: number;
}

// Estadísticas de historial
export interface HistorialStats {
  rutaMasDemandada: string;
  rutaCount: number;
  diaMasVendido: string;
  horaMasVendida: string;
  metodoPagoEfectivo: number;
  metodoPagoTransferencia: number;
  gananciaPorBus: { bus: string; ganancia: number }[];
}

// Datos para gráficas
export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Boleto de viaje (compatibilidad)
export interface Boleto {
  id: string;
  usuarioId: string;
  rutaId: string;
  origen: string;
  destino: string;
  fechaViaje: Date;
  horaSalida: string;
  asiento: string;
  precio: number;
  estado: 'reservado' | 'pagado' | 'cancelado' | 'usado';
  pasajeroNombre: string;
  pasajeroDocumento: string;
  createdAt: Date;
}

// Ruta de viaje
export interface Ruta {
  id: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  duracionHoras: number;
  precio: number;
  horarios: string[];
  activa: boolean;
  createdAt: Date;
}