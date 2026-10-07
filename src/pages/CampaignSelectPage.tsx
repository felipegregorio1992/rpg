import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { getCampaigns, startCampaign } from '../services/supabase/campaignService';
import { getCharacters } from '../services/supabase/characterService';
import type { Campaign, Character } from '../types';

export function CampaignSelectPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const initGame = useGameStore((s) => s.initGame);
  const setCampaignPlayerId = useGameStore((s) => s._setCampaignPlayerId);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [campaignsResult, charactersResult] = await Promise.all([
          getCampaigns(),
          getCharacters(user.id),
        ]);

        if (campaignsResult.error) {
          setError(campaignsResult.error);
          return;
        }

        if (charactersResult.error) {
          setError(charactersResult.error);
          return;
        }

        setCampaigns(campaignsResult.data ?? []);
        setCharacters(charactersResult.data ?? []);

        // Auto-select first character if available
        if (charactersResult.data && charactersResult.data.length > 0) {
          setSelectedCharacterId(charactersResult.data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [user]);

  const handleStartCampaign = async (campaignId: string) => {
    if (!user || !selectedCharacterId) {
      setError('Selecione um personagem primeiro');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const { data: campaignPlayer, error: startError } = await startCampaign(
        campaignId,
        selectedCharacterId,
        user.id,
      );

      if (startError || !campaignPlayer) {
        setError(startError ?? 'Falha ao iniciar campanha');
        return;
      }

      // Initialize game state
      setCampaignPlayerId(campaignPlayer.id);
      await initGame(campaignPlayer.id, selectedCharacterId, campaignId);

      // Navigate to game page
      navigate('/game');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <h2 className="font-cinzel text-2xl text-ember-400 mb-4">
            Nenhum Personagem Encontrado
          </h2>
          <p className="font-crimson text-parchment-200/80 mb-6">
            Você precisa criar um personagem antes de iniciar uma campanha.
          </p>
          <Button onClick={() => navigate('/create-character')}>
            Criar Personagem
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-4xl font-bold text-ember-400 tracking-wider mb-2">
            Escolha sua Campanha
          </h1>
          <p className="font-crimson text-parchment-200/60">
            Selecione um personagem e uma aventura
          </p>
        </div>

        {/* Character selection */}
        <div className="mb-8">
          <h2 className="font-cinzel text-xl text-parchment-100 mb-4">
            Seus Personagens
          </h2>
          <div className="flex flex-wrap gap-3">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacterId(char.id)}
                className={`px-5 py-3 rounded-sm font-crimson transition-all ${
                  selectedCharacterId === char.id
                    ? 'bg-ember-600 text-parchment-50 border border-ember-400/40 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-stone-900 text-parchment-200 border border-stone-800 hover:border-stone-700'
                }`}
              >
                <p className="font-semibold">{char.name}</p>
                <p className="text-xs opacity-80">
                  Nível {char.level} {char.race} {char.class}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        <div>
          <h2 className="font-cinzel text-xl text-parchment-100 mb-4">
            Campanhas Disponíveis
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-blood-700/20 border border-blood-500/40 rounded text-sm font-crimson text-blood-500">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="border-stone-800 hover:border-ember-600/40 transition-all"
              >
                {/* Campaign image placeholder */}
                <div
                  className="h-48 -mx-4 -mt-4 mb-4 rounded-t-sm bg-gradient-to-br from-stone-800 to-blood-700/20
                             flex items-center justify-center"
                >
                  <p className="font-cinzel text-6xl text-ember-600/30">⟡</p>
                </div>

                <h3 className="font-cinzel text-2xl font-semibold text-ember-400 mb-3">
                  {campaign.title}
                </h3>

                <p className="font-crimson text-sm text-parchment-200/80 leading-relaxed mb-6">
                  {campaign.description}
                </p>

                <Button
                  onClick={() => handleStartCampaign(campaign.id)}
                  disabled={!selectedCharacterId || isStarting}
                  loading={isStarting}
                  className="w-full"
                >
                  Iniciar Campanha
                </Button>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <Card className="text-center">
              <p className="font-crimson text-parchment-200/60">
                Nenhuma campanha disponível no momento.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
