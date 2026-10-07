# RPG Digital — As Cinzas de Valdris

Uma experiência completa de RPG de mesa digital, com narrativa interativa conduzida por IA, sistema de combate, criação de personagens, missões, inventário e persistência de campanha. O jogador é imerso em uma aventura de dark fantasy onde cada decisão molda a história.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS |
| Gerenciamento de Estado | Zustand |
| Roteamento | React Router DOM v7 |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Validação | Zod |
| Backend / Banco | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| IA / Narrador | GPT-6 Luna via Supabase Edge Function |

---

## Pré-requisitos

- **Node.js 18+** (recomendado: 20 LTS)
- **npm 9+**
- Conta gratuita no [supabase.com](https://supabase.com)
- Chave de API do modelo de IA (compatível com a API OpenAI)

---

## Como Configurar o Supabase

### 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login.
2. Clique em **New Project**.
3. Escolha um nome (ex: `rpg-digital`), defina uma senha forte para o banco e selecione a região mais próxima.
4. Aguarde o projeto ser provisionado (cerca de 2 minutos).

### 2. Copiar as credenciais

1. No painel do projeto, vá em **Settings → API**.
2. Copie a **Project URL** e a **anon public key**.
3. Cole esses valores no arquivo `.env` do projeto (veja a seção *Como Rodar Localmente*).

### 3. Aplicar as migrations

As migrations criam todas as tabelas, relacionamentos e políticas de segurança do banco.

1. No painel do Supabase, acesse **SQL Editor**.
2. Execute cada arquivo abaixo **em ordem**, um de cada vez:

```
supabase/migrations/001_initial_schema.sql   ← tabelas e estrutura
supabase/migrations/002_rls_policies.sql     ← Row Level Security
supabase/migrations/003_seed_data.sql        ← dados iniciais (campanha, itens, inimigos)
```

Para cada arquivo: abra o conteúdo, cole no editor SQL e clique em **Run**.

### 4. Criar a Edge Function

A Edge Function é o único ponto onde a chave da IA é usada. Ela nunca fica exposta no frontend.

Você precisa do [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:

```bash
npm install -g supabase
supabase login
```

Depois, dentro da pasta do projeto:

```bash
supabase functions deploy ai-narrator --project-ref SEU_PROJECT_REF
```

O `SEU_PROJECT_REF` está disponível em **Settings → General → Reference ID** no painel do Supabase.

### 5. Configurar variáveis de ambiente da Edge Function

No painel do Supabase, vá em **Settings → Edge Functions → Environment Variables** e adicione:

| Variável | Descrição | Exemplo |
|---|---|---|
| `OPENAI_API_KEY` | Chave da API da IA (GPT-6 Luna ou compatível) | `sk-...` |
| `AI_API_URL` | URL base da API (opcional, padrão OpenAI) | `https://api.openai.com/v1/chat/completions` |
| `AI_MODEL` | Modelo a utilizar (opcional) | `gpt-4o` |

---

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd rpg-digital

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com as credenciais copiadas do Supabase:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Estrutura do Projeto

```
rpg-digital/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.example
│
├── supabase/
│   ├── functions/
│   │   └── ai-narrator/        ← Edge Function segura (chave da IA fica aqui)
│   │       └── index.ts
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
│
└── src/
    ├── main.tsx                 ← Entrada da aplicação
    ├── App.tsx                  ← Roteamento principal
    ├── vite-env.d.ts
    │
    ├── types/
    │   └── index.ts             ← Todos os tipos TypeScript do projeto
    │
    ├── components/
    │   ├── ui/                  ← Componentes genéricos (Button, Card, Modal...)
    │   ├── game/                ← DiceRoller e componentes de mecânica
    │   ├── character/           ← CharacterSheet
    │   ├── combat/              ← Interface de combate
    │   ├── inventory/           ← Interface de inventário
    │   ├── dialogue/            ← Diálogos com NPCs
    │   ├── story/               ← NarrativeDisplay, ActionInput
    │   └── map/                 ← Mapa e exploração
    │
    ├── pages/
    │   ├── LandingPage.tsx      ← Página inicial
    │   ├── AuthPage.tsx         ← Login / Cadastro
    │   ├── CharacterCreationPage.tsx
    │   ├── CampaignSelectPage.tsx
    │   └── GamePage.tsx         ← Interface principal do jogo
    │
    ├── layouts/
    │   └── GameLayout.tsx       ← Layout da sessão de jogo
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useDice.ts
    │   └── useGame.ts
    │
    ├── services/
    │   ├── supabase/            ← authService, characterService, campaignService
    │   ├── ai/                  ← aiService (invoca a Edge Function)
    │   ├── game/                ← Serviços de estado do jogo
    │   └── dice/                ← Serviço de registro de rolagens
    │
    ├── store/
    │   ├── authStore.ts         ← Estado de autenticação (Zustand)
    │   └── gameStore.ts         ← Estado global do jogo (Zustand)
    │
    ├── game/                    ← Lógica de negócio pura (sem UI)
    │   ├── dice/
    │   │   └── diceEngine.ts    ← rollDice, rollAttribute, crypto.getRandomValues
    │   ├── combat/
    │   │   └── combatEngine.ts  ← playerAttack, enemyAttack, calculateInitiative
    │   ├── character/
    │   │   └── characterCreation.ts
    │   ├── narrative/
    │   │   └── aiPromptBuilder.ts ← buildSystemPrompt, buildActionMessage
    │   ├── inventory/
    │   ├── quests/
    │   └── skills/
    │
    ├── data/
    │   └── campaigns/
    │       └── cinzasDeValdris.ts ← Dados estáticos da campanha
    │
    └── utils/                   ← Funções auxiliares gerais
```

---

## Fluxo da IA: Separação entre Regras e Narrativa

Este é o princípio central do projeto. A IA **nunca calcula** resultados de jogo — ela apenas **narra** o que o sistema calculou.

### Fluxo completo de uma ação de combate

```
Jogador digita: "Ataco o goblin com minha espada"
         │
         ▼
┌─────────────────────────────┐
│   aiPromptBuilder.ts        │   A IA interpreta a intenção:
│   buildActionMessage()      │   ação: ataque_fisico
│                             │   atributo: força / arma: espada
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│   combatEngine.ts           │   O SISTEMA calcula tudo:
│   playerAttack()            │   D20 = 17 + mod força(+3) = 20
│   rollDice()                │   Defesa do goblin = 14 → ACERTO
│                             │   Dano: 1d6+3 = 8
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│   aiService.ts              │   O resultado calculado é enviado
│   narrateAction()           │   para a IA via Edge Function:
│                             │   "Jogador acertou. Ataque: 20.
│                             │    Dano: 8. Vida goblin: 4."
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│   Edge Function             │   A IA apenas narra:
│   ai-narrator/index.ts      │   "Você avança e desfere um golpe
│                             │    preciso. A lâmina atinge o goblin
│                             │    no ombro..."
└─────────────────────────────┘
```

A resposta da IA é validada com **Zod** antes de ser usada, garantindo que o contrato de dados seja respeitado.

### Sistema de memória da campanha

A IA recebe um contexto estruturado a cada requisição, composto por:

- **Memória permanente** — eventos críticos que nunca devem ser esquecidos (NPC morto, artefato obtido, promessa feita)
- **Memória recente** — os últimos 10 acontecimentos da sessão
- **Resumo da campanha** — texto atualizado com o arco narrativo atual
- **Estado atual** — personagem, localização, missões ativas, NPCs presentes

Tudo isso é salvo nas tabelas `campaign_memories` e `campaign_decisions` no Supabase.

---

## Segurança

### Por que a chave da IA fica na Edge Function?

A chave de API da IA é um segredo que dá acesso irrestrito ao serviço. Se fosse colocada no código React, ela estaria visível para qualquer usuário que inspecionasse o bundle JavaScript.

A arquitetura adotada resolve isso:

```
Frontend (React)
    │
    │  Envia: systemPrompt + userMessage
    │  Autenticado via JWT do Supabase
    ▼
Edge Function (Deno — servidor Supabase)
    │
    │  Valida o JWT antes de qualquer ação
    │  Lê AI_API_KEY das variáveis de ambiente do servidor
    │  Faz a chamada à API da IA
    ▼
API da IA (GPT-6 Luna)
```

O frontend utiliza **apenas credenciais públicas** (anon key) e nunca tem acesso à chave da IA.

### Row Level Security (RLS)

Todas as tabelas do banco possuem políticas RLS ativas. Cada usuário acessa exclusivamente seus próprios personagens, campanhas, inventário e histórico. As políticas são definidas em `supabase/migrations/002_rls_policies.sql`.

---

## Como Jogar

### Fluxo do jogador

```
/ (Landing Page)
    │  Clica em "Começar Aventura"
    ▼
/auth (Login / Cadastro)
    │  Cria conta ou faz login via Supabase Auth
    ▼
/create-character (Criação de Personagem)
    │  Escolhe nome, raça, classe, background e personalidade
    │  O sistema distribui atributos e calcula HP/mana/energia iniciais
    ▼
/campaigns (Seleção de Campanha)
    │  Escolhe "As Cinzas de Valdris" ou outra campanha disponível
    ▼
/game (Interface Principal do Jogo)
    │
    ├── Painel narrativo — exibe a narração da IA e o histórico
    ├── Campo de ação — o jogador descreve o que quer fazer
    ├── Ficha do personagem — atributos, HP, mana, nível, XP
    ├── Rolagem de dados — d4, d6, d8, d10, d12, d20, d100
    ├── Inventário — itens, equipamentos, uso de poções
    └── Missões ativas — objetivos e progresso
```

A campanha é salva automaticamente no Supabase a cada ação relevante. O jogador pode sair e retomar exatamente de onde parou.

---

## Variáveis de Ambiente

### Frontend — arquivo `.env`

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL do projeto Supabase (ex: `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Chave pública anon do Supabase |

> Somente variáveis prefixadas com `VITE_` são expostas ao bundle React. Nunca coloque a service role key ou a chave da IA aqui.

### Edge Function — configuradas no painel do Supabase

| Variável | Obrigatória | Descrição |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Chave da API da IA (GPT-6 Luna ou modelo compatível) |
| `AI_API_URL` | ➖ | URL da API (padrão: `https://api.openai.com/v1/chat/completions`) |
| `AI_MODEL` | ➖ | Identificador do modelo (padrão: `gpt-4o`) |

> As variáveis da Edge Function ficam armazenadas nos servidores do Supabase e nunca chegam ao cliente.

---

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (http://localhost:5173)
npm run build    # Build de produção (TypeScript + Vite)
npm run preview  # Preview do build de produção
```

---

## Licença

Projeto privado — todos os direitos reservados.
