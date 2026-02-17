// services/firestoreService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/types';

// Nombre de la colección (debe coincidir con tu Firestore)
const USERS_COLLECTION = 'usuarios_registrados';

/**
 * Obtener todos los usuarios de la colección usuarios_registrado
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const rol = data.rol || 'usuario';
      // Asegurar que el rol sea uno de los valores válidos
      const validRol: 'administrador' | 'conductor' | 'usuario' = 
        ['administrador', 'conductor', 'usuario'].includes(rol) 
          ? rol as 'administrador' | 'conductor' | 'usuario'
          : 'usuario';
      
      users.push({
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || data.nombre || null,
        rol: validRol,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin || null,
        photoURL: data.photoURL || null,
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Obtener un usuario específico por UID
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const rol = data.rol || 'usuario';
      // Asegurar que el rol sea uno de los valores válidos
      const validRol: 'administrador' | 'conductor' | 'usuario' = 
        ['administrador', 'conductor', 'usuario'].includes(rol) 
          ? rol as 'administrador' | 'conductor' | 'usuario'
          : 'usuario';
      
      return {
        uid: userSnap.id,
        email: data.email || '',
        displayName: data.displayName || data.nombre || null,
        rol: validRol,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin || null,
        photoURL: data.photoURL || null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Actualizar el rol de un usuario
 */
export const updateUserRole = async (
  uid: string, 
  newRole: 'administrador' | 'conductor' | 'usuario'
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      rol: newRole,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Crear o actualizar un usuario en Firestore
 */
export const createOrUpdateUser = async (
  uid: string, 
  userData: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Usuario existe, actualizar
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Usuario nuevo, crear
      await setDoc(userRef, {
        ...userData,
        uid,
        rol: userData.rol || 'usuario',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Actualizar último acceso del usuario
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

/**
 * Obtener usuarios por rol
 */
export const getUsersByRole = async (
  rol: 'administrador' | 'conductor' | 'usuario' |'gerente'
): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(
      usersRef, 
      where('rol', '==', rol),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const userRol = data.rol || 'usuario';
      // Asegurar que el rol sea uno de los valores válidos
      const validRol: 'administrador' | 'conductor' | 'usuario'|'gerente' = 
        ['administrador', 'conductor', 'usuario','gerente'].includes(userRol) 
          ? userRol as 'administrador' | 'conductor' | 'usuario'|'gerente'
          : 'usuario';
      
      users.push({
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || data.nombre || null,
        rol: validRol,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin || null,
        photoURL: data.photoURL || null,
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de usuarios
 */
export const getUserStats = async () => {
  try {
    const users = await getAllUsers();
    
    return {
      total: users.length,
      administradores: users.filter(u => u.rol === 'administrador').length,
      conductores: users.filter(u => u.rol === 'conductor').length,
      usuarios: users.filter(u => u.rol === 'usuario').length,
      gerente: users.filter(u => u.rol === 'gerente').length,
      activos: users.filter(u => {
        if (!u.lastLogin) return false;
        const lastLogin = u.lastLogin instanceof Date 
          ? u.lastLogin 
          : (u.lastLogin as any)?.toDate?.();
        if (!lastLogin) return false;
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLogin <= 30;
      }).length
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Eliminar un usuario (usar con precaución)
 */
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};