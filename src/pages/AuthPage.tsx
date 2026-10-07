import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const validate = (): boolean => {
    setError(null);

    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (mode === 'register') {
      if (username.trim().length < 3) {
        setError('Nome de usuário deve ter pelo menos 3 caracteres');
        return false;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await signUp(email, password, username.trim());
        if (signUpError) {
          setError(signUpError);
          return;
        }
        // Auto-redirect after successful registration
        navigate('/select-system');
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
          return;
        }
        // Redirect to campaigns page after login
        navigate('/campaigns');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-stone-950 flex items-center justify-center p-6">
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-blood-700/10"
        aria-hidden="true"
      />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="text-ember-600 text-5xl mb-4" aria-hidden="true">
            ⟡
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-ember-400 tracking-wider mb-2">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="font-crimson text-sm text-parchment-200/60">
            {mode === 'login'
              ? 'Retorne à sua aventura'
              : 'Comece sua jornada em Valdris'}
          </p>
        </div>

        {/* Form card */}
        <div
          className="bg-stone-900 border border-stone-800 rounded-sm p-8
                     shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.08)]"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username (register only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="username"
                  className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
                >
                  Nome de Usuário
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de aventureiro"
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700/60
                           text-parchment-100 font-crimson rounded-sm
                           focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                           placeholder-parchment-200/25 transition-colors"
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700/60
                         text-parchment-100 font-crimson rounded-sm
                         focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                         placeholder-parchment-200/25 transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700/60
                         text-parchment-100 font-crimson rounded-sm
                         focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                         placeholder-parchment-200/25 transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Confirm password (register only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block font-cinzel text-sm text-parchment-200/80 mb-2 tracking-wide"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700/60
                           text-parchment-100 font-crimson rounded-sm
                           focus:outline-none focus:border-ember-600/60 focus:ring-1 focus:ring-ember-600/30
                           placeholder-parchment-200/25 transition-colors"
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="px-4 py-2 bg-blood-700/20 border border-blood-500/40 rounded text-sm font-crimson text-blood-500">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              disabled={isSubmitting}
              className="font-crimson text-sm text-parchment-200/60 hover:text-ember-400
                       transition-colors underline underline-offset-2
                       disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mode === 'login'
                ? 'Ainda não tem conta? Crie uma'
                : 'Já tem conta? Entre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
