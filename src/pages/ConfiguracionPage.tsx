// Página de configuración de versión de la app
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { updateConfiguracion } from '@/services/firebaseCollections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  Settings, 
  Download,
  AlertTriangle,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const ConfiguracionPage: React.FC = () => {
  const { configuracion, loading, refresh } = useRealtimeData();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    obligatorio: configuracion?.obligatorio || false,
    urlAPK: configuracion?.urlAPK || '',
    versionActual: configuracion?.versionActual || '',
    versionMinima: configuracion?.versionMinima || ''
  });

  React.useEffect(() => {
    if (configuracion) {
      setFormData({
        obligatorio: configuracion.obligatorio,
        urlAPK: configuracion.urlAPK,
        versionActual: configuracion.versionActual,
        versionMinima: configuracion.versionMinima
      });
    }
  }, [configuracion]);

  const handleSave = async () => {
    if (!configuracion?.id) {
      toast.error('No se encontró la configuración');
      return;
    }

    try {
      setSaving(true);
      await updateConfiguracion(configuracion.id, formData);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Configuración"
        description="Control de versiones de la aplicación móvil"
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

      {/* Estado actual */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versión Actual</p>
              <p className="text-lg font-bold">{configuracion?.versionActual || '-'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versión Mínima</p>
              <p className="text-lg font-bold">{configuracion?.versionMinima || '-'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${configuracion?.obligatorio ? 'bg-destructive/10' : 'bg-success/10'}`}>
              {configuracion?.obligatorio ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actualización</p>
              <p className="text-lg font-bold">
                {configuracion?.obligatorio ? 'Obligatoria' : 'Opcional'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Versión
          </CardTitle>
          <CardDescription>
            Configura la versión de la aplicación y el enlace de descarga
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Versión Actual */}
          <div className="space-y-2">
            <Label htmlFor="versionActual">Versión Actual</Label>
            <Input
              id="versionActual"
              placeholder="1.0.0"
              value={formData.versionActual}
              onChange={(e) => setFormData({ ...formData, versionActual: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              La versión más reciente disponible de la aplicación
            </p>
          </div>

          {/* Versión Mínima */}
          <div className="space-y-2">
            <Label htmlFor="versionMinima">Versión Mínima</Label>
            <Input
              id="versionMinima"
              placeholder="1.0.0"
              value={formData.versionMinima}
              onChange={(e) => setFormData({ ...formData, versionMinima: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              La versión mínima requerida para usar la aplicación
            </p>
          </div>

          {/* URL APK */}
          <div className="space-y-2">
            <Label htmlFor="urlAPK">URL de Descarga APK</Label>
            <div className="flex gap-2">
              <Input
                id="urlAPK"
                placeholder="https://ejemplo.com/app.apk"
                value={formData.urlAPK}
                onChange={(e) => setFormData({ ...formData, urlAPK: e.target.value })}
                className="flex-1"
              />
              {formData.urlAPK && (
                <Button variant="outline" size="icon" asChild>
                  <a href={formData.urlAPK} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enlace directo para descargar el archivo APK
            </p>
          </div>

          {/* Actualización Obligatoria */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="obligatorio" className="text-base">
                Actualización Obligatoria
              </Label>
              <p className="text-sm text-muted-foreground">
                Si está activo, los usuarios deben actualizar para usar la app
              </p>
            </div>
            <Switch
              id="obligatorio"
              checked={formData.obligatorio}
              onCheckedChange={(checked) => setFormData({ ...formData, obligatorio: checked })}
            />
          </div>

          {/* Botón guardar */}
          <Button 
            onClick={handleSave} 
            disabled={saving || !configuracion?.id}
            className="w-full"
          >
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default ConfiguracionPage;
