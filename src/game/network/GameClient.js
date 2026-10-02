/**
 * Ranh giới kết nối multiplayer.
 * Scene không phụ thuộc trực tiếp vào WebSocket để có thể thay transport/server sau này.
 */
export class GameClient {
  constructor(options = {}) {
    this.url = options.url || `ws://${window.location.hostname}:8787`;
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
    this.socket = null;
    this.profile = null;
    this.retry = null;
    this.closed = false;
  }

  connect(profile) {
    this.profile = profile;
    this.closed = false;
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener('open', () => {
      this.onStatus({ connected: true });
      this.send({
        type: 'join',
        playerId: profile.playerId,
        name: profile.name,
        channelId: profile.channelId,
        requestedFarmId: profile.farmId,
        villageId: profile.villageId || null,
        sessionToken: profile.sessionToken || null,
      });
    });
    this.socket.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'welcome') {
          this.onWelcome(message);
        } else if (message.type === 'village_list') {
          this.onVillages(message.villages || []);
        } else if (message.type === 'village_required') {
          this.onVillages(message.villages || []);
          this.onVillageRequired();
        } else if (message.type === 'village_error') {
          this.onVillages(message.villages || []);
          this.onVillageError(message.message || 'Không thể nhận nông trại tại làng này.');
        } else if (message.type === 'world_state') {
          this.onState(message.players.filter(player => player.playerId !== profile.playerId));
        } else if (message.type === 'farm_sync') {
          this.onFarmSync(message.farms);
        } else if (message.type === 'farm_scope') {
          this.onFarmScope(message);
        } else if (message.type === 'farm_update') {
          this.onFarmUpdate(message);
        } else if (message.type === 'mailbox_notice') {
          this.onMailboxNotice(message);
        } else if (message.type === 'player_emote') {
          this.onEmote(message);
        } else if (message.type === 'account_state') {
          this.onAccountState(message);
        } else if (message.type === 'action_error' || message.type === 'auth_error') {
          this.onActionError(message.message || 'Server từ chối hành động.');
        } else if (message.type === 'social_state') {
          this.onSocialState(message);
        }
      } catch { /* Ignore malformed server messages. */ }
    });
    this.socket.addEventListener('close', () => {
      this.onStatus({ connected: false });
      this.onState([]);
      if (!this.closed) this.retry = window.setTimeout(() => this.connect(this.profile), 2500);
    });
    this.socket.addEventListener('error', () => this.socket?.close());
  }

  send(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  disconnect() {
    this.closed = true;
    window.clearTimeout(this.retry);
    this.socket?.close();
    this.socket = null;
  }

  sendPosition(position) { this.send({ type: 'move', ...position }); }
  sendTravel(position) { this.send({ type: 'travel', x: position.x, y: position.y || 0, z: position.z, venue: position.venue || null }); }
  sendFarmAction(actionData) { this.send({ type: 'farm_action', ...actionData }); }
  sendMailboxHeart(farmId) { this.send({ type: 'mailbox_heart', farmId }); }
  sendEmote(emote) { this.send({ type: 'emote', emote }); }
  sendGameAction(action, payload = {}) { this.send({ type: 'game_action', action, payload, requestId: crypto.randomUUID() }); }
  sendSocialAction(action, friendId) { this.send({ type: 'social_action', action, friendId }); }
}
