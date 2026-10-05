export function vehicleCollisionRadius(id) {
  return ({bike:1.22,scooter:1.18,tractor:1.85,kart:1.30,convertible:1.70,skateboard:.85,hoverboard:.95})[id] || .45;
}
