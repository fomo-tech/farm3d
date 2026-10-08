import React, { useEffect, useRef, useState } from 'react';
import { CasinoLobby } from './casino/CasinoLobby.jsx';
import { CasinoTable } from './casino/CasinoTable.jsx';
import './casino.css';
import './casino/lounge.css';
import { casinoAudio } from '../game/casino/casinoAudio.js';
import { nextQuickPlayAction } from './casino/quickPlay.js';

export function CasinoGames({
  state,
  coins,
  connected,
  inside,
  message,
  onAction,
  onExit,
  onSelectGame,
  now,
  defaultGame = null,
}) {
  const [sound, setSound] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const anchor = useRef({ server: Date.now(), local: Date.now() });
  const audio = useRef(null);
  const focus = useRef(null);
  const quickPlay = useRef(null);
  const [quickPlaying, setQuickPlaying] = useState(false);
  const [visibleMessage, setVisibleMessage] = useState(message);
  useEffect(() => {
    setVisibleMessage(message);
    const timeout = window.setTimeout(() => setVisibleMessage(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const room = state?.mine;
  const round = room?.round;
  const enabled = connected && inside;

  const seconds = Math.max(
    0,
    Math.ceil(((round?.deadline || 0) - anchor.current.server - Math.max(0, clock - anchor.current.local)) / 1000)
  );

  const act = payload => {
    if (enabled) {
      onAction({ ...payload, roomId: payload.roomId || room?.id });
    }
  };

  const handleReturnLobby = () => {
    quickPlay.current = null;
    setQuickPlaying(false);
    if (room) {
      act({ kind: 'leave' });
    }
  };

  const handleQuickPlay = targetGame => {
    if (!enabled || quickPlay.current) return;
    const selectedGame = targetGame || 'tai-xiu';
    quickPlay.current = { game: selectedGame, sent: null };
    setQuickPlaying(true);
    const availableRooms = (state?.rooms || []).filter(
      r => r.game === selectedGame && !r.private && r.phase === 'waiting' && (r.occupied || 0) < (r.seats || 4)
    );
    if (availableRooms.length > 0) {
      act({ kind: 'join', roomId: availableRooms[0].id });
    } else {
      // Tự động tạo bàn mới nhanh nếu chưa có bàn
      act({
        kind: 'create',
        game: selectedGame,
        name: `Bàn ${selectedGame} #1`,
        stake: 10,
        password: '',
      });
    }
  };

  useEffect(() => {
    const intent = quickPlay.current;
    if (!intent || !enabled || room?.game !== intent.game) return;
    const next = nextQuickPlayAction(room, state?.viewerId);
    if (!next) return;
    if (next.kind === 'complete' || next.kind === 'full') {
      quickPlay.current = null;
      setQuickPlaying(false);
      if (next.kind === 'full') setVisibleMessage('Bàn đã đầy. Hãy chọn bàn khác.');
      return;
    }
    const signature = `${next.roomId}:${next.kind}`;
    if (intent.sent === signature) return;
    intent.sent = signature;
    onAction(next);
  }, [state, enabled, room, onAction]);

  useEffect(() => {
    if (message || !enabled) { quickPlay.current = null; setQuickPlaying(false); }
  }, [message, enabled]);

  useEffect(() => { casinoAudio.enabled = sound; return () => { casinoAudio.enabled = false; }; }, [sound]);

  useEffect(() => {
    if (round?.phase === 'shaking') casinoAudio.playDiceShake();
    if (round?.phase === 'reveal') casinoAudio.playBowlOpen();
    if (round?.phase === 'dealing') casinoAudio.playCardFlip();
  }, [round?.id, round?.phase]);

  const toggleSound = () => {
    if (!audio.current) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audio.current = new Context();
    }
    audio.current?.resume?.();
    setSound(v => !v);
  };

  useEffect(() => {
    anchor.current = { server: state?.serverTime || Date.now(), local: Date.now() };
  }, [state?.serverTime]);

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    focus.current?.focus();
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        if (room) handleReturnLobby();
        else onExit?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, onExit]);

  return (
    <div className="cq-root-wrapper" ref={focus} tabIndex={-1}>
      {!enabled && <div className="cq-toast-message" role="status">{!connected ? 'Mất kết nối. Bạn có thể vào bàn khi kết nối trở lại.' : 'Bạn chưa vào bên trong hội quán.'}</div>}
      {visibleMessage && <div className="cq-toast-message">{visibleMessage}</div>}

      {room ? (
        <CasinoTable
          room={room}
          state={state}
          coins={coins}
          connected={connected}
          inside={inside}
          sound={sound}
          onToggleSound={toggleSound}
          onAct={act}
          onReturnLobby={handleReturnLobby}
          seconds={seconds}
          quickPlaying={quickPlaying}
          onQuickPlay={() => handleQuickPlay(room.game)}
        />
      ) : (
        <CasinoLobby
          message={visibleMessage}
          quickPlaying={quickPlaying}
          coins={coins}
          rooms={state?.rooms || []}
          connected={connected}
          inside={inside}
          sound={sound}
          onToggleSound={toggleSound}
          onExit={onExit}
          onJoin={(roomId, password) => act({ kind: 'join', roomId, password })}
          onCreateRoom={payload => act({ kind: 'create', ...payload })}
          onQuickPlay={handleQuickPlay}
          onSelectGame={onSelectGame}
          defaultGame={defaultGame}
        />
      )}
    </div>
  );
}
