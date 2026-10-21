export function stepCityDriving(current,yaw,throttle,steering,brake,delta,maxSpeed=18){
 if(!Number.isFinite(maxSpeed)||maxSpeed<=0)return {speed:0,yaw};
 const dt=Math.min(.1,Math.max(0,delta)),input=Math.max(-1,Math.min(1,throttle));
 const opposing=current*input<0&&Math.abs(current)>.3;
 const target=brake||opposing?0:input>0?input*maxSpeed:input<0?input*5:0;
 const rate=brake?25:opposing?16:input===0?3:8;
 const speed=current+Math.sign(target-current)*Math.min(Math.abs(target-current),rate*dt);
 const wheel=Math.max(-1,Math.min(1,steering))*.5/(1+Math.abs(speed)*.08);
 return {speed,yaw:yaw+Math.tan(wheel)*speed/3*dt};
}
