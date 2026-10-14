const clamp = value => Math.max(0, Math.min(1, value));
export const smoothstep = value => { const t=clamp(value); return t*t*(3-2*t); };
// Authored timing: anticipation, contact/hold, and recovery. These are our
// original clips, not extracted animation data from another game.
const profiles = {
  till: [[0,0],[.32,.4],[.48,.55],[.64,.7],[1,1]],
  water: [[0,0],[.22,.3],[.72,.65],[1,1]],
  seed: [[0,0],[.22,.2],[.48,.45],[.72,.72],[1,1]],
  harvest: [[0,0],[.3,.35],[.42,.4],[.72,.72],[1,1]],
  feed: [[0,0],[.28,.38],[.62,.58],[1,1]],
  collect: [[0,0],[.28,.35],[.64,.62],[1,1]],
  wave: [[0,0],[.18,.25],[.82,.75],[1,1]],
  fashion_pose: [[0,0],[.2,.42],[.78,.58],[1,1]],
  heart_pose: [[0,0],[.23,.43],[.78,.57],[1,1]],
  cheer: [[0,0],[.16,.2],[.84,.8],[1,1]],
  shy: [[0,0],[.24,.4],[.76,.6],[1,1]],
  spin: [[0,0],[.16,.08],[.82,.93],[1,1]],
  cast: [[0,0],[.3,.38],[.52,.66],[1,1]],
  reel: [[0,0],[.15,.1],[.88,.9],[1,1]],
  catch: [[0,0],[.22,.2],[.7,.82],[1,1]],
};
profiles.hoe=profiles.till;
profiles.celebrate=profiles.harvest;
export const ACTION_MOTION_PROFILES=Object.freeze(profiles);
export const ACTION_CONTACT=Object.freeze({till:.48,hoe:.48,water:.22,seed:.48,harvest:.3,celebrate:.3,feed:.46,collect:.5});
export function actionMotionProgress(action, progress) {
  const t=clamp(progress), keys=profiles[action];
  if (!keys) return smoothstep(t);
  for (let i=1;i<keys.length;i++) {
    const [end,value]=keys[i], [start,previous]=keys[i-1];
    if (t<=end) return previous+(value-previous)*smoothstep((t-start)/(end-start));
  }
  return 1;
}
export function actionEnvelope(progress) {
  return smoothstep(progress/.14)*smoothstep((1-progress)/.18);
}
