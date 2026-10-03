export function HudContextAction({ action }) {
  if (!action) return null;
  return (
    <button type="button" className="hud-context-action" onClick={action.onClick} aria-label={action.label}>
      <span className="hud-context-key" aria-hidden="true">MỞ</span>
      <span className="hud-context-copy"><strong>{action.label}</strong><small>{action.hint}</small></span>
    </button>
  );
}
