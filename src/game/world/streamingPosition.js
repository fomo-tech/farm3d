// Player world coordinates are authoritative; camera orbit must not unload scenery.
export function streamingPosition(scene) {
  const player = scene.metadata?.streamingPlayer;
  if (player && !player.isDisposed?.()) return player.getAbsolutePosition();
  const camera = scene.activeCamera;
  const locked = camera?.lockedTarget;
  return locked?.getAbsolutePosition?.() || locked?.position || camera?.target || camera?.position;
}
