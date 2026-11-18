import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface RoomPlayer {
  id: string;
  uid?: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  isHost?: boolean;
  isReady?: boolean;
  status?: string;
  cardsCount?: number;
  cardSkinId?: string | null;
  avatarFrameId?: string | null;
}

export interface PublicRoom {
  id: string;
  code: string;
  roomCode?: string;
  name?: string;
  maxPlayers: number;
  currentPlayers: number;
  isPublic: boolean;
  betAmount?: number;
  status: 'waiting' | 'in_progress' | 'finished' | string;
  hostId: string;
  players: RoomPlayer[];
  rules?: {
    gameMode?: string;
    allowDrawStacking?: boolean;
    allowSevenZero?: boolean;
    allowJumpIn?: boolean;
    drawToMatch?: boolean;
    turnTimeLimitSeconds?: number;
    [key: string]: any;
  };
}

export interface SocketGameState {
  roomId: string;
  players: Array<{
    id: string;
    uid?: string;
    name: string;
    avatar?: string;
    cardsCount: number;
    saidUno?: boolean;
  }>;
  hand: any[];
  topDiscardCard: any;
  currentColor: string;
  currentTurnPlayerId: string;
  turnDirection: number; // 1 = clockwise, -1 = counter-clockwise
  turnExpiresAt: number;
  pendingDraw: number;
  pendingDrawType?: string | null;
  status: 'in_progress' | 'finished';
  winner?: { id: string; name: string } | null;
  lastActionMessage?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  public currentRoomId: string | null = null;
  public currentUserId: string | null = null;

  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.setupCoreHandlers();
    } else {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }

  private normalizeRoom(rawRoom: any): PublicRoom {
    const room = rawRoom?.room || rawRoom || {};
    const code = room.roomCode || room.code || '';
    const players: RoomPlayer[] = Array.isArray(room.players)
      ? room.players.map((p: any) => ({
          id: p.id || p.uid || '',
          uid: p.id || p.uid || '',
          name: p.name || 'Player',
          avatar: p.avatarUrl || p.avatar || '',
          avatarUrl: p.avatarUrl || p.avatar || '',
          isHost: p.id === room.hostId || !!p.isHost,
          isReady: p.status === 'ready' || !!p.isReady,
          status: p.status || 'ready',
          cardsCount: p.cardsCount || 7,
          cardSkinId: p.cardSkinId || null,
          avatarFrameId: p.avatarFrameId || null,
        }))
      : [];

    return {
      id: room.id || '',
      code,
      roomCode: code,
      name: room.name || `Room ${code}`,
      maxPlayers: room.maxPlayers || 4,
      currentPlayers: players.length,
      isPublic: room.isPublic !== false,
      betAmount: room.betAmount || 50,
      status: room.status || 'waiting',
      hostId: room.hostId || (players[0]?.id ?? ''),
      players,
      rules: room.rules || {
        gameMode: room.gameMode || 'stacking',
        allowDrawStacking: true,
        allowSevenZero: true,
      },
    };
  }

  private setupCoreHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.emitInternal('connect');
    });

    this.socket.on('disconnect', (reason) => {
      this.emitInternal('disconnect', reason);
    });

    this.socket.on('room_joined', (data) => {
      const room = this.normalizeRoom(data);
      this.currentRoomId = room.id;
      this.emitInternal('room_joined', room);
    });

    this.socket.on('room_update', (data) => {
      const room = this.normalizeRoom(data);
      this.currentRoomId = room.id;
      this.emitInternal('room_update', room);
    });

    this.socket.on('room_error', (data: any) => {
      const msg = typeof data === 'string' ? data : data?.message || 'Room error occurred.';
      this.emitInternal('room_error', msg);
    });

    this.socket.on('queue_joined', (data) => {
      this.emitInternal('queue_joined', data);
    });

    this.socket.on('match_found', (data) => {
      if (data?.room) {
        data.room = this.normalizeRoom(data.room);
        this.currentRoomId = data.room.id;
      }
      this.emitInternal('match_found', data);
    });

    this.socket.on('game_started', (data) => {
      if (data?.roomId) {
        this.currentRoomId = data.roomId;
      }
      this.emitInternal('game_started', data);
    });

    this.socket.on('game_state_update', (data) => {
      this.emitInternal('game_state_update', data);
    });

    this.socket.on('play_error', (data: any) => {
      const msg = typeof data === 'string' ? data : data?.message || 'Play error.';
      this.emitInternal('play_error', msg);
    });

    this.socket.on('room_chat_message', (data) => {
      this.emitInternal('room_chat_message', data);
    });
  }

  // Event Subscription
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emitInternal(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(...args);
      } catch (err) {
        console.error(`Error in socket listener for ${event}:`, err);
      }
    });
  }

  // Player Presence
  updatePresence(user: { uid?: string; name: string; avatar?: string; coins?: number }) {
    this.ensureConnected();
    if (user.uid) this.currentUserId = user.uid;
    this.socket?.emit('update_presence', {
      userData: {
        id: user.uid || this.currentUserId,
        name: user.name,
        avatarUrl: user.avatar,
        coins: user.coins,
      },
    });
  }

  // Quick Match Queue
  joinQueue(data: {
    playerCount?: number;
    gameMode?: string;
    mode?: string;
    betAmount?: number;
    name: string;
    avatar?: string;
    uid?: string;
    cardSkinId?: string;
  }) {
    this.ensureConnected();
    const resolvedId = data.uid || this.currentUserId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    this.currentUserId = resolvedId;

    const payload = {
      playerCount: data.playerCount || 4,
      gameMode: data.gameMode || data.mode || 'stacking',
      userData: {
        id: resolvedId,
        name: data.name || 'Player',
        avatarUrl: data.avatar || null,
        cardSkinId: data.cardSkinId || null,
      },
    };
    this.socket?.emit('join_queue', payload);
  }

  leaveQueue() {
    if (this.socket) {
      this.socket.emit('leave_queue', {});
    }
  }

  // Custom Rooms
  createRoom(payload: {
    roomName?: string;
    maxPlayers?: number;
    isPrivate?: boolean;
    password?: string;
    betAmount?: number;
    rules?: any;
    name: string;
    avatar?: string;
    uid?: string;
    cardSkinId?: string;
  }) {
    this.ensureConnected();
    const resolvedId = payload.uid || this.currentUserId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    this.currentUserId = resolvedId;

    const serverPayload = {
      maxPlayers: payload.maxPlayers || 4,
      isPublic: !payload.isPrivate,
      password: payload.isPrivate ? payload.password : null,
      gameMode: payload.rules?.gameMode || 'stacking',
      rules: payload.rules || {
        allowDrawStacking: true,
        allowSevenZero: true,
      },
      userData: {
        id: resolvedId,
        name: payload.name || 'Player',
        avatarUrl: payload.avatar || null,
        cardSkinId: payload.cardSkinId || null,
      },
    };
    this.socket?.emit('create_room', serverPayload);
  }

  joinRoom(payload: {
    roomCode: string;
    password?: string;
    name: string;
    avatar?: string;
    uid?: string;
    cardSkinId?: string;
  }) {
    this.ensureConnected();
    const resolvedId = payload.uid || this.currentUserId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    this.currentUserId = resolvedId;

    const serverPayload = {
      roomCode: payload.roomCode.trim().toUpperCase(),
      password: payload.password || null,
      userData: {
        id: resolvedId,
        name: payload.name || 'Player',
        avatarUrl: payload.avatar || null,
        cardSkinId: payload.cardSkinId || null,
      },
    };
    this.socket?.emit('join_room', serverPayload);
  }

  leaveRoom() {
    this.socket?.emit('leave_room');
    this.currentRoomId = null;
  }

  startRoomGame(roomId?: string, playerId?: string) {
    const rId = roomId || this.currentRoomId;
    const pId = playerId || this.currentUserId;
    this.socket?.emit('start_room_game', { roomId: rId, playerId: pId });
  }

  sendRoomChat(arg1: string, arg2?: string, arg3?: string) {
    let roomId = this.currentRoomId;
    let playerId = this.currentUserId;
    let message = '';
    if (arg3 !== undefined) {
      roomId = arg1;
      playerId = arg2 || this.currentUserId;
      message = arg3;
    } else {
      message = arg1;
    }
    this.socket?.emit('send_room_chat', { roomId, playerId, message });
  }

  // Gameplay Actions
  playCard(cardId: string, chosenColor?: string, roomId?: string, playerId?: string) {
    this.socket?.emit('play_card', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
      cardId,
      chosenColor,
    });
  }

  drawCard(roomId?: string, playerId?: string) {
    this.socket?.emit('draw_card', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
    });
  }

  passTurn(roomId?: string, playerId?: string) {
    this.socket?.emit('pass_turn', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
    });
  }

  callUno(roomId?: string, playerId?: string) {
    this.socket?.emit('call_uno', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
    });
  }

  jumpIn(cardId: string, roomId?: string, playerId?: string) {
    this.socket?.emit('jump_in', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
      cardId,
    });
  }

  chooseSwapTarget(targetPlayerId: string, roomId?: string, playerId?: string) {
    this.socket?.emit('choose_swap_target', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
      targetPlayerId,
    });
  }

  rematchGame(roomId?: string, playerId?: string) {
    this.socket?.emit('rematch_game', {
      roomId: roomId || this.currentRoomId,
      playerId: playerId || this.currentUserId,
    });
  }

  leaveGame() {
    this.socket?.emit('leave_game');
  }

  private ensureConnected() {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
