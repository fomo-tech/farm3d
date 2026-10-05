const TAU=Math.PI*2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// Phase is integrated, never derived from time * speed: changing pace must
// not teleport the limbs into a different point in their stride.
export function createLocomotionGait() {
  const pose={phase:0,weight:0,run:0,hips:[0,0],knees:[0,0],arms:[0,0],elbows:[-.08,-.08],bob:0,sway:0,roll:0,twist:0,lean:0};
  return {
    update(delta,moving,speed) {
      const dt=clamp(Number(delta)||0,0,.1);
      const velocity=moving?clamp(Number(speed)||0,0,15):0;
      const weight=velocity>.05?1:0;
      pose.weight+=(weight-pose.weight)*(1-Math.exp(-dt*18));
      const targetRun=clamp((velocity-7.2)/2.0,0,1);
      pose.run+=(targetRun-pose.run)*(1-Math.exp(-dt*10));
      const cadence=(1.65+.45*pose.run)*clamp(velocity/7,.25,1.2);
      pose.phase=(pose.phase+TAU*cadence*dt*pose.weight)%TAU;
      const stride=(.44+.30*pose.run)*pose.weight*clamp(velocity/7,.35,1.15);
      for(let i=0;i<2;i++) {
        const phase=pose.phase+i*Math.PI;
        const swing=Math.max(0,Math.sin(phase));
        pose.hips[i]=Math.cos(phase)*stride;
        // Keep the supporting leg straight; bend only the recovering leg.
        pose.knees[i]=Math.pow(swing,1.5)*(.50+.65*pose.run)*pose.weight;
        pose.arms[i]=-Math.cos(phase)*(.27+.20*pose.run)*pose.weight;
        pose.elbows[i]=-.08-(.10+.62*pose.run+Math.max(0,-Math.cos(phase))*.10)*pose.weight;
      }
      // Ground-contact height is solved from the blended supporting leg in
      // buildHumanMesh. A positive sine lift here made both feet hover.
      pose.bob=0;
      pose.sway=Math.sin(pose.phase)*.014*pose.weight;
      pose.roll=Math.sin(pose.phase)*.023*pose.weight;
      pose.twist=Math.sin(pose.phase)*(.045+.035*pose.run)*pose.weight;
      pose.lean=(.025+.12*pose.run)*pose.weight;
      return pose;
    },
  };
}
