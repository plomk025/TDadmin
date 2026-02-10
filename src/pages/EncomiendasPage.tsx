// Página de encomiendas registradas
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Package, RefreshCw, Clock, Truck, CheckCircle } from 'lucide-react';
import type { Encomienda } from '@/types';

const EncomiendasPage: React.FC = () => {
  const { encomiendas, stats, loading, refresh } = useRealtimeData();
  const [filterEstado, setFilterEstado] = useState<string>('all');

  // Filtrar encomiendas
  const filteredEncomiendas = filterEstado === 'all' 
    ? encomiendas 
    : encomiendas.filter(e => e.estado === filterEstado);

  // Obtener color de estado
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { 
          variant: 'secondary' as const, 
          icon: Clock, 
          color: 'text-warning',
          bg: 'bg-warning/10'
        };
      case 'en_transito':
        return { 
          variant: 'default' as const, 
          icon: Truck, 
          color: 'text-primary',
          bg: 'bg-primary/10'
        };
      case 'entregado':
        return { 
          variant: 'outline' as const, 
          icon: CheckCircle, 
          color: 'text-success',
          bg: 'bg-success/10'
        };
      default:
        return { 
          variant: 'secondary' as const, 
          icon: Package, 
          color: 'text-muted-foreground',
          bg: 'bg-muted'
        };
    }
  };

  // Columnas de la tabla
  const columns = [
    { 
      key: 'codigo', 
      header: 'Código',
      render: (item: Encomienda) => (
        <span className="font-mono font-bold text-primary">{item.codigo_envio}</span>
      )
    },
    { 
      key: 'numero', 
      header: 'Bus asignado',
      render: (item: Encomienda) => (
        <span className="font-medium">{item.numero}</span>
      )
    },
    { 
      key: 'destino', 
      header: 'Destino',
      render: (item: Encomienda) => (
        <span className="text-muted-foreground">{item.destinatario.direccion || '-'}</span>
      )
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (item: Encomienda) => {
        const config = getEstadoConfig(item.estado);
        const Icon = config.icon;
        return (
          <Badge 
            variant={config.variant}
            className={`gap-1 ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            {item.estado === 'pendiente' && 'Pendiente'}
            {item.estado === 'en_transito' && 'En Tránsito'}
            {item.estado === 'entregado' && 'Entregado'}
          </Badge>
        );
      }
    }
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Encomiendas"
        description="Gestión de encomiendas registradas"
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

      {/* Resumen de estados */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div 
          className={`rounded-xl border bg-card p-4 cursor-pointer hover:border-warning/50 transition-colors ${filterEstado === 'pendiente' ? 'border-warning' : ''}`}
          onClick={() => setFilterEstado(filterEstado === 'pendiente' ? 'all' : 'pendiente')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.encomiendas.pendientes}</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors ${filterEstado === 'en_transito' ? 'border-primary' : ''}`}
          onClick={() => setFilterEstado(filterEstado === 'en_transito' ? 'all' : 'en_transito')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Tránsito</p>
                <p className="text-2xl font-bold">{stats.encomiendas.enTransito}</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`rounded-xl border bg-card p-4 cursor-pointer hover:border-success/50 transition-colors ${filterEstado === 'entregado' ? 'border-success' : ''}`}
          onClick={() => setFilterEstado(filterEstado === 'entregado' ? 'all' : 'entregado')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregadas</p>
                <p className="text-2xl font-bold">{stats.encomiendas.entregadas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-4 mb-6">
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_transito">En Tránsito</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={filteredEncomiendas}
        loading={loading}
        emptyMessage="No hay encomiendas registradas"
      />
    </MainLayout>
  );
};

export default EncomiendasPage;
