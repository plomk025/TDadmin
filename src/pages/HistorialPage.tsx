// Página del historial de ventas
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  Search,
  Filter,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Bus,
  MapPin
} from 'lucide-react';
import type { Historial } from '@/types';

const HistorialPage: React.FC = () => {
  const { historial, loading, refresh } = useRealtimeData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetodo, setFilterMetodo] = useState<string>('all');

  // Filtrar historial
  const filteredHistorial = historial.filter(h => {
    const matchesSearch = 
      h.paradaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.numeroBus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.fechaSalida?.includes(searchTerm);
    
    const matchesMetodo = filterMetodo === 'all' || h.metodoPago === filterMetodo;
    
    return matchesSearch && matchesMetodo;
  });

  // Columnas de la tabla
  const columns = [
    { 
      key: 'paradaNombre', 
      header: 'Destino',
      render: (item: Historial) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">{item.paradaNombre}</span>
        </div>
      )
    },
    { 
      key: 'fechaSalida', 
      header: 'Fecha',
      render: (item: Historial) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{item.fechaSalida}</span>
        </div>
      )
    },
    { 
      key: 'horaSalida', 
      header: 'Hora',
      render: (item: Historial) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{item.horaSalida}</span>
        </div>
      )
    },
    { 
      key: 'numeroBus', 
      header: 'Bus',
      render: (item: Historial) => (
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-primary" />
          <span className="font-mono">{item.numeroBus}</span>
        </div>
      )
    },
    { 
      key: 'metodoPago', 
      header: 'Método Pago',
      render: (item: Historial) => (
        <Badge 
          variant={item.metodoPago === 'efectivo' ? 'secondary' : 'default'}
          className="gap-1"
        >
          {item.metodoPago === 'efectivo' ? (
            <Banknote className="h-3 w-3" />
          ) : (
            <CreditCard className="h-3 w-3" />
          )}
          {item.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
        </Badge>
      )
    },
    { 
      key: 'precio', 
      header: 'Precio',
      render: (item: Historial) => (
        <span className="font-semibold text-success">{formatCurrency(item.precio)}</span>
      )
    }
  ];

  // Estadísticas rápidas
  const totalVentas = historial.length;
  const totalIngresos = historial.reduce((sum, h) => sum + (h.precio || 0), 0);
  const ventasEfectivo = historial.filter(h => h.metodoPago === 'efectivo').length;
  const ventasTransferencia = historial.filter(h => h.metodoPago === 'transferencia').length;

  return (
    <MainLayout>
      <PageHeader
        title="Historial de Ventas"
        description="Registro completo de todas las transacciones"
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

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalVentas}</p>
              <p className="text-xs text-muted-foreground">Total Ventas</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Banknote className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalIngresos)}</p>
              <p className="text-xs text-muted-foreground">Ingresos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Banknote className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold">{ventasEfectivo}</p>
              <p className="text-xs text-muted-foreground">Efectivo</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{ventasTransferencia}</p>
              <p className="text-xs text-muted-foreground">Transferencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por destino, bus o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterMetodo} onValueChange={setFilterMetodo}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Método pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={filteredHistorial}
        loading={loading}
        emptyMessage="No hay registros en el historial"
      />
    </MainLayout>
  );
};

export default HistorialPage;
