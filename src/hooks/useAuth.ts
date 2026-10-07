import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { onAuthStateChange } from '../services/supabase/authService';

/**
 * useAuth — syncs Supabase auth state changes with the auth store.
 * Returns convenient accessors and actions.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const storeSignOut = useAuthStore((s) => s.signOut);
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);

  const navigate = useNavigate();

  // Subscribe to Supabase auth state changes
  useEffect(() => {
    const { data: subscription } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        // User object is already set by signIn/signUp actions;
        // only update session here to avoid duplicate profile fetches.
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        navigate('/auth', { replace: true });
      }

      if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [setUser, setSession, navigate]);

  const signOut = async () => {
    await storeSignOut();
    // Navigation is handled by the SIGNED_OUT event above
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}
