import React, { useEffect, useRef, useState } from 'react';
import { CasinoLobby } from './casino/CasinoLobby.jsx';
import { CasinoTable } from './casino/CasinoTable.jsx';
import './casino.css';

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
    if (room) {
      act({ kind: 'leave' });
    }
  };

  const handleQuickPlay = targetGame => {
    const selectedGame = targetGame || 'tai-xiu';
    const availableRooms = (state?.rooms || []).filter(
      r => r.game === selectedGame && !r.private && (r.occupied || 0) < (r.seats || 4)
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
      {message && <div className="cq-toast-message">{message}</div>}

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
        />
      ) : (
        <CasinoLobby
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
