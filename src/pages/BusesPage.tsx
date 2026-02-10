// Página de buses y conductores
import React from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bus, 
  RefreshCw, 
  MapPin,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Bus as BusType, Conductor } from '@/types';

const BusesPage: React.FC = () => {
  const { buses, conductores, stats, lugaresSalida, loading, refresh } = useRealtimeData();

  // Buses La Esperanza
  const busesEsperanza = buses.filter(b => b.origen === 'la_esperanza');
  const busesTulcan = buses.filter(b => b.origen === 'tulcan');

  // Columnas de buses
  const busColumns = [
    { 
      key: 'numero', 
      header: 'Número',
      render: (item: BusType) => (
        <span className="font-mono font-bold text-primary">{item.numero}</span>
      )
    },
    { 
      key: 'placa', 
      header: 'Placa',
      render: (item: BusType) => (
        <span className="font-medium">{item.ruta}</span>
      )
    },
    { 
      key: 'capacidad', 
      header: 'Capacidad',
      render: (item: BusType) => (
        <span>{item.capacidad} pasajeros</span>
      )
    },
    { 
      key: 'chofer', 
      header: 'Chofer',
      render: (item: BusType) => (
        <span className="text-muted-foreground">{item.chofer || '-'}</span>
      )
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (item: BusType) => (
        <Badge 
          variant={item.activo ? 'default' : 'secondary'}
          className={`gap-1 ${item.activo ? 'bg-success text-success-foreground' : ''}`}
        >
          {item.activo ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {item.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ];

  // Columnas de conductores
  const conductorColumns = [
    { 
      key: 'nombre', 
      header: 'Nombre',
      render: (item: Conductor) => (
        <span className="font-medium">{item.chofer}</span>
      )
    },
 
    { 
      key: 'capacidad', 
      header: 'Capacidad',
      render: (item: Conductor) => (
        <span>{item.capacidad|| '-'}</span>
      )
    },
    { 
      key: 'placa', 
      header: 'Placa',
      render: (item: Conductor) => (
        <span>{item.placa || '-'}</span>
      )
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (item: Conductor) => (
        <Badge 
          variant={item.activo ? 'default' : 'secondary'}
          className={`gap-1 ${item.activo ? 'bg-success text-success-foreground' : ''}`}
        >
          {item.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Buses y Conductores"
        description="Gestión de flota y personal"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Bus className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.busesActivos}</p>
              <p className="text-xs text-muted-foreground">Buses Activos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Bus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.busesInactivos}</p>
              <p className="text-xs text-muted-foreground">Buses Inactivos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.conductoresActivos}</p>
              <p className="text-xs text-muted-foreground">Conductores</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <MapPin className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold">{lugaresSalida.length}</p>
              <p className="text-xs text-muted-foreground">Lugares Salida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="esperanza" className="space-y-4">
        <TabsList>
          <TabsTrigger value="esperanza" className="gap-2">
            <Bus className="h-4 w-4" />
            La Esperanza ({busesEsperanza.length})
          </TabsTrigger>
          <TabsTrigger value="tulcan" className="gap-2">
            <Bus className="h-4 w-4" />
            Tulcán ({busesTulcan.length})
          </TabsTrigger>
          <TabsTrigger value="conductores" className="gap-2">
            <User className="h-4 w-4" />
            Conductores ({conductores.length})
          </TabsTrigger>
          <TabsTrigger value="lugares" className="gap-2">
            <MapPin className="h-4 w-4" />
            Lugares ({lugaresSalida.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="esperanza">
          <DataTable
            columns={busColumns}
            data={busesEsperanza}
            loading={loading}
            emptyMessage="No hay buses registrados en La Esperanza"
          />
        </TabsContent>

        <TabsContent value="tulcan">
          <DataTable
            columns={busColumns}
            data={busesTulcan}
            loading={loading}
            emptyMessage="No hay buses registrados en Tulcán"
          />
        </TabsContent>

        <TabsContent value="conductores">
          <DataTable
            columns={conductorColumns}
            data={conductores}
            loading={loading}
            emptyMessage="No hay conductores registrados"
          />
        </TabsContent>

        <TabsContent value="lugares">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lugaresSalida.map((lugar) => (
              <div 
                key={lugar.id} 
                className="rounded-xl border bg-card p-4 flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{lugar.lugar}</span>
              </div>
            ))}
            {lugaresSalida.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No hay lugares de salida registrados
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default BusesPage;
