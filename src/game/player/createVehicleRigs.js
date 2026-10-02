import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Tạo hệ thống phương tiện đồ chơi 3D cho người chơi phong cách Play Together
 * (Ván trượt Skateboard, Scooter điện Chibi, Xe đạp giỏ hoa, Máy cày nông trại)
 */
export function createVehicleRigs(scene, parentNode, shadows) {
  const materials = {
    bikeFrame: createToyMaterial(scene, 'veh-toy-bike-frame', PLAY_TOGETHER_PALETTE.pastels.strawberryPink, { specularPower: 80 }),
    bikeMetal: createToyMaterial(scene, 'veh-toy-bike-metal', '#e2e8f0', { specularPower: 96, specularLevel: 0.6 }),
    basket: createToyMaterial(scene, 'veh-toy-basket', PLAY_TOGETHER_PALETTE.farm.honeyWood),
    tire: createToyMaterial(scene, 'veh-toy-tire-rubber', '#1e293b', { specularPower: 32 }),
    whiteWall: createToyMaterial(scene, 'veh-toy-whitewall', PLAY_TOGETHER_PALETTE.farm.fenceWhite, { specularPower: 80 }),
    rim: createToyMaterial(scene, 'veh-toy-rim-chrome', '#f8fafc', { specularPower: 110, specularLevel: 0.7 }),
    scooterBody: createToyMaterial(scene, 'veh-toy-scooter-mint', PLAY_TOGETHER_PALETTE.pastels.mintGreen, { specularPower: 96, specularLevel: 0.55 }),
    scooterSeat: createToyMaterial(scene, 'veh-toy-scooter-seat', PLAY_TOGETHER_PALETTE.farm.caramelWood),
    tractorBody: createToyMaterial(scene, 'veh-toy-tractor-body', '#ef4444', { specularPower: 80 }),
    tractorSeat: createToyMaterial(scene, 'veh-toy-tractor-seat', '#334155'),
    headlight: createToyMaterial(scene, 'veh-toy-headlight', '#fffbeb', { emissiveHex: '#facc15', specularPower: 128 }),
    skateDeck: createToyMaterial(scene, 'veh-toy-skate-deck', PLAY_TOGETHER_PALETTE.pastels.bananaYellow, { specularPower: 80 }),
    skateStripe: createToyMaterial(scene, 'veh-toy-skate-stripe', PLAY_TOGETHER_PALETTE.pastels.strawberryPink),
    neonWheel: createToyMaterial(scene, 'veh-toy-neon-wheel', '#38bdf8', { emissiveHex: '#0ea5e9', specularPower: 128 }),
    daisyPetal: createToyMaterial(scene, 'veh-toy-daisy-petal', '#ffffff'),
    daisyCenter: createToyMaterial(scene, 'veh-toy-daisy-center', '#facc15', { emissiveHex: '#fbbf24' }),
  };

  const rigContainer = new TransformNode('player-vehicle-container', scene);
  rigContainer.parent = parentNode;

  let currentVehicleId = 'walk';
  let activeVehicleNode = null;
  let rotatingWheels = [];

  return {
    setVehicle(vehicleId) {
      if (currentVehicleId === vehicleId && activeVehicleNode) return;
      currentVehicleId = vehicleId;

      if (activeVehicleNode) {
        activeVehicleNode.dispose();
        activeVehicleNode = null;
        rotatingWheels = [];
      }

      if (vehicleId === 'skateboard') {
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
        const frameTube = MeshBuilder.CreateTorus('bike-curved-frame', {
          diameter: 1.1,
          thickness: 0.08,
          tessellation: 18,
        }, scene);
        frameTube.rotation.z = Math.PI / 2;
        frameTube.position.set(0, 0.68, -0.05);
        frameTube.material = materials.bikeFrame;
        frameTube.parent = bike;

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

        // Giỏ hoa mây phía trước
        const basket = MeshBuilder.CreateBox('bike-basket', { width: 0.5, height: 0.35, depth: 0.35 }, scene);
        basket.position.set(0, 1.05, 0.72);
        basket.material = materials.basket;
        basket.parent = bike;

        // Bông hoa cúc trong giỏ
        [-0.12, 0.12].forEach((fx, i) => {
          const flwCore = MeshBuilder.CreateSphere(`basket-flw-${i}`, { diameter: 0.12, segments: 6 }, scene);
          flwCore.position.set(fx, 1.25, 0.72);
          flwCore.material = materials.daisyCenter;
          flwCore.parent = bike;
        });

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
          tire.material = materials.whiteWall;
          tire.parent = wheelNode;

          const rim = MeshBuilder.CreateCylinder(`bike-rim-${isFront ? 'f' : 'r'}`, {
            height: 0.12,
            diameter: 0.5,
          }, scene);
          rim.rotation.z = Math.PI / 2;
          rim.material = materials.bikeFrame;
          rim.parent = wheelNode;

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
    },

    update(delta, isMoving, speed) {
      if (!activeVehicleNode || rotatingWheels.length === 0) return;
      if (isMoving) {
        const rotAmount = delta * speed * 2.2;
        rotatingWheels.forEach(w => {
          w.rotation.x += rotAmount;
        });
      }
    },

    getVehicleId() {
      return currentVehicleId;
    },

    hasVehicle() {
      return currentVehicleId !== 'walk' && activeVehicleNode !== null;
    },
  };
}
