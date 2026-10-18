import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, HelpCircle, ArrowLeft, Maximize2, Minimize2, ShieldAlert, Users, Zap, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  UnoGameEngine,
  type GameState,
  type UnoCard,
  type CardColor,
  type Player,
  type GameRules,
  DEFAULT_RULES,
} from '../game/unoEngine';
import { GameTable3D } from '../components/Game/GameTable3D';
import { OpponentSeat3D } from '../components/Game/OpponentSeat3D';
import { PlayerHand3D } from '../components/Game/PlayerHand3D';
import { ColorPickerModal } from '../components/Game/ColorPickerModal';
import { SwapPlayerModal } from '../components/Game/SwapPlayerModal';
import { UnoShoutButton } from '../components/Game/UnoShoutButton';
import { GameOverModal } from '../components/Game/GameOverModal';
import { GameModeModal } from '../components/Lobby/GameModeModal';
import { WaitingRoomModal } from '../components/Lobby/WaitingRoomModal';
import { sfx } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import type { PublicRoom } from '../services/socketService';
import type { SkinId } from '../components/InteractiveCard3D';

type GameMode = 'classic' | 'stacking' | 'seven_zero' | 'duel';

export const PlayGame: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateCoinsLocal, refreshProfile } = useAuth();

  // Settings & Modes
  const [inGame, setInGame] = useState(false);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);
  const [isWaitingRoomModalOpen, setIsWaitingRoomModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<PublicRoom | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('stacking');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSkin, setSelectedSkin] = useState<SkinId>('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Active Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [turnCountdown, setTurnCountdown] = useState(15);
  const [botActionBubbles, setBotActionBubbles] = useState<Record<string, string>>({});
  const [catchUnoTarget, setCatchUnoTarget] = useState<string | null>(null);

  // Modals for Actions
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<UnoCard | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [pendingSevenCard, setPendingSevenCard] = useState<UnoCard | null>(null);

  const turnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTurnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sound sync
  const toggleSound = () => {
    sfx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Start new match
  const startMatch = (mode: GameMode = selectedMode) => {
    sfx.playCardDraw();
    const rules: GameRules = {
      ...DEFAULT_RULES,
      stackDrawCards: mode === 'stacking',
      sevenZeroRule: mode === 'seven_zero',
      botDifficulty: selectedDifficulty,
    };

    const isDuel = mode === 'duel';

    const playerConfigs: Array<{ id: string; name: string; avatar: string; isBot: boolean; personality?: Player['personality'] }> = [
      {
        id: 'player',
        name: profile?.displayName || 'You',
        avatar: profile?.avatarUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=YouChampion',
        isBot: false,
      },
      { id: 'bot_alex', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', isBot: true, personality: 'strategic' },
    ];

    if (!isDuel) {
      playerConfigs.push(
        { id: 'bot_sophia', name: 'Sophia', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia', isBot: true, personality: 'aggressive' },
        { id: 'bot_maya', name: 'Maya', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya', isBot: true, personality: 'defensive' }
      );
    }

    const newGame = UnoGameEngine.createGame(playerConfigs, rules);
    setGameState(newGame);
    setInGame(true);
    setTurnCountdown(rules.turnTimeLimitSeconds);
    setBotActionBubbles({});
    setCatchUnoTarget(null);
  };

  // Helper to show bubble
  const triggerBubble = (playerId: string, message: string) => {
    setBotActionBubbles((prev) => ({ ...prev, [playerId]: message }));
    setTimeout(() => {
      setBotActionBubbles((prev) => {
        const next = { ...prev };
        delete next[playerId];
        return next;
      });
    }, 2400);
  };

  // Draw Card for current player
  const handleDrawCard = useCallback((isPlayer = true) => {
    if (!gameState) return;
    const current = gameState.players[gameState.currentPlayerIndex];
    if (isPlayer && current.id !== 'player') return;

    sfx.playCardDraw();

    const drawCount = gameState.pendingDraw > 0 ? gameState.pendingDraw : 1;
    const { drawn, remainingDeck, remainingDiscard } = UnoGameEngine.drawCards(
      gameState.deck,
      gameState.discardPile,
      drawCount
    );

    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentPlayerIndex) {
        return { ...p, cards: [...p.cards, ...drawn], saidUno: false };
      }
      return p;
    });

    const nextIndex = UnoGameEngine.getNextPlayerIndex(
      gameState.currentPlayerIndex,
      gameState.direction,
      gameState.players.length
    );

    if (!isPlayer) {
      triggerBubble(current.id, `Drew ${drawCount} card(s)`);
    }

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        deck: remainingDeck,
        discardPile: remainingDiscard,
        players: updatedPlayers,
        pendingDraw: 0,
        pendingDrawType: null,
        currentPlayerIndex: nextIndex,
        turnStartedAt: Date.now(),
        lastActionMessage: `${current.name} drew ${drawCount} card(s).`,
      };
    });

    setTurnCountdown(gameState.rules.turnTimeLimitSeconds);
  }, [gameState]);

  // Execute card play into state
  const executePlayCard = (
    playerIndex: number,
    card: UnoCard,
    chosenColor?: CardColor,
    swapTargetIndex?: number
  ) => {
    if (!gameState) return;
    const player = gameState.players[playerIndex];

    // Remove played card from hand
    const remainingCards = player.cards.filter((c) => c.id !== card.id);
    const updatedDiscard = [...gameState.discardPile, card];

    // Check Victory
    if (remainingCards.length === 0) {
      const winnerPlayer = { ...player, cards: [] };
      const isWinner = winnerPlayer.id === 'player';
      const coinsEarned = isWinner ? 50 : 15;

      apiClient
        .claimGameReward({
          gameMode: selectedMode,
          won: isWinner,
          coins: coinsEarned,
        })
        .then(() => {
          updateCoinsLocal(coinsEarned);
          refreshProfile();
        })
        .catch(() => {
          updateCoinsLocal(coinsEarned);
        });

      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          discardPile: updatedDiscard,
          players: prev.players.map((p, idx) => (idx === playerIndex ? winnerPlayer : p)),
          status: 'game_over',
          winner: winnerPlayer,
        };
      });
      return;
    }

    // Determine next state
    let nextDirection = gameState.direction;
    let step = 1;
    let nextPendingDraw = gameState.pendingDraw;
    let nextPendingType = gameState.pendingDrawType;
    let nextColor = chosenColor || (card.color === 'wild' ? 'red' : card.color);

    // Audio cue based on action card
    if (card.type === 'skip') {
      sfx.playSkip();
      step = 2; // skip next player
      triggerBubble(player.id, 'Skip!');
    } else if (card.type === 'reverse') {
      sfx.playReverse();
      if (gameState.players.length === 2) {
        step = 2; // reverse in 2p acts as skip
      } else {
        nextDirection = (nextDirection * -1) as 1 | -1;
      }
      triggerBubble(player.id, 'Reverse!');
    } else if (card.type === 'draw2') {
      sfx.playDrawStrike();
      nextPendingDraw += 2;
      nextPendingType = 'draw2';
      triggerBubble(player.id, '+2 Cards!');
    } else if (card.type === 'draw4') {
      sfx.playDrawStrike();
      nextPendingDraw += 4;
      nextPendingType = 'draw4';
      triggerBubble(player.id, `+4 Wild (${nextColor.toUpperCase()})!`);
    } else if (card.type === 'wild') {
      sfx.playWild();
      triggerBubble(player.id, `Wild (${nextColor.toUpperCase()})!`);
    } else {
      sfx.playCardPlay();
    }

    // Handle 7-0 Rule
    let updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === playerIndex) {
        return { ...p, cards: remainingCards };
      }
      return p;
    });

    if (gameState.rules.sevenZeroRule) {
      // 7 = Swap with chosen target
      if (card.value === '7' && swapTargetIndex !== undefined) {
        sfx.playSwap();
        const p1Cards = [...updatedPlayers[playerIndex].cards];
        const p2Cards = [...updatedPlayers[swapTargetIndex].cards];
        updatedPlayers[playerIndex].cards = p2Cards;
        updatedPlayers[swapTargetIndex].cards = p1Cards;
        triggerBubble(player.id, `Swapped hand with ${updatedPlayers[swapTargetIndex].name}!`);
      }

      // 0 = Rotate all hands in play direction
      if (card.value === '0') {
        sfx.playSwap();
        const n = updatedPlayers.length;
        const allHands = updatedPlayers.map((p) => p.cards);
        updatedPlayers = updatedPlayers.map((p, i) => {
          const fromIndex = (i - nextDirection + n) % n;
          return { ...p, cards: allHands[fromIndex] };
        });
        triggerBubble(player.id, 'Rotated all hands!');
      }
    }

    const nextPlayerIndex = UnoGameEngine.getNextPlayerIndex(
      playerIndex,
      nextDirection,
      updatedPlayers.length,
      step
    );

    // Uno state check: if player now has 1 card left
    if (remainingCards.length === 1) {
      if (player.id !== 'player') {
        // Bot calls UNO 85% of time after 800ms
        setTimeout(() => {
          if (Math.random() < 0.85) {
            triggerBubble(player.id, '🔥 UNO!');
            sfx.playUnoShout();
            setGameState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                players: prev.players.map((p) => (p.id === player.id ? { ...p, saidUno: true } : p)),
              };
            });
            setCatchUnoTarget(null);
          } else {
            // Bot forgot to call UNO! Player can catch them!
            setCatchUnoTarget(player.name);
          }
        }, 800);
      }
    }

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        discardPile: updatedDiscard,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        direction: nextDirection,
        currentColor: nextColor,
        pendingDraw: nextPendingDraw,
        pendingDrawType: nextPendingType,
        turnStartedAt: Date.now(),
        lastActionMessage: `${player.name} played ${card.color.toUpperCase()} ${card.value.toUpperCase()}.`,
      };
    });

    setTurnCountdown(gameState.rules.turnTimeLimitSeconds);

    // If next player is human, alert turn
    if (updatedPlayers[nextPlayerIndex].id === 'player') {
      sfx.playTurnAlert();
    }
  };

  // Human player plays a card
  const handlePlayerCardClick = (card: UnoCard) => {
    if (!gameState || gameState.status !== 'playing') return;
    const playerIndex = gameState.currentPlayerIndex;
    const player = gameState.players[playerIndex];
    if (player.id !== 'player') return;

    // Check if card requires Wild color selection
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    // Check if card is 7 and 7-0 rule is active
    if (gameState.rules.sevenZeroRule && card.value === '7' && gameState.players.length > 2) {
      setPendingSevenCard(card);
      setShowSwapModal(true);
      return;
    }

    executePlayCard(playerIndex, card);
  };

  // Confirm Wild color selection
  const handleConfirmColor = (color: CardColor) => {
    setShowColorPicker(false);
    if (!pendingWildCard || !gameState) return;
    executePlayCard(gameState.currentPlayerIndex, pendingWildCard, color);
    setPendingWildCard(null);
  };

  // Confirm 7-0 Swap selection
  const handleConfirmSwap = (targetPlayer: Player) => {
    setShowSwapModal(false);
    if (!pendingSevenCard || !gameState) return;
    const targetIdx = gameState.players.findIndex((p) => p.id === targetPlayer.id);
    executePlayCard(gameState.currentPlayerIndex, pendingSevenCard, undefined, targetIdx);
    setPendingSevenCard(null);
  };

  // Player calls UNO
  const handleCallUno = () => {
    if (!gameState) return;
    sfx.playUnoShout();
    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map((p) => (p.id === 'player' ? { ...p, saidUno: true } : p)),
      };
    });
  };

  // Player catches bot who forgot to call UNO
  const handleCatchUno = () => {
    if (!gameState || !catchUnoTarget) return;
    sfx.playPenalty();

    const targetIdx = gameState.players.findIndex((p) => p.name === catchUnoTarget);
    if (targetIdx !== -1) {
      const { drawn, remainingDeck, remainingDiscard } = UnoGameEngine.drawCards(
        gameState.deck,
        gameState.discardPile,
        2
      );
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          deck: remainingDeck,
          discardPile: remainingDiscard,
          players: prev.players.map((p, idx) =>
            idx === targetIdx ? { ...p, cards: [...p.cards, ...drawn], saidUno: false } : p
          ),
          lastActionMessage: `Caught ${catchUnoTarget}! They received +2 penalty cards.`,
        };
      });
      triggerBubble(gameState.players[targetIdx].id, 'Caught! +2 Penalty');
      setCatchUnoTarget(null);
    }
  };

  // Bot Turn Automation Effect
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;
    const activePlayer = gameState.players[gameState.currentPlayerIndex];

    if (activePlayer && activePlayer.isBot) {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);

      const delay = Math.floor(Math.random() * 400) + 900; // 900-1300ms realistic bot response time
      botTurnTimeoutRef.current = setTimeout(() => {
        const decision = UnoGameEngine.selectBotCard(activePlayer, gameState);
        if (decision.card) {
          executePlayCard(
            gameState.currentPlayerIndex,
            decision.card,
            decision.chosenColor,
            decision.swapTargetIndex
          );
        } else {
          handleDrawCard(false);
        }
      }, delay);
    }

    return () => {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
    };
  }, [gameState, handleDrawCard]);

  // Reset turn countdown whenever current player changes
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;
    setTurnCountdown(gameState.rules.turnTimeLimitSeconds);
  }, [gameState?.currentPlayerIndex, gameState?.status]);

  // Turn Countdown Timer
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;

    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    turnTimerRef.current = setInterval(() => {
      setTurnCountdown((prev) => {
        if (prev <= 1) {
          // Auto draw on timeout only if no modal is awaiting user selection
          const active = gameState.players[gameState.currentPlayerIndex];
          if (active.id === 'player' && !showColorPicker && !showSwapModal) {
            handleDrawCard(true);
          }
          return gameState.rules.turnTimeLimitSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    };
  }, [gameState?.currentPlayerIndex, gameState?.status, handleDrawCard, showColorPicker, showSwapModal]);

  const humanPlayer = gameState?.players.find((p) => p.id === 'player');
  const opponents = gameState?.players.filter((p) => p.id !== 'player') || [];
  const isHumanTurn = gameState?.players[gameState.currentPlayerIndex]?.id === 'player';
  const showCallUno = !!humanPlayer && humanPlayer.cards.length === 1 && !humanPlayer.saidUno;

  return (
    <div className="relative h-screen max-h-screen bg-[#07090e] text-white font-['Outfit'] select-none flex flex-col justify-between overflow-hidden">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-uno-blue/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-uno-red/15 rounded-full blur-[180px] pointer-events-none" />

      {/* TOP ARENA HEADER */}
      <header className="relative z-30 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        {/* Left: Exit & Mode Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sfx.playCardClick();
              if (inGame) {
                setInGame(false);
              } else {
                navigate('/');
              }
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Lobby
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-gray-300">
            <span className="w-2 h-2 rounded-full bg-uno-green animate-pulse" />
            {selectedMode === 'stacking'
              ? 'Stacking Chaos (+2/+4)'
              : selectedMode === 'seven_zero'
              ? '7-0 Hand Swap'
              : selectedMode === 'duel'
              ? '1v1 Speed Duel'
              : 'Classic Match'}
          </div>
        </div>

        {/* Center: Turn Status Banner */}
        {inGame && gameState && (
          <div className="flex items-center gap-2">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                isHumanTurn
                  ? 'bg-uno-yellow text-black border-white shadow-[0_0_20px_rgba(255,204,0,0.6)] animate-bounce'
                  : 'bg-white/10 text-gray-300 border-white/15'
              }`}
            >
              {isHumanTurn ? 'YOUR TURN' : `${gameState.players[gameState.currentPlayerIndex].name}'s Turn`}
            </div>
            <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-xs font-black text-uno-yellow">
              {turnCountdown}s
            </div>
          </div>
        )}

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRulesModal(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-300"
            title="Game Rules"
          >
            <HelpCircle size={17} />
          </button>
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-300"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: LOBBY OR ACTIVE 3D TABLE */}
      {!inGame || !gameState ? (
        /* LOBBY SELECTION SCREEN */
        <div className="flex-1 flex items-center justify-center p-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark border border-white/15 p-6 sm:p-10 rounded-3xl max-w-2xl w-full text-center space-y-8 shadow-2xl relative"
          >
            <div>
              <span className="px-3 py-1 rounded-full bg-uno-red/20 text-uno-red text-xs font-black uppercase tracking-widest border border-uno-red/30">
                3D Interactive Table
              </span>
              <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mt-2">
                UNO <span className="text-uno-red">ARENA</span>
              </h1>
              <p className="text-sm font-medium text-gray-400 mt-2">
                Select your rule set and battle against intelligent bot opponents with real-time 3D card physics!
              </p>
            </div>

            {/* MODE SELECTION CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {[
                { id: 'stacking', title: 'Stacking', desc: '+2 on +2 / +4 on +4' },
                { id: 'seven_zero', title: '7-0 Swap', desc: '7 swaps, 0 rotates' },
                { id: 'duel', title: '1v1 Duel', desc: 'Fast head-to-head' },
                { id: 'classic', title: 'Classic', desc: 'Original official rules' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    sfx.playCardClick();
                    setSelectedMode(mode.id as GameMode);
                  }}
                  className={`p-4 rounded-2xl border transition-all ${
                    selectedMode === mode.id
                      ? 'border-uno-red bg-uno-red/10 shadow-[0_0_20px_rgba(255,59,59,0.3)] ring-1 ring-uno-red'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-black text-sm text-white">{mode.title}</span>
                  <span className="block text-[11px] text-gray-400 mt-1">{mode.desc}</span>
                </button>
              ))}
            </div>

            {/* DIFFICULTY & SKIN ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Bot Difficulty
                </span>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedDifficulty(diff);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        selectedDifficulty === diff
                          ? 'border-uno-yellow bg-uno-yellow text-black'
                          : 'border-white/10 bg-white/5 text-gray-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Card Deck Skin
                </span>
                <div className="flex gap-2">
                  {(['classic', 'gold-foil', 'dark-obsidian', 'aurora'] as const).map((sk) => (
                    <button
                      key={sk}
                      onClick={() => {
                        sfx.playCardClick();
                        setSelectedSkin(sk);
                      }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        selectedSkin === sk
                          ? 'border-uno-blue bg-uno-blue text-white'
                          : 'border-white/10 bg-white/5 text-gray-300'
                      }`}
                    >
                      {sk.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LAUNCH ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsGameModeModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-uno-blue via-indigo-600 to-purple-600 text-white font-black italic text-lg uppercase tracking-wider shadow-[0_10px_25px_rgba(0,140,255,0.4)] flex items-center justify-center gap-3"
              >
                <Zap size={22} className="text-uno-yellow" /> QUICK MATCH (ONLINE MULTIPLAYER)
              </motion.button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startMatch()}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-uno-red via-red-600 to-amber-500 text-white font-black italic text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(255,59,59,0.3)] flex items-center justify-center gap-2"
                >
                  <Bot size={18} /> PLAY WITH BOTS (PRACTICE)
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsGameModeModalOpen(true)}
                  className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black italic text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Users size={18} className="text-uno-yellow" /> PRIVATE ROOM
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ACTIVE 3D TABLE VIEWPORT */
        <div className="flex-1 flex flex-col justify-between relative px-4 py-1 overflow-hidden">
          {/* TOP ROW: OPPONENTS */}
          <div className="relative w-full max-w-5xl mx-auto flex items-center justify-between sm:justify-around pt-2">
            {opponents.length === 1 ? (
              // 1v1 Duel: Single opponent centered at top
              <div className="mx-auto">
                <OpponentSeat3D
                  player={opponents[0]}
                  isTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponents[0].id}
                  position="top"
                  actionBubble={botActionBubbles[opponents[0].id]}
                  turnCountdown={
                    gameState.players[gameState.currentPlayerIndex]?.id === opponents[0].id
                      ? turnCountdown
                      : undefined
                  }
                />
              </div>
            ) : (
              // 4-Player Table: Left, Top, Right
              <>
                <OpponentSeat3D
                  player={opponents[0]}
                  isTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponents[0].id}
                  position="left"
                  actionBubble={botActionBubbles[opponents[0].id]}
                  turnCountdown={
                    gameState.players[gameState.currentPlayerIndex]?.id === opponents[0].id
                      ? turnCountdown
                      : undefined
                  }
                />
                <OpponentSeat3D
                  player={opponents[1]}
                  isTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponents[1].id}
                  position="top"
                  actionBubble={botActionBubbles[opponents[1].id]}
                  turnCountdown={
                    gameState.players[gameState.currentPlayerIndex]?.id === opponents[1].id
                      ? turnCountdown
                      : undefined
                  }
                />
                <OpponentSeat3D
                  player={opponents[2]}
                  isTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponents[2].id}
                  position="right"
                  actionBubble={botActionBubbles[opponents[2].id]}
                  turnCountdown={
                    gameState.players[gameState.currentPlayerIndex]?.id === opponents[2].id
                      ? turnCountdown
                      : undefined
                  }
                />
              </>
            )}
          </div>

          {/* CENTER: 3D TABLE */}
          <div className="my-auto py-2">
            <GameTable3D
              currentColor={gameState.currentColor}
              topDiscardCard={gameState.discardPile[gameState.discardPile.length - 1]}
              discardPile={gameState.discardPile}
              deckCount={gameState.deck.length}
              direction={gameState.direction}
              pendingDraw={gameState.pendingDraw}
              isPlayerTurn={isHumanTurn}
              onDrawCard={() => handleDrawCard(true)}
            />
          </div>

          {/* BOTTOM: HUMAN HAND */}
          <div className="relative z-20">
            {humanPlayer && (
              <PlayerHand3D
                cards={humanPlayer.cards}
                topDiscardCard={gameState.discardPile[gameState.discardPile.length - 1]}
                currentColor={gameState.currentColor}
                pendingDraw={gameState.pendingDraw}
                isPlayerTurn={isHumanTurn}
                rules={gameState.rules}
                skin={selectedSkin}
                onPlayCard={handlePlayerCardClick}
              />
            )}
          </div>

          {/* UNO SHOUT & CATCH BUTTONS */}
          <UnoShoutButton
            showCallUno={showCallUno}
            catchUnoOpponentName={catchUnoTarget || undefined}
            onCallUno={handleCallUno}
            onCatchUno={handleCatchUno}
          />

          {/* COLOR PICKER MODAL */}
          <ColorPickerModal
            isOpen={showColorPicker}
            onSelectColor={handleConfirmColor}
          />

          {/* 7-0 HAND SWAP MODAL */}
          <SwapPlayerModal
            isOpen={showSwapModal}
            opponents={opponents}
            onSelectPlayer={handleConfirmSwap}
          />

          {/* GAME OVER MODAL */}
          {gameState.status === 'game_over' && (
            <GameOverModal
              winner={gameState.winner}
              isPlayerWinner={gameState.winner?.id === 'player'}
              coinsEarned={gameState.winner?.id === 'player' ? 25 : 10}
              totalTurns={gameState.history.length}
              onPlayAgain={() => startMatch()}
              onReturnHome={() => setInGame(false)}
            />
          )}
        </div>
      )}

      {/* RULES SUMMARY MODAL */}
      <AnimatePresence>
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-dark border border-white/20 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                  <ShieldAlert size={20} className="text-uno-yellow" /> Game Rules & Modes
                </h3>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-gray-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-uno-yellow">Stacking:</span> If another player hits you with a Draw Two (+2) or Wild Draw Four (+4), stack your own +2 on +2 or +4 on +4 to pass the combined penalty to the next player!
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-uno-blue">7-0 Hand Swap:</span> Playing any '7' lets you pick any opponent and swap entire hands with them. Playing a '0' rotates every player's hand in the current direction of play!
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-uno-red">Calling UNO:</span> Whenever you have only 1 card remaining in your hand, shout "UNO!" before another player catches you, or receive 2 penalty cards!
                </div>
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs tracking-wider"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTIPLAYER LOBBY MODALS */}
      <GameModeModal
        isOpen={isGameModeModalOpen}
        onClose={() => setIsGameModeModalOpen(false)}
        onStartBotGame={() => startMatch()}
        onRoomJoined={(room) => {
          setIsGameModeModalOpen(false);
          setActiveRoom(room);
          setIsWaitingRoomModalOpen(true);
        }}
      />

      <WaitingRoomModal
        isOpen={isWaitingRoomModalOpen}
        room={activeRoom}
        onClose={() => setIsWaitingRoomModalOpen(false)}
        onGameStart={() => {
          setIsWaitingRoomModalOpen(false);
          startMatch();
        }}
      />
    </div>
  );
};

export default PlayGame;
