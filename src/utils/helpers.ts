// Utilidades generales
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear fecha
export const formatDate = (date: Date | undefined): string => {
  if (!date) return '-';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date instanceof Date ? date : new Date(date));
};

// Formatear fecha y hora
export const formatDateTime = (date: Date | undefined): string => {
  if (!date) return '-';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date instanceof Date ? date : new Date(date));
};

// Formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

// Obtener color de estado de boleto
export const getBoletoStatusColor = (estado: string): string => {
  const colors: Record<string, string> = {
    reservado: 'bg-warning/10 text-warning border-warning/20',
    pagado: 'bg-success/10 text-success border-success/20',
    cancelado: 'bg-destructive/10 text-destructive border-destructive/20',
    usado: 'bg-muted text-muted-foreground border-muted'
  };
  return colors[estado] || 'bg-muted text-muted-foreground';
};

// Obtener color de estado de encomienda
export const getEncomiendaStatusColor = (estado: string): string => {
  const colors: Record<string, string> = {
    recibido: 'bg-primary/10 text-primary border-primary/20',
    en_transito: 'bg-warning/10 text-warning border-warning/20',
    entregado: 'bg-success/10 text-success border-success/20',
    devuelto: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  return colors[estado] || 'bg-muted text-muted-foreground';
};

// Capitalizar texto
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Generar ID único simple
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
