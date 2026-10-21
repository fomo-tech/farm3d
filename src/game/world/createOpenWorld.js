import {createVibeCityMapSteps} from './createVibeCityMap.js';

// City-only entry point. The farm scenery and landmark builder has been removed.
export function* createOpenWorldSteps(scene,shadows,scheduler=null,options={}){
  return yield* createVibeCityMapSteps(scene,shadows);
}
export function createOpenWorld(scene,shadows){
  const steps=createOpenWorldSteps(scene,shadows);let result;
  do{result=steps.next();}while(!result.done);
  return result.value;
}
