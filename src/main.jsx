import { Component, Profiler } from 'react';
import { recordReactCommit } from './game/rendering/HudRuntime.js';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './game-ui.css';
import './components/CompactGameHud.css';
import './game/rendering/RuntimeAudit.js';

window.__farmDebug?.mark('React entry executing');

class GameErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    window.__farmDebug?.report(`${error?.stack || error}\n${info?.componentStack || ''}`, 'REACT RENDER ERROR');
  }

  render() {
    if (this.state.error) {
      return (
        <div className="game-fatal-screen" role="alert">
          <h1>Game gặp lỗi</h1>
          <p>{this.state.error.message || String(this.state.error)}</p>
          <p>Chi tiết lỗi đã hiện trong bảng chẩn đoán trên màn hình.</p>
          <button type="button" onClick={() => window.location.reload()}>Tải lại game</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <GameErrorBoundary><Profiler id="Game HUD" onRender={recordReactCommit}><App /></Profiler></GameErrorBoundary>,
);

window.__farmDebug?.mark('React mounted');
