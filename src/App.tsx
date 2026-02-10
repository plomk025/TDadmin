import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import UsuariosPage from "./pages/UsuariosPage";
import EncomiendasPage from "./pages/EncomiendasPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import BusesPage from "./pages/BusesPage";
import HistorialPage from "./pages/HistorialPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";

// Componente de ruta protegida
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute requireAdmin>
                  <UsuariosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/encomiendas" 
              element={
                <ProtectedRoute requireAdmin>
                  <EncomiendasPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buses" 
              element={
                <ProtectedRoute requireAdmin>
                  <BusesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historial" 
              element={
                <ProtectedRoute requireAdmin>
                  <HistorialPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estadisticas" 
              element={
                <ProtectedRoute requireAdmin>
                  <EstadisticasPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute requireAdmin>
                  <ConfiguracionPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
