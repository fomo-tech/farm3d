import { createRuntimeId } from '../runtime/BrowserRuntime.js';

/**
 * Ranh giới kết nối multiplayer.
 * Scene không phụ thuộc trực tiếp vào WebSocket để có thể thay transport/server sau này.
 */
export class GameClient {
  constructor(options = {}) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.url = options.url || `${protocol}://${window.location.hostname}:8787`;
    this.onState = options.onState || (() => {});
    this.onStatus = options.onStatus || (() => {});
    this.onFarmSync = options.onFarmSync || (() => {});
    this.onFarmUpdate = options.onFarmUpdate || (() => {});
    this.onFarmScope = options.onFarmScope || (() => {});
    this.onMailboxNotice = options.onMailboxNotice || (() => {});
    this.onEmote = options.onEmote || (() => {});
    this.onWelcome = options.onWelcome || (() => {});
    this.onVillages = options.onVillages || (() => {});
    this.onVillageRequired = options.onVillageRequired || (() => {});
    this.onVillageError = options.onVillageError || (() => {});
    this.onAccountState = options.onAccountState || (() => {});
    this.onActionError = options.onActionError || (() => {});
    this.onSocialState = options.onSocialState || (() => {});
    this.onCasinoState = options.onCasinoState || (() => {});
    this.onMoveAck = options.onMoveAck || (() => {});
    this.socket = null;
    this.profile = null;
    this.retry = null;
    this.heartbeat = null;
    this.retryAttempt = 0;
    this.lastPongAt = 0;
    this.pending = new Map();
    this.joined = false;
    this.closed = false;
    this.listening = false;
    this.handleOffline = () => {
      this.onStatus({ connected: false, phase: 'offline', attempt: this.retryAttempt, queued: this.pending.size });
      this.socket?.close(4001, 'Browser offline');
    };
    this.handleOnline = () => {
      if (this.closed || this.socket) return;
      window.clearTimeout(this.retry);
      this.connect(this.profile);
    };
    this.handleVisibility = () => {
      if (document.visibilityState === 'visible' && !this.closed && !this.socket) this.handleOnline();
    };
  }

  connect(profile) {
    this.profile = profile;
    this.closed = false;
    if (!this.listening) {
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('online', this.handleOnline);
      document.addEventListener('visibilitychange', this.handleVisibility);
      this.listening = true;
    }
    if (this.socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.socket.readyState)) return;
    this.joined = false;
    this.onStatus({ connected: false, phase: this.retryAttempt ? 'reconnecting' : 'connecting', attempt: this.retryAttempt, queued: this.pending.size });
    const socket = new WebSocket(this.url);
    this.socket = socket;
    this.socket.addEventListener('open', () => {
      this.lastPongAt = Date.now();
      this.onStatus({ connected: true, phase: 'syncing', attempt: this.retryAttempt, queued: this.pending.size });
      this.sendNow({
        type: 'join',
        playerId: profile.playerId,
        name: profile.name,
        channelId: profile.channelId,
        requestedFarmId: profile.farmId,
        villageId: profile.villageId || null,
        sessionToken: profile.sessionToken || null,
      });
      this.startHeartbeat();
    });
    this.socket.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'welcome') {
          this.joined = true;
          this.retryAttempt = 0;
          this.onWelcome(message);
          this.flushPending();
          this.onStatus({ connected: true, phase: 'connected', attempt: 0, queued: this.pending.size });
        } else if (message.type === 'village_list') {
          this.onVillages(message.villages || []);
        } else if (message.type === 'village_required') {
          this.onVillages(message.villages || []);
          this.onVillageRequired();
        } else if (message.type === 'village_error') {
          this.onVillages(message.villages || []);
          this.onVillageError(message.message || 'Không thể nhận nông trại tại làng này.');
        } else if (message.type === 'world_state') {
          this.onState(message.players.filter(player => player.playerId !== profile.playerId), message.serverTime);
        } else if (message.type === 'move_ack') {
          this.onMoveAck(message);
        } else if (message.type === 'farm_sync') {
          this.onFarmSync(message.farms);
        } else if (message.type === 'farm_scope') {
          this.onFarmScope(message);
        } else if (message.type === 'farm_update') {
          this.acknowledge(message.requestId);
          this.onFarmUpdate(message);
        } else if (message.type === 'mailbox_notice') {
          this.onMailboxNotice(message);
        } else if (message.type === 'player_emote') {
          this.onEmote(message);
        } else if (message.type === 'account_state') {
          this.acknowledge(message.requestId);
          this.onAccountState(message);
        } else if (message.type === 'action_error' || message.type === 'auth_error') {
          this.acknowledge(message.requestId);
          this.onActionError(message.message || 'Server từ chối hành động.');
        } else if (message.type === 'pong') {
          this.lastPongAt = Date.now();
        } else if (message.type === 'social_state') {
          this.onSocialState(message);
        } else if (message.type === 'casino_state') {
          this.onCasinoState(message);
        }
      } catch (error) {
        console.error('[GameClient] Failed to process server message', error);
        window.__farmDebug?.report(error, 'NETWORK MESSAGE HANDLER');
      }
    });
    this.socket.addEventListener('close', event => {
      if (socket !== this.socket) return;
      this.stopHeartbeat();
      this.socket = null;
      this.joined = false;
      this.onState([]);
      if (!this.closed) {
        window.__farmDebug?.report(`Mất kết nối server: mã ${event.code}, lý do ${event.reason || 'server không cung cấp'}. Đang kết nối lại.`, 'NETWORK DISCONNECTED');
        this.retryAttempt += 1;
        const delay = Math.min(30_000, 1000 * (2 ** Math.min(this.retryAttempt - 1, 5))) + Math.floor(Math.random() * 350);
        this.onStatus({ connected: false, phase: navigator.onLine ? 'reconnecting' : 'offline', attempt: this.retryAttempt, retryInMs: delay, queued: this.pending.size });
        this.retry = window.setTimeout(() => this.connect(this.profile), delay);
      }
    });
    this.socket.addEventListener('error', () => this.socket?.close());
  }

  sendNow(payload) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(payload));
    return true;
  }

  send(payload) {
    return this.sendNow(payload);
  }

  sendReliable(payload) {
    const requestId = payload.requestId || createRuntimeId('request');
    const message = { ...payload, requestId };
    this.pending.set(requestId, message);
    if (this.pending.size > 100) this.pending.delete(this.pending.keys().next().value);
    if (this.joined) this.sendNow(message);
    this.onStatus({ connected: this.joined, phase: this.joined ? 'connected' : navigator.onLine ? 'reconnecting' : 'offline', attempt: this.retryAttempt, queued: this.pending.size });
    return requestId;
  }

  acknowledge(requestId) {
    if (!requestId) return;
    this.pending.delete(requestId);
    this.onStatus({ connected: this.joined, phase: this.joined ? 'connected' : 'syncing', attempt: this.retryAttempt, queued: this.pending.size });
  }

  flushPending() {
    this.pending.forEach(message => this.sendNow(message));
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeat = window.setInterval(() => {
      if (Date.now() - this.lastPongAt > 25_000) {
        this.socket?.close(4000, 'Heartbeat timeout');
        return;
      }
      this.sendNow({ type: 'ping', sentAt: Date.now() });
    }, 10_000);
  }

  stopHeartbeat() {
    window.clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  disconnect() {
    this.closed = true;
    if (this.listening) {
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('online', this.handleOnline);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      this.listening = false;
    }
    window.clearTimeout(this.retry);
    this.stopHeartbeat();
    this.socket?.close();
    this.socket = null;
  }

  sendPosition(position) { this.send({ type: 'move', ...position }); }
  sendTravel(position) { this.send({ type: 'travel', x: position.x, y: position.y || 0, z: position.z, venue: position.venue || null }); }
  sendFarmAction(actionData) { return this.sendReliable({ type: 'farm_action', ...actionData }); }
  sendMailboxHeart(farmId) { this.send({ type: 'mailbox_heart', farmId }); }
  sendEmote(emote) { this.send({ type: 'emote', emote }); }
  sendGameAction(action, payload = {}) { return this.sendReliable({ type: 'game_action', action, payload }); }
  sendSocialAction(action, friendId) { this.send({ type: 'social_action', action, friendId }); }
}
