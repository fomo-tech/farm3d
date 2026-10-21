// Shared interaction rule; speed is measured in world metres/second.
export function canExitCityVehicle(speed){
 return Number.isFinite(speed)&&Math.abs(speed)<=.5;
}
