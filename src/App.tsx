import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { GameSystemSelectPage } from './pages/GameSystemSelectPage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { CampaignSelectPage } from './pages/CampaignSelectPage';
import { GamePage } from './pages/GamePage';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-950">
        <span className="text-parchment-100 font-crimson">Carregando...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
}

export function App() {
  const initialize = useAuthStore((s) => s.initialize);
  
  useEffect(() => {
    void initialize();
  }, [initialize]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/select-system"
          element={
            <ProtectedRoute>
              <GameSystemSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-character"
          element={
            <ProtectedRoute>
              <CharacterCreationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <CampaignSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
