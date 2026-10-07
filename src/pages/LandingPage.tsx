import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-950 flex items-center justify-center">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-blood-700/20"
        style={{
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />

      {/* Subtle shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 50%)',
          animation: 'shimmer 6s ease-in-out infinite alternate',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Title */}
        <h1
          className="font-cinzel text-6xl md:text-8xl font-black tracking-wider text-parchment-50
                     drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]
                     mb-6 animate-fadeIn"
          style={{ textShadow: '0 0 40px rgba(245,158,11,0.5), 0 4px 8px rgba(0,0,0,0.9)' }}
        >
          As Cinzas de Valdris
        </h1>

        {/* Subtitle */}
        <p
          className="font-crimson text-xl md:text-2xl italic text-parchment-200/90
                     max-w-2xl mx-auto leading-relaxed mb-12 animate-fadeIn"
          style={{ animationDelay: '0.3s' }}
        >
          Uma vila fronteiriça à beira do caos. Uma torre que voltou a queimar após cinquenta anos.
          Um artefato que promete poder — e cobra um preço.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn"
          style={{ animationDelay: '0.6s' }}
        >
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/auth')}
            className="min-w-[200px]"
          >
            Iniciar Jornada
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="min-w-[200px]"
          >
            Continuar Aventura
          </Button>
        </div>

        {/* Atmospheric description */}
        <div
          className="mt-16 max-w-xl mx-auto animate-fadeIn"
          style={{ animationDelay: '0.9s' }}
        >
          <p className="font-crimson text-sm text-parchment-200/60 leading-relaxed">
            Conduza seu herói através das sombras. Converse com NPCs, explore ruínas antigas,
            enfrente inimigos corrompidos, tome decisões que alteram a história. Um Mestre de RPG
            com inteligência artificial narra cada passo da sua aventura.
          </p>
        </div>

        {/* Ornamental rune */}
        <div
          className="mt-12 text-ember-600/30 text-4xl animate-pulse"
          aria-hidden="true"
        >
          ⟡
        </div>
      </div>

      {/* CSS animations injected inline for simplicity */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            opacity: 0.15;
            transform: scale(1);
          }
          100% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
