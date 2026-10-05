export const VEHICLE_MOTION = {
  bike: { acceleration: 22, braking: 36, lean: 0.10, seat: 1.10, offsetZ: -0.35 },
  scooter: { acceleration: 25, braking: 42, lean: 0.13, seat: 1.03, offsetZ: -0.30 },
  tractor: { acceleration: 20, braking: 45, lean: 0.025, seat: 1.25, offsetZ: -0.55 },
  skateboard: { acceleration: 18, braking: 32, lean: 0.10, seat: 0.82, offsetZ: 0 },
  kart: { acceleration: 28, braking: 44, lean: 0.025, seat: 0.96, offsetZ: -0.28 },
  convertible: { acceleration: 24, braking: 44, lean: 0.025, seat: 1.02, offsetZ: -0.32 },
  hoverboard: { acceleration: 22, braking: 38, lean: 0.12, seat: 1.12, offsetZ: 0 },
};

export function approachVehicleSpeed(current, target, delta, profile) {
  const rate = target > current ? profile.acceleration : profile.braking;
  const step = rate * Math.min(0.1, Math.max(0, delta));
  return current + Math.sign(target - current) * Math.min(Math.abs(target - current), step);
}
