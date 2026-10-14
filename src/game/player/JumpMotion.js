export function createJumpMotion() {
  const pose={weight:0,tuck:0,landing:0};
  let wasAirborne=false;
  return {update(dt,airborne=false,velocity=0) {
    dt=Math.max(0,Math.min(.1,Number(dt)||0));
    if(wasAirborne&&!airborne) pose.landing=1;
    wasAirborne=airborne;
    pose.weight+=((airborne?1:0)-pose.weight)*(1-Math.exp(-dt*22));
    const tuck=airborne?(velocity>1?.48:velocity< -1?.18:.65):0;
    pose.tuck+=(tuck-pose.tuck)*(1-Math.exp(-dt*18));
    pose.landing*=Math.exp(-dt*13);
    return pose;
  }};
}
