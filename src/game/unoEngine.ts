export type CardColor = 'red' | 'yellow' | 'green' | 'blue' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4';

export interface UnoCard {
  id: string;
  color: CardColor;
  type: CardType;
  value: string;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  personality?: 'aggressive' | 'defensive' | 'strategic' | 'fast';
  cards: UnoCard[];
  saidUno: boolean;
  unoDeadline?: number;
}

export interface GameRules {
  stackDrawCards: boolean;
  sevenZeroRule: boolean;
  jumpInRule: boolean;
  drawToMatch: boolean;
  unoGracePeriodMs: number;
  turnTimeLimitSeconds: number;
  botDifficulty: 'easy' | 'medium' | 'hard';
}

export const DEFAULT_RULES: GameRules = {
  stackDrawCards: true,
  sevenZeroRule: true,
  jumpInRule: false,
  drawToMatch: false,
  unoGracePeriodMs: 2500,
  turnTimeLimitSeconds: 15,
  botDifficulty: 'medium',
};

export interface GameState {
  id: string;
  deck: UnoCard[];
  discardPile: UnoCard[];
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: CardColor;
  pendingDraw: number;
  pendingDrawType: 'draw2' | 'draw4' | null;
  turnStartedAt: number;
  status: 'lobby' | 'playing' | 'color_picker' | 'swap_picker' | 'game_over';
  winner: Player | null;
  history: string[];
  rules: GameRules;
  pendingCardToPlay?: { card: UnoCard; playerId: string };
  lastActionMessage?: string;
}

export class UnoGameEngine {
  // Generate authoritative 108 card deck
  static generateDeck(): UnoCard[] {
    const deck: UnoCard[] = [];
    const colors: CardColor[] = ['red', 'yellow', 'green', 'blue'];

    for (const color of colors) {
      // One 0 per color
      deck.push({
        id: `${color}_0`,
        color,
        type: 'number',
        value: '0',
        score: 0,
      });

      // Two each of 1-9
      for (let n = 1; n <= 9; n++) {
        deck.push({
          id: `${color}_${n}_a`,
          color,
          type: 'number',
          value: `${n}`,
          score: n,
        });
        deck.push({
          id: `${color}_${n}_b`,
          color,
          type: 'number',
          value: `${n}`,
          score: n,
        });
      }

      // Two each of Action cards (Skip, Reverse, Draw Two)
      for (const action of ['skip', 'reverse', 'draw2'] as const) {
        deck.push({
          id: `${color}_${action}_a`,
          color,
          type: action,
          value: action,
          score: 20,
        });
        deck.push({
          id: `${color}_${action}_b`,
          color,
          type: action,
          value: action,
          score: 20,
        });
      }
    }

    // 4 Wild cards
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: `wild_${i}`,
        color: 'wild',
        type: 'wild',
        value: 'wild',
        score: 50,
      });
    }

    // 4 Wild Draw Four cards
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: `wild_draw4_${i}`,
        color: 'wild',
        type: 'draw4',
        value: 'draw4',
        score: 50,
      });
    }

    return UnoGameEngine.shuffle(deck);
  }

  static shuffle(cards: UnoCard[]): UnoCard[] {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Create initial game state
  static createGame(
    playerConfigs: Array<{ id: string; name: string; avatar: string; isBot: boolean; personality?: Player['personality'] }>,
    customRules: Partial<GameRules> = {}
  ): GameState {
    const rules: GameRules = { ...DEFAULT_RULES, ...customRules };
    let deck = UnoGameEngine.generateDeck();

    const players: Player[] = playerConfigs.map((p) => {
      const cards = deck.slice(0, 7);
      deck = deck.slice(7);
      return {
        ...p,
        cards,
        saidUno: false,
      };
    });

    // Pick top card that isn't a Wild Draw Four to start clean
    let topCardIndex = 0;
    while (topCardIndex < deck.length && deck[topCardIndex].type === 'draw4') {
      topCardIndex++;
    }
    const [topCard] = deck.splice(topCardIndex, 1);
    const discardPile = [topCard];
    const currentColor = topCard.color === 'wild' ? 'red' : topCard.color;

    return {
      id: `game_${Date.now()}`,
      deck,
      discardPile,
      players,
      currentPlayerIndex: 0,
      direction: 1,
      currentColor,
      pendingDraw: 0,
      pendingDrawType: null,
      turnStartedAt: Date.now(),
      status: 'playing',
      winner: null,
      history: [`Game started with ${topCard.value.toUpperCase()} (${currentColor.toUpperCase()})`],
      rules,
      lastActionMessage: 'Match initiated! Your turn.',
    };
  }

  // Check card playability
  static canPlayCard(
    card: UnoCard,
    topCard: UnoCard,
    currentColor: CardColor,
    pendingDraw: number,
    rules: GameRules
  ): boolean {
    // If pending draw (Stacking)
    if (pendingDraw > 0) {
      if (!rules.stackDrawCards) return false;
      if (topCard.type === 'draw2') {
        return card.type === 'draw2';
      }
      if (topCard.type === 'draw4') {
        return card.type === 'draw4';
      }
      return false;
    }

    // Wilds can always be played
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') {
      return true;
    }

    // Match active color
    if (card.color === currentColor) {
      return true;
    }

    // Match value or type (e.g. 7 on 7, skip on skip)
    if (card.value === topCard.value) {
      return true;
    }

    return false;
  }

  // Draw cards safely, reshuffling discard pile if empty
  static drawCards(
    deck: UnoCard[],
    discardPile: UnoCard[],
    count: number
  ): { drawn: UnoCard[]; remainingDeck: UnoCard[]; remainingDiscard: UnoCard[] } {
    let currentDeck = [...deck];
    let currentDiscard = [...discardPile];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length <= 1) {
          break; // No cards left to reshuffle
        }
        // Keep top card on discard pile, shuffle the rest into new deck
        const topDiscard = currentDiscard[currentDiscard.length - 1];
        const recyclable = currentDiscard.slice(0, currentDiscard.length - 1);
        currentDeck = UnoGameEngine.shuffle(recyclable);
        currentDiscard = [topDiscard];
      }
      if (currentDeck.length > 0) {
        drawn.push(currentDeck.shift()!);
      }
    }

    return {
      drawn,
      remainingDeck: currentDeck,
      remainingDiscard: currentDiscard,
    };
  }

  // Next player index
  static getNextPlayerIndex(currentIndex: number, direction: 1 | -1, totalPlayers: number, step = 1): number {
    return (currentIndex + direction * step + totalPlayers * 10) % totalPlayers;
  }

  // AI Decision Logic
  static selectBotCard(
    bot: Player,
    state: GameState
  ): { card: UnoCard | null; chosenColor: CardColor; swapTargetIndex?: number } {
    const topCard = state.discardPile[state.discardPile.length - 1];
    const playableCards = bot.cards.filter((c) =>
      UnoGameEngine.canPlayCard(c, topCard, state.currentColor, state.pendingDraw, state.rules)
    );

    if (playableCards.length === 0) {
      return { card: null, chosenColor: 'red' };
    }

    const personality = bot.personality || 'strategic';

    // Sort by priority based on personality
    playableCards.sort((a, b) => {
      if (personality === 'aggressive') {
        // Aggressive: plays +4, +2, Skip, Reverse first
        const weight = (c: UnoCard) => (c.type === 'draw4' ? 100 : c.type === 'draw2' ? 90 : c.type === 'skip' ? 80 : c.type === 'reverse' ? 70 : c.score);
        return weight(b) - weight(a);
      }
      if (personality === 'defensive') {
        // Defensive: keeps Wilds for emergencies, plays number cards first
        const weight = (c: UnoCard) => (c.type === 'wild' || c.type === 'draw4' ? 10 : 80 - c.score);
        return weight(b) - weight(a);
      }
      // Strategic: plays high value first, calculates dominant color in hand
      return b.score - a.score;
    });

    const chosenCard = playableCards[0];

    // Count color frequency in bot's hand to pick smartest wild color
    const colorCounts: Record<CardColor, number> = { red: 0, yellow: 0, green: 0, blue: 0, wild: 0 };
    bot.cards.forEach((c) => {
      if (c.color !== 'wild') colorCounts[c.color]++;
    });

    let bestColor: CardColor = 'red';
    let maxCount = -1;
    (['red', 'yellow', 'green', 'blue'] as CardColor[]).forEach((col) => {
      if (colorCounts[col] > maxCount) {
        maxCount = colorCounts[col];
        bestColor = col;
      }
    });

    // If 7-0 rule and card is 7, pick opponent with least cards
    let swapTargetIndex: number | undefined;
    if (state.rules.sevenZeroRule && chosenCard.value === '7') {
      let minCardCount = 999;
      let targetIdx = 0;
      state.players.forEach((p, idx) => {
        if (p.id !== bot.id && p.cards.length < minCardCount) {
          minCardCount = p.cards.length;
          targetIdx = idx;
        }
      });
      swapTargetIndex = targetIdx;
    }

    return {
      card: chosenCard,
      chosenColor: bestColor,
      swapTargetIndex,
    };
  }
}
