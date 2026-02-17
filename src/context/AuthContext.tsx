// Contexto de autenticación para manejar el estado del usuario
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { signOut as authSignOut } from '@/services/authService';
import { doc, getDoc } from 'firebase/firestore';

// Tipo del usuario extendido
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  rol: string;
  activo: boolean;
  fechaCreacion?: any;
  proveedor?: string;
}

// Tipo del contexto
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si es administrador
  const isAdmin = user?.rol === 'gerente';

  // Función para obtener datos del usuario desde Firestore
  const getUserData = async (fbUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDocRef = doc(db, 'usuarios_registrados', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || userData.displayName,
          photoURL: fbUser.photoURL || userData.photoURL,
          rol: userData.rol || 'usuario',
          activo: userData.activo !== undefined ? userData.activo : true,
          fechaCreacion: userData.fechaCreacion,
          proveedor: userData.proveedor
        };
      }

      // Si no existe el documento, crear uno básico
      return {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        rol: 'usuario',
        activo: true
      };
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser);
      if (userData) {
        setUser(userData);
      }
    }
  };

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Obtener datos del usuario desde Firestore
        const userData = await getUserData(fbUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAdmin,
    signOut: handleSignOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;