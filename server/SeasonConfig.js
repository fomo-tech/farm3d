// Add future event definitions here; unknown event IDs stay inactive.
export const EVENT_DEFINITIONS = Object.freeze({
 halloween: {start: '10-20', end: '11-03'},
});

// Dev controls: EVENT=none | halloween | auto. End dates are exclusive.
export function worldEvent(now=Date.now(),env=process.env){
 const selected=(env.EVENT||'none').trim().toLowerCase();
 const year=new Date(now+7*3600000).getUTCFullYear();
 const inSchedule=([id,definition])=>{
  const start=Date.parse(env.EVENT_START||`${year}-${definition.start}T00:00:00+07:00`);
  const end=Date.parse(env.EVENT_END||`${year}-${definition.end}T00:00:00+07:00`);
  return Number.isFinite(start)&&Number.isFinite(end)&&end>start&&now>=start&&now<end;
 };
 const id=selected==='auto'
  ? Object.entries(EVENT_DEFINITIONS).find(inSchedule)?.[0]
  : Object.hasOwn(EVENT_DEFINITIONS,selected)?selected:null;
 return {id:id||'none',active:Boolean(id),revision:1};
}
