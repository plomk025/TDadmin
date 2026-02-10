import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthResult {
  user: User | null;
  error: string | null;
}

// Iniciar sesión con email y contraseña
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    let errorMessage = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuario deshabilitado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciales inválidas';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Registrar nuevo usuario con email y contraseña
export const signUp = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<AuthResult> => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar perfil con nombre
    await updateProfile(user, { displayName });

    // Crear documento en Firestore
    await setDoc(doc(db, 'usuarios_registrados', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      rol: 'usuario', // Por defecto, rol usuario
      fechaCreacion: serverTimestamp(),
      activo: true
    });

    return { user, error: null };
  } catch (error: any) {
    let errorMessage = 'Error al registrarse';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'El correo ya está registrado';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operación no permitida';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Iniciar sesión con Google
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    
    // Configuraciones opcionales del provider
    provider.setCustomParameters({
      prompt: 'select_account' // Forzar selección de cuenta
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const userDocRef = doc(db, 'usuarios_registrados', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Si es un nuevo usuario, crear documento en Firestore
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        rol: 'usuario', // Por defecto, rol usuario
        fechaCreacion: serverTimestamp(),
        activo: true,
        proveedor: 'google'
      });
    }

    return { user, error: null };
  } catch (error: any) {
    let errorMessage = 'Error al iniciar sesión con Google';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Ventana de inicio de sesión cerrada';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Ventana emergente bloqueada. Permite ventanas emergentes para este sitio';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Solicitud cancelada';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'Ya existe una cuenta con este correo usando otro método';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Cerrar sesión
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};