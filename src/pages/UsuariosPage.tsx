// Página de usuarios (solo admin)
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { getUsuariosRegistrados, updateUsuarioRol, subscribeToUsuarios } from '@/services/firebaseCollections';
import { formatDateTime } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Shield, User, Truck, Edit2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { UsuarioRegistrado } from '@/types';

const UsuariosPage: React.FC = () => {
  const [users, setUsers] = useState<UsuarioRegistrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UsuarioRegistrado | null>(null);
  const [newRole, setNewRole] = useState<'administrador'|'gerente' | 'conductor' | 'usuario'>('usuario');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Cargar usuarios inicialmente
    fetchUsers();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToUsuarios((usuarios) => {
      setUsers(usuarios);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsuariosRegistrados();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (user: UsuarioRegistrado) => {
    setEditingUser(user);
    setNewRole(user.rol as 'administrador' | 'conductor' | 'usuario'|'gerente');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setNewRole('usuario');
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole || !editingUser.id) return;

    try {
      setUpdating(true);
      await updateUsuarioRol(editingUser.id, newRole);
      
      toast.success('Rol actualizado correctamente');
      handleCloseDialog();
      // Los datos se actualizarán automáticamente por la suscripción
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'gerente':
        return {
          variant: 'default' as const,
          icon: Shield,
          label: 'Gerente',
          color: 'bg-green-500/10 text-green-500'
        };
      case 'administrador':
        return {
          variant: 'default' as const,
          icon: Shield,
          label: 'Administrador',
          color: 'bg-primary/10 text-primary'
        };
      case 'conductor':
        return {
          variant: 'secondary' as const,
          icon: Truck,
          label: 'Conductor',
          color: 'bg-blue-500/10 text-blue-500'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: User,
          label: 'Usuario',
          color: 'bg-muted text-muted-foreground'
        };
    }
  };

  // Tipo combinado para la tabla
  type UserWithId = UsuarioRegistrado & { id: string };
  
  // Mapear usuarios para agregar id si no existe
  const usersWithId: UserWithId[] = users.map(u => ({ 
    ...u, 
    id: u.id || u.uid || '' 
  }));

  // Columnas de la tabla
  const columns: Array<{
    key: string;
    header: string;
    render?: (item: UserWithId) => React.ReactNode;
  }> = [
    { 
      key: 'user', 
      header: 'Usuario',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {item.nombre?.charAt(0)?.toUpperCase() || 
               item.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.nombre || 'Sin nombre'}</p>
            <p className="text-sm text-muted-foreground">{item.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'rol', 
      header: 'Rol',
      render: (item) => {
        const roleBadge = getRoleBadge(item.rol);
        const Icon = roleBadge.icon;
        return (
          <Badge 
            variant={roleBadge.variant}
            className="gap-1.5"
          >
            <Icon className="h-3 w-3" />
            {roleBadge.label}
          </Badge>
        );
      }
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (item) => (
        <Badge 
          variant={item.estado === 'conectado' ? 'default' : 'secondary'}
          className="gap-1.5"
        >
          <div className={`h-2 w-2 rounded-full ${
            item.estado === 'conectado' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {item.estado === 'conectado' ? 'Conectado' : 'Desconectado'}
        </Badge>
      )
    },
    { 
      key: 'fechaRegistro', 
      header: 'Fecha Registro',
      render: (item) => {
        if (!item.createdAt) return <span className="text-muted-foreground">-</span>;
        // Si es un Timestamp de Firestore
        const date = item.createdAt instanceof Date 
          ? item.createdAt 
          : (item.createdAt as any)?.toDate?.();
        return date ? formatDateTime(date) : '-';
      }
    },
    { 
      key: 'ultimoAcceso', 
      header: 'Último Acceso',
      render: (item) => {
        if (!item.ultimaDesconexion) return <span className="text-muted-foreground">-</span>;
        const date = item.ultimaDesconexion instanceof Date 
          ? item.ultimaDesconexion
          : (item.ultimaDesconexion as any)?.toDate?.();
        return date ? formatDateTime(date) : '-';
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenEditDialog(item)}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Editar Rol
        </Button>
      )
    }
  ];

  // Calcular estadísticas
  const adminCount = users.filter(u => u.rol === 'administrador').length;
  const conductorCount = users.filter(u => u.rol === 'conductor').length;
  const userCount = users.filter(u => u.rol === 'usuario').length;
  
  const conectadosCount = users.filter(u => u.estado === 'conectado').length;

  return (
    <MainLayout>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios y sus roles en el sistema"
      />

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conductorCount}</p>
              <p className="text-sm text-muted-foreground">Conductores</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <User className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-sm text-muted-foreground">Usuarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mb-6 p-4 rounded-lg bg-muted/50 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm text-muted-foreground">
          {conectadosCount} usuario{conectadosCount !== 1 ? 's' : ''} conectado{conectadosCount !== 1 ? 's' : ''} ahora
        </span>
      </div>

      {/* Tabla de usuarios */}
      <DataTable
        columns={columns}
        data={usersWithId}
        loading={loading}
        emptyMessage="No hay usuarios registrados en el sistema"
      />

      {/* Dialog para editar rol */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambia el rol del usuario {editingUser?.nombre || editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {editingUser?.nombre?.charAt(0)?.toUpperCase() || 
                     editingUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingUser?.nombre || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">{editingUser?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar Rol</label>
                <Select 
                  value={newRole} 
                  onValueChange={(value) => setNewRole(value as 'administrador' | 'conductor' | 'usuario'|'gerente')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Usuario</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="conductor">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Conductor</span>
                      </div>
                     
                    </SelectItem>
                    <SelectItem value="administrador">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Administrador</span>
                      </div>
                    </SelectItem>

                      <SelectItem value="gerente">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Gerente</span>
                      </div>
                      </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newRole === 'administrador' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-500">Advertencia</p>
                    <p className="text-muted-foreground mt-1">
                      Los administradores tienen acceso completo al sistema. 
                      Asegúrate de asignar este rol solo a usuarios de confianza.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={updating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={updating || newRole === editingUser?.rol}
            >
              {updating ? 'Actualizando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UsuariosPage;