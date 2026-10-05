import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { createSocialVehicle } from './createSocialVehicle.js';
import { VEHICLES } from '../../../shared/vehicleConfig.js';
import { VEHICLE_MOTION } from './vehicleMotion.js';

/**
 * Tạo hệ thống phương tiện đồ chơi 3D cho người chơi phong cách Play Together
 * (Ván trượt Skateboard, Scooter điện Chibi, Xe đạp giỏ hoa, Máy cày nông trại)
 */
export function createVehicleRigs(scene, parentNode, shadows) {
  const materialSpecs = {
    bikeFrame: [VEHICLES.bike.color, { specularPower: 64, specularLevel: 0.25 }],
    bikeMetal: ['#e2e8f0', { specularPower: 96, specularLevel: 0.6 }],
    tire: ['#1e293b', { specularPower: 32 }],
    whiteWall: ['#b7c2c8', { specularPower: 64, specularLevel: 0.2 }],
    rim: ['#8799a4', { specularPower: 80, specularLevel: 0.35 }],
    scooterBody: [VEHICLES.scooter.color, { specularPower: 64, specularLevel: 0.25 }],
    scooterSeat: ['#303d46'],
    tractorBody: [VEHICLES.tractor.color, { specularPower: 64, specularLevel: 0.25 }],
    tractorSeat: ['#334155'],
    headlight: ['#e5edf0', { specularPower: 64, specularLevel: 0.2 }],
    skateDeck: [VEHICLES.skateboard.color, { specularPower: 48, specularLevel: 0.15 }],
    skateStripe: ['#bf7845'],
    neonWheel: ['#709dad', { specularPower: 64, specularLevel: 0.2 }],
  };
  const materials = new Proxy({}, {
    get(target, key) {
      if (!Object.hasOwn(target, key) && Object.hasOwn(materialSpecs, key)) {
        const [color, options] = materialSpecs[key];
        target[key] = createToyMaterial(scene, `veh-toy-${key}`, color, options);
      }
      return target[key];
    },
  });

  const rigContainer = new TransformNode('player-vehicle-container', scene);
  rigContainer.parent = parentNode;

  let currentVehicleId = 'walk';
  let activeVehicleNode = null;
  let rotatingWheels = [];
  let steeringPivots = [];
  let elapsed = 0;
  let wheelContacts = [];
  const cache = new Map();
  const riderOffset = { height: 0, lean: 0 };

  return {
    setVehicle(vehicleId) {
      vehicleId = Object.hasOwn(VEHICLES, vehicleId) ? vehicleId : 'walk';
      if (currentVehicleId === vehicleId) return;
      if (activeVehicleNode) activeVehicleNode.setEnabled(false);
      currentVehicleId = vehicleId;
      activeVehicleNode = null;
      rotatingWheels = [];
      steeringPivots = [];
      wheelContacts = [];
      riderOffset.height = 0;
      riderOffset.lean = 0;
      if (vehicleId === 'walk') {
        cache.forEach(entry => entry.node.dispose());
        cache.clear();
        return;
      }
      const cached = cache.get(vehicleId);
      if (cached) {
        activeVehicleNode = cached.node;
        rotatingWheels = cached.wheels;
        steeringPivots = cached.steering;
        wheelContacts = cached.contacts;
        riderOffset.height = activeVehicleNode.position.y;
        riderOffset.lean = activeVehicleNode.rotation.z;
        activeVehicleNode.setEnabled(true);
        cache.delete(vehicleId);
        cache.set(vehicleId, cached);
        return;
      }

      if (['kart', 'convertible', 'hoverboard'].includes(vehicleId)) {
        activeVehicleNode = createSocialVehicle(scene, vehicleId, rigContainer, materials, rotatingWheels, steeringPivots);
      } else if (vehicleId === 'skateboard') {
        // ==========================================
        // 0. CHIBI PLAY TOGETHER SKATEBOARD
        // ==========================================
        const board = new TransformNode('vehicle-skateboard-root', scene);
        board.parent = rigContainer;

        // Ván trượt bo cong 2 đầu (Curved Pop-art Deck)
        const deck = MeshBuilder.CreateBox('skate-deck', { width: 0.58, height: 0.07, depth: 1.45 }, scene);
        deck.position.set(0, 0.22, 0);
        deck.material = materials.skateDeck;
        deck.parent = board;

        // Sọc tem đua hoạt hình nổi bật trên mặt ván
        const stripe = MeshBuilder.CreateBox('skate-stripe', { width: 0.16, height: 0.08, depth: 1.35 }, scene);
        stripe.position.set(0, 0.225, 0);
        stripe.material = materials.skateStripe;
        stripe.parent = board;

        // Mũi và đuôi ván uốn cong lên (Kicktail)
        [-0.7, 0.7].forEach((kz, i) => {
          const kick = MeshBuilder.CreateBox(`skate-kick-${i}`, { width: 0.54, height: 0.07, depth: 0.22 }, scene);
          kick.position.set(0, 0.26, kz);
          kick.rotation.x = kz > 0 ? 0.32 : -0.32;
          kick.material = materials.skateDeck;
          kick.parent = board;
        });

        // 2 Trục bánh xe (Trucks)
        [-0.45, 0.45].forEach((tz, i) => {
          const truck = MeshBuilder.CreateCylinder(`skate-truck-${i}`, { height: 0.62, diameter: 0.05 }, scene);
          truck.rotation.z = Math.PI / 2;
          truck.position.set(0, 0.14, tz);
          truck.material = materials.rim;
          truck.parent = board;
        });

        // 4 Bánh xe phát quang Neon (Cyan Glowing Wheels)
        [-0.28, 0.28].forEach((wx, xi) => {
          [-0.45, 0.45].forEach((wz, zi) => {
            const wNode = new TransformNode(`skate-wheel-node-${xi}-${zi}`, scene);
            wNode.position.set(wx, 0.14, wz);
            wNode.parent = board;

            const wheel = MeshBuilder.CreateCylinder(`skate-wheel-${xi}-${zi}`, {
              height: 0.14,
              diameter: 0.26,
              tessellation: 12,
            }, scene);
            wheel.rotation.z = Math.PI / 2;
            wheel.material = materials.neonWheel;
            wheel.parent = wNode;

            rotatingWheels.push(wNode);
          });
        });

        activeVehicleNode = board;
      } else if (vehicleId === 'bike') {
        // ==========================================
        // 1. CHIBI CRUISER BICYCLE WITH FLOWER BASKET
        // ==========================================
        const bike = new TransformNode('vehicle-bike-root', scene);
        bike.parent = rigContainer;

        // Khung cong bo tròn mềm mại phong cách Chibi
        const framePoints = [new Vector3(0, .44, -.65), new Vector3(0, .44, -.10), new Vector3(0, .90, -.32), new Vector3(0, .96, .46), new Vector3(0, .44, .65)];
        [[0,1],[0,2],[1,2],[2,3],[1,3],[3,4]].forEach(([a,b], index) => {
          const tube = MeshBuilder.CreateTube(`bike-trail-frame-${index}`, { path: [framePoints[a], framePoints[b]], radius: 0.045, tessellation: 10 }, scene);
          tube.material = materials.bikeFrame; tube.parent = bike;
        });

        // Cột yên & Yên da nâu bo phồng
        const seatPost = MeshBuilder.CreateCylinder('bike-seat-post', { height: 0.5, diameter: 0.06 }, scene);
        seatPost.position.set(0, 0.85, -0.35);
        seatPost.material = materials.bikeMetal;
        seatPost.parent = bike;

        const saddle = MeshBuilder.CreateSphere('bike-saddle-plump', {
          diameterX: 0.42,
          diameterY: 0.18,
          diameterZ: 0.48,
          segments: 8,
        }, scene);
        saddle.position.set(0, 1.08, -0.38);
        saddle.material = materials.scooterSeat;
        saddle.parent = bike;

        // Ghi-đông & Tay lái có chuông xe nhỏ xinh
        const barStem = MeshBuilder.CreateCylinder('bike-bar-stem', { height: 0.65, diameter: 0.06 }, scene);
        barStem.position.set(0, 0.95, 0.5);
        barStem.material = materials.bikeMetal;
        barStem.parent = bike;

        const bar = MeshBuilder.CreateCylinder('bike-bar', { height: 0.82, diameter: 0.05 }, scene);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 1.25, 0.5);
        bar.material = materials.bikeMetal;
        bar.parent = bike;

        const bikeLight = MeshBuilder.CreateBox('bike-trail-light', { width: .18, height: .10, depth: .10 }, scene);
        bikeLight.position.set(0, 1.10, .59); bikeLight.material = materials.headlight; bikeLight.parent = bike;
        const rack = MeshBuilder.CreateBox('bike-rear-rack', { width: .30, height: .04, depth: .38 }, scene);
        rack.position.set(0, .94, -.64); rack.material = materials.tire; rack.parent = bike;

        // 2 Bánh xe lốp viền trắng (White-wall Tires)
        function createChibiBikeWheel(isFront) {
          const zPos = isFront ? 0.72 : -0.72;
          const wheelNode = new TransformNode(`bike-wheel-${isFront ? 'f' : 'r'}`, scene);
          wheelNode.position.set(0, 0.42, zPos);
          wheelNode.parent = bike;

          const tire = MeshBuilder.CreateTorus(`bike-tire-${isFront ? 'f' : 'r'}`, {
            diameter: 0.84,
            thickness: 0.1,
            tessellation: 18,
          }, scene);
          tire.rotation.z = Math.PI / 2;
          tire.material = materials.tire;
          tire.parent = wheelNode;

          const rim = MeshBuilder.CreateCylinder(`bike-rim-${isFront ? 'f' : 'r'}`, {
            height: 0.12,
            diameter: 0.5,
          }, scene);
          rim.rotation.z = Math.PI / 2;
          rim.material = materials.bikeFrame;
          rim.parent = wheelNode;

          // Visible spokes make rotation readable instead of a featureless disc.
          for (let spoke = 0; spoke < 6; spoke++) {
            const bar = MeshBuilder.CreateBox(`bike-spoke-${isFront}-${spoke}`, { width: 0.15, height: 0.025, depth: 0.66 }, scene);
            bar.rotation.x = spoke * Math.PI / 6;
            bar.material = materials.rim;
            bar.parent = wheelNode;
          }

          return wheelNode;
        }

        const frontWheel = createChibiBikeWheel(true);
        const rearWheel = createChibiBikeWheel(false);
        rotatingWheels.push(frontWheel, rearWheel);

        activeVehicleNode = bike;
      } else if (vehicleId === 'scooter') {
        // ==========================================
        // 2. CHIBI PASTEL ELECTRIC SCOOTER (Play Together Iconic Vespa)
        // ==========================================
        const scooter = new TransformNode('vehicle-scooter-root', scene);
        scooter.parent = rigContainer;

        // Thân xe bo tròn múp míp hình con nhộng (Bubbly Capsule Body)
        const shell = MeshBuilder.CreateSphere('scooter-bubbly-shell', {
          diameterX: 0.78,
          diameterY: 0.68,
          diameterZ: 1.6,
          segments: 12,
        }, scene);
        shell.position.set(0, 0.56, -0.15);
        shell.material = materials.scooterBody;
        shell.parent = scooter;

        // Yếm chắn gió trước uốn cong tròn như đôi cánh bướm
        const fairing = MeshBuilder.CreateSphere('scooter-fairing-curved', {
          diameterX: 0.88,
          diameterY: 0.85,
          diameterZ: 0.28,
          segments: 10,
        }, scene);
        fairing.position.set(0, 0.82, 0.68);
        fairing.rotation.x = -0.22;
        fairing.material = materials.scooterBody;
        fairing.parent = scooter;

        // Đèn pha mắt tròn xoe to bản (Oversized Chibi Headlight)
        const headlight = MeshBuilder.CreateSphere('scooter-chibi-headlight', {
          diameter: 0.38,
          segments: 10,
        }, scene);
        headlight.position.set(0, 1.25, 0.78);
        headlight.material = materials.headlight;
        headlight.parent = scooter;

        const handlebar = MeshBuilder.CreateCylinder('scooter-handlebar', { height: 0.86, diameter: 0.07, tessellation: 12 }, scene);
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 1.25, 0.58);
        handlebar.material = materials.bikeMetal;
        handlebar.parent = scooter;
        for (const x of [-0.36, 0.36]) {
          const grip = MeshBuilder.CreateCylinder(`scooter-grip-${x}`, { height: 0.18, diameter: 0.10, tessellation: 12 }, scene);
          grip.rotation.z = Math.PI / 2;
          grip.position.set(x, 1.25, 0.58);
          grip.material = materials.scooterSeat;
          grip.parent = scooter;
        }

        // Gương chiếu hậu tròn 2 bên tay lái
        [-0.42, 0.42].forEach((mx, i) => {
          const mirror = MeshBuilder.CreateCylinder(`scooter-mirror-${i}`, {
            height: 0.04,
            diameter: 0.18,
            tessellation: 10,
          }, scene);
          mirror.position.set(mx, 1.38, 0.58);
          mirror.rotation.x = Math.PI / 4;
          mirror.material = materials.rim;
          mirror.parent = scooter;
        });

        // Yên xe da nâu bo phồng êm ái
        const seat = MeshBuilder.CreateSphere('scooter-plump-seat', {
          diameterX: 0.55,
          diameterY: 0.22,
          diameterZ: 0.88,
          segments: 8,
        }, scene);
        seat.position.set(0, 0.95, -0.32);
        seat.material = materials.scooterSeat;
        seat.parent = scooter;

        // 2 Bánh xe mâm đúc trắng sữa dày dặn
        [-0.72, 0.72].forEach((wz, i) => {
          const wNode = new TransformNode(`scooter-wheel-node-${i}`, scene);
          wNode.position.set(0, 0.32, wz);
          wNode.parent = scooter;

          const tire = MeshBuilder.CreateCylinder(`scooter-tire-${i}`, {
            height: 0.24,
            diameter: 0.64,
            tessellation: 16,
          }, scene);
          tire.rotation.z = Math.PI / 2;
          tire.material = materials.tire;
          tire.parent = wNode;

          const wheelCover = MeshBuilder.CreateCylinder(`scooter-cover-${i}`, {
            height: 0.26,
            diameter: 0.42,
          }, scene);
          wheelCover.rotation.z = Math.PI / 2;
          wheelCover.material = materials.whiteWall;
          wheelCover.parent = wNode;
          const accent = MeshBuilder.CreateBox(`scooter-wheel-accent-${i}`, { width: 0.27, height: 0.035, depth: 0.32 }, scene);
          accent.material = materials.scooterBody;
          accent.parent = wNode;

          rotatingWheels.push(wNode);
        });

        activeVehicleNode = scooter;
      } else if (vehicleId === 'tractor') {
        // ==========================================
        // 3. CLASSIC RED FARM TRACTOR 3D MODEL
        // ==========================================
        const tractor = new TransformNode('vehicle-tractor-root', scene);
        tractor.parent = rigContainer;

        // Engine Hood / Body
        const hood = MeshBuilder.CreateBox('tractor-hood', { width: 1.35, height: 0.95, depth: 1.85 }, scene);
        hood.position.set(0, 0.85, 0.45);
        hood.material = materials.tractorBody;
        hood.parent = tractor;

        const bumper = MeshBuilder.CreateBox('tractor-front-bumper', { width: 1.5, height: 0.18, depth: 0.18 }, scene);
        bumper.position.set(0, 0.48, 1.43);
        bumper.material = materials.bikeMetal;
        bumper.parent = tractor;
        for (const x of [-0.43, 0.43]) {
          const lamp = MeshBuilder.CreateSphere(`tractor-front-lamp-${x}`, { diameter: 0.22, segments: 12 }, scene);
          lamp.position.set(x, 1.05, 1.39);
          lamp.material = materials.headlight;
          lamp.parent = tractor;
        }

        // Vertical Exhaust Pipe with Flapper
        const exhaust = MeshBuilder.CreateCylinder('tractor-exhaust-pipe', { height: 1.35, diameter: 0.14 }, scene);
        exhaust.position.set(0.48, 1.65, 0.85);
        exhaust.material = materials.bikeMetal;
        exhaust.parent = tractor;

        // Metal Operator Seat
        const seat = MeshBuilder.CreateBox('tractor-seat', { width: 0.65, height: 0.16, depth: 0.65 }, scene);
        seat.position.set(0, 1.15, -0.55);
        seat.material = materials.tractorSeat;
        seat.parent = tractor;

        // Steering Wheel
        const wheelBar = MeshBuilder.CreateCylinder('tractor-steer-shaft', { height: 0.65, diameter: 0.08 }, scene);
        wheelBar.rotation.x = -0.55;
        wheelBar.position.set(0, 1.3, -0.15);
        wheelBar.material = materials.bikeMetal;
        wheelBar.parent = tractor;

        const steerRing = MeshBuilder.CreateTorus('tractor-steer-wheel', { diameter: 0.52, thickness: 0.06 }, scene);
        steerRing.rotation.x = 0.55;
        steerRing.position.set(0, 1.55, -0.28);
        steerRing.material = materials.tractorSeat;
        steerRing.parent = tractor;

        // 2 Big Rear Wheels with Deep Cleats
        [-0.85, 0.85].forEach((wx, i) => {
          const rearNode = new TransformNode(`tractor-rear-wheel-node-${i}`, scene);
          rearNode.position.set(wx, 0.75, -0.55);
          rearNode.parent = tractor;

          const tire = MeshBuilder.CreateCylinder(`tractor-rear-tire-${i}`, {
            height: 0.45,
            diameter: 1.5,
            tessellation: 16,
          }, scene);
          tire.rotation.z = Math.PI / 2;
          tire.material = materials.tire;
          tire.parent = rearNode;
          const hub = MeshBuilder.CreateCylinder(`tractor-rear-hub-${i}`, { height: 0.48, diameter: 0.66, tessellation: 12 }, scene);
          hub.rotation.z = Math.PI / 2;
          hub.material = materials.tractorBody;
          hub.parent = rearNode;
          const spoke = MeshBuilder.CreateBox(`tractor-rear-spoke-${i}`, { width: 0.49, height: 0.065, depth: 0.48 }, scene);
          spoke.material = materials.rim;
          spoke.parent = rearNode;

          rotatingWheels.push(rearNode);
        });

        // 2 Small Front Steering Wheels
        [-0.62, 0.62].forEach((wx, i) => {
          const frontNode = new TransformNode(`tractor-front-wheel-node-${i}`, scene);
          frontNode.position.set(wx, 0.45, 1.15);
          frontNode.parent = tractor;

          const tire = MeshBuilder.CreateCylinder(`tractor-front-tire-${i}`, {
            height: 0.28,
            diameter: 0.85,
            tessellation: 14,
          }, scene);
          tire.rotation.z = Math.PI / 2;
          tire.material = materials.tire;
          tire.parent = frontNode;

          rotatingWheels.push(frontNode);
        });

        activeVehicleNode = tractor;
      }
      // Tire contact comes from geometry, including torus tube thickness.
      // Save it once; no vertex/bounding-box scans in the render loop.
      wheelContacts = rotatingWheels.map(wheel => {
        const tire = wheel.getChildMeshes().find(mesh => /tire|skate-wheel/.test(mesh.name));
        const bounds = tire.getBoundingInfo().boundingBox;
        const halfWidth = (bounds.maximum.y - bounds.minimum.y) / 2;
        const radius = Math.max(bounds.maximum.x - bounds.minimum.x, bounds.maximum.z - bounds.minimum.z) / 2;
        const center = wheel.parent === activeVehicleNode ? wheel.position : wheel.parent.position;
        return { x: center.x, y: center.y, radius, halfWidth };
      });
      const contactLift = Math.max(0, ...wheelContacts.map(contact => contact.radius - contact.y));
      activeVehicleNode.position.y = contactLift;
      riderOffset.height = contactLift;
      cache.set(vehicleId, { node: activeVehicleNode, wheels: rotatingWheels, steering: steeringPivots, contacts: wheelContacts });
      // At most the active vehicle and one recently-used vehicle stay resident.
      while (cache.size > 2) {
        const oldest = cache.keys().next().value;
        cache.get(oldest).node.dispose();
        cache.delete(oldest);
      }
    },

    update(delta, isMoving, speed, turn = 0) {
      if (!activeVehicleNode) return;
      elapsed += delta;
      const lean = VEHICLE_MOTION[currentVehicleId]?.lean || 0.10;
      const targetLean = isMoving ? -Math.max(-1, Math.min(1, turn)) * lean : 0;
      activeVehicleNode.rotation.z += (targetLean - activeVehicleNode.rotation.z) * (1 - Math.exp(-12 * delta));
      if (currentVehicleId === 'hoverboard') {
        activeVehicleNode.position.y = Math.sin(elapsed * 2.8) * 0.055;
      } else {
        const sin = Math.sin(activeVehicleNode.rotation.z), cos = Math.cos(activeVehicleNode.rotation.z);
        let lift = 0;
        for (const contact of wheelContacts) lift = Math.max(lift,
          contact.radius * Math.abs(cos) + contact.halfWidth * Math.abs(sin) - contact.x * sin - contact.y * cos);
        // Suspension may lift the body, never push a tire below the surface.
        activeVehicleNode.position.y = lift + (isMoving ? (1 + Math.sin(elapsed * 12)) * 0.006 : 0);
      }
      riderOffset.height = activeVehicleNode.position.y;
      riderOffset.lean = activeVehicleNode.rotation.z;
      steeringPivots.forEach(pivot => {
        const steering = isMoving ? Math.max(-0.35, Math.min(0.35, turn)) : 0;
        pivot.rotation.y += (steering - pivot.rotation.y) * (1 - Math.exp(-12 * delta));
      });
      if (isMoving) {
        rotatingWheels.forEach(w => {
          // Distance / radius: small wheels spin faster than large ones.
          w.rotation.x += delta * speed / Math.max(0.13, w.metadata?.radius || w.position.y);
        });
      }
    },

    getVehicleId() {
      return currentVehicleId;
    },
    getRiderOffset() {
      return riderOffset;
    },

    hasVehicle() {
      return currentVehicleId !== 'walk' && activeVehicleNode !== null;
    },
    dispose() {
      rigContainer.dispose();
      Object.values(materials).forEach(material => material.dispose());
      activeVehicleNode = null;
      rotatingWheels = [];
      cache.clear();
    },
  };
}
