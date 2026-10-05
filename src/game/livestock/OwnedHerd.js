import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { FARM_CONFIG } from '../../../shared/farmConfig.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Đàn Gia Súc Nông Trại Chăn Nuôi 3D (Lively Chibi Livestock Herd)
 * Phong cách: Casual Low-Poly Chibi / Cutecore / Play Together
 * - Loại bỏ hoàn toàn các mesh hộp thô kệch, chuồng chuồng chó tù túng, vách ngăn dư thừa
 * - Các bé thú được dàn trải tự nhiên trong khuôn viên thoáng đãng, không đứng xếp hàng đơ cứng
 * - Hoạt ảnh sống động: lạch bạch waddle, ngoe nguẩy đuôi xoắn, gật gù ăn cỏ, mắt long lanh có đốm sáng anime
 * - Đệm rơm/ổ trứng siêu tối giản phẳng sàn, giữ trọn 100% không gian thoáng đãng ("trống trải")
 */
export class OwnedHerd {
  constructor(scene, parent) {
    this.scene = scene;
    this.root = new TransformNode('owned-herd', scene);
    this.root.parent = parent;
    this.members = new Map();
    this.pens = new Map();
    this.time = 0;

    // Render loop với hoạt ảnh chibi tự nhiên
    this.observer = scene.onBeforeRenderObservable.add(() => {
      if (!this.root.isEnabled()) return;
      const dt = Math.min(0.05, scene.getEngine().getDeltaTime() / 1000);
      this.time += dt;

      for (const [key, member] of this.members) {
        const speed = member.walkSpeed || 0.6;
        const angle = this.time * speed + member.phase;

        // Quỹ đạo di chuyển hình elip tự nhiên quanh vị trí trung tâm của từng bé
        const dx = Math.sin(angle) * member.rx;
        const dz = Math.cos(angle * 1.1) * member.rz;
        member.root.position.x = member.baseX + dx;
        member.root.position.z = member.baseZ + dz;

        // Xoay hướng nhìn theo chiều chuyển động mượt mà
        const vx = Math.cos(angle) * member.rx;
        const vz = -Math.sin(angle * 1.1) * 1.1 * member.rz;
        if (Math.hypot(vx, vz) > 0.01) {
          member.root.rotation.y = Math.atan2(vx, vz);
        }

        // Nhấp nhô bước chân / lạch bạch waddle đáng yêu
        const bounceFreq = member.isBird ? 5.5 : 3.8;
        const bounce = Math.abs(Math.sin(this.time * bounceFreq + member.phase)) * (member.isBird ? 0.045 : 0.025);
        member.root.position.y = member.baseY + bounce;

        // Chim/vịt lắc lư hai bên (waddle roll) & vỗ cánh nhẹ
        if (member.isBird) {
          member.root.rotation.z = Math.sin(this.time * bounceFreq + member.phase) * 0.12;
          if (member.wings) {
            member.wings[0].rotation.z = -0.15 - Math.abs(Math.sin(this.time * bounceFreq + member.phase)) * 0.22;
            member.wings[1].rotation.z = 0.15 + Math.abs(Math.sin(this.time * bounceFreq + member.phase)) * 0.22;
          }
        }

        // Gật gù đầu
        if (member.head) {
          member.head.rotation.x = Math.sin(this.time * (member.isBird ? 3.5 : 2.2) + member.phase) * (member.isBird ? 0.15 : 0.08);
        }

        // Đuôi ngoe nguẩy (đuôi heo xoắn lắc tít, đuôi bò phe phẩy)
        if (member.tail) {
          const tailSpeed = member.species === 'pig' ? 7.0 : 4.0;
          member.tail.rotation.y = Math.sin(this.time * tailSpeed + member.phase) * 0.35;
        }

        // Nhịp thở phập phồng nhẹ nhàng
        if (member.body) {
          member.body.scaling.y = 1.0 + Math.sin(this.time * 2.5 + member.phase) * 0.02;
        }
      }
    });
  }

  material(color, options = {}) {
    const name = `herd-toy-${color.replace('#', '')}`;
    return createToyMaterial(this.scene, name, color, {
      specularPower: options.specularPower ?? 28,
      specularLevel: options.specularLevel ?? 0.3,
      ambientScale: options.ambientScale ?? 0.65,
      emissiveHex: options.emissiveHex,
      zOffset: options.zOffset ?? 0,
    });
  }

  sync(animals = [], pens = {}) {
    // 1. Phân vùng tiện nghi phẳng sàn cực kỳ tối giản (KHÔNG có hộp to, KHÔNG có nhà chắn)
    const floorLevel = 0.16;

    for (const species of Object.keys(FARM_CONFIG.animals)) {
      const built = pens?.[species] || animals.some(a => a.species === species);
      if (!built || this.pens.has(species)) continue;

      const pen = new TransformNode(`owned-pen-${species}`, this.scene);
      pen.parent = this.root;
      const [slotX, slotZ] = FARM_CONFIG.livestockVisuals.slots[species];
      pen.position.set(slotX, 0, slotZ);

      // Điểm nhấn sàn phẳng nhẹ nhàng (Decal Accent) - zOffset âm để không cắn xé với nền cỏ
      if (species === 'chicken') {
        // Ổ rơm tròn êm ái góc chuồng gà
        const nest = MeshBuilder.CreateCylinder('chick-nest', { diameter: 0.75, height: 0.025, tessellation: 16 }, this.scene);
        nest.position.set(0, floorLevel + 0.012, 0);
        nest.material = this.material('#fef08a', { zOffset: -2 });
        nest.parent = pen;
        nest.isPickable = false;

        // 2 quả trứng gà nhỏ xíu đáng yêu trong ổ
        [-0.1, 0.1].forEach((ex, idx) => {
          const egg = MeshBuilder.CreateSphere(`chick-egg-${idx}`, { diameterX: 0.11, diameterY: 0.14, diameterZ: 0.11, segments: 8 }, this.scene);
          egg.position.set(ex, floorLevel + 0.045, idx === 0 ? 0.04 : -0.04);
          egg.material = this.material('#fffbeb');
          egg.parent = pen;
          egg.isPickable = false;
        });
      } else if (species === 'duck') {
        // Vũng nước xanh ngọc phẳng sàn cho đàn vịt vầy nước
        const splash = MeshBuilder.CreateCylinder('duck-splash', { diameter: 0.85, height: 0.02, tessellation: 16 }, this.scene);
        splash.position.set(0, floorLevel + 0.01, 0);
        splash.material = this.material('#38bdf8', { emissiveHex: '#0284c7', specularPower: 80, zOffset: -2 });
        splash.parent = pen;
        splash.isPickable = false;
      } else if (species === 'pig') {
        // Thảm rơm cỏ êm ái phẳng sàn cho đàn heo nằm lăn
        const strawPuddle = MeshBuilder.CreateCylinder('pig-straw-bed', { diameter: 0.95, height: 0.02, tessellation: 16 }, this.scene);
        strawPuddle.position.set(0, floorLevel + 0.01, 0);
        strawPuddle.material = this.material('#fde047', { zOffset: -2 });
        strawPuddle.parent = pen;
        strawPuddle.isPickable = false;
      } else if (species === 'cow') {
        // Khối đá khoáng nhỏ liếm muối cạnh rào
        const salt = MeshBuilder.CreateBox('cow-salt-block', { width: 0.28, depth: 0.28, height: 0.2 }, this.scene);
        salt.position.set(0, floorLevel + 0.1, -0.65);
        salt.material = this.material('#fef3c7');
        salt.parent = pen;
        salt.isPickable = false;
      }

      this.pens.set(species, pen);
    }

    // 2. Dựng các bé thú Chibi siêu đáng yêu & Phân bổ vị trí rộng rãi
    const counts = {};
    const desired = new Set();

    // Tọa độ lệch tự nhiên cho tối đa 3 bé mỗi loài (tạo thành tam giác tự nhiên, KHÔNG xếp hàng một)
    const naturalOffsets = [
      { ox: -0.55, oz: -0.38, rx: 0.12, rz: 0.12, speed: 0.65 },
      { ox: 0.55, oz: -0.38, rx: 0.12, rz: 0.12, speed: 0.55 },
      { ox: 0, oz: 0.62, rx: 0.12, rz: 0.12, speed: 0.6 },
    ];

    for (const [index, animal] of animals.entries()) {
      const def = FARM_CONFIG.animals[animal.species];
      if (!def || (counts[animal.species] || 0) >= def.capacity) continue;

      const animalIdx = counts[animal.species] || 0;
      counts[animal.species] = animalIdx + 1;
      const key = animal.id || `legacy-${index}-${animal.species}`;
      desired.add(key);

      if (this.members.has(key)) continue;

      const [slotX, slotZ] = FARM_CONFIG.livestockVisuals.slots[animal.species];
      const offsetSpec = naturalOffsets[animalIdx % naturalOffsets.length];

      const baseX = slotX + offsetSpec.ox;
      const baseZ = slotZ + offsetSpec.oz;
      const baseY = floorLevel;

      const root = new TransformNode(`owned-${animal.species}-${key}`, this.scene);
      root.parent = this.root;
      root.position.set(baseX, baseY, baseZ);

      const isBird = animal.species === 'chicken' || animal.species === 'duck';
      const species = animal.species;

      // Helper tạo khối bo tròn chibi
      const createSpherePart = (name, size, pos, tint, parent = root, segs = 10) => {
        const mesh = MeshBuilder.CreateSphere(`herd-${name}`, {
          diameterX: size[0],
          diameterY: size[1],
          diameterZ: size[2],
          segments: segs,
        }, this.scene);
        mesh.position.set(...pos);
        mesh.material = this.material(tint);
        mesh.parent = parent;
        mesh.isPickable = false;
        return mesh;
      };

      let head = null;
      let body = null;
      let tail = null;
      let snout = null;
      const wings = [];

      // ==========================================
      // LOÀI 1: BÉ HEO CHIBI HỒNG NGỌT NGÀO (PIG)
      // ==========================================
      if (species === 'pig') {
        root.scaling.setAll(0.78);
        const pinkBody = '#f9a8d4';
        const darkPink = '#f472b6';
        const blushPink = '#fb7185';
        const nostrilColor = '#db2777';

        // Thân tròn vo múp míp
        body = createSpherePart('pig-body', [0.74, 0.64, 0.96], [0, 0.46, 0], pinkBody, root, 12);

        // Đầu tròn xinh xắn
        head = new TransformNode('pig-head', this.scene);
        head.parent = root;
        head.position.set(0, 0.62, -0.48);
        createSpherePart('pig-head-mesh', [0.54, 0.48, 0.52], [0, 0, 0], pinkBody, head, 12);

        // Mõm heo hồng tròn phúng phính
        snout = createSpherePart('pig-snout', [0.34, 0.24, 0.22], [0, -0.06, -0.25], darkPink, head, 10);

        // 2 lỗ mũi đậm nhỏ xíu
        [-0.06, 0.06].forEach((nx, i) => {
          createSpherePart(`pig-nostril-${i}`, [0.05, 0.06, 0.04], [nx, -0.05, -0.35], nostrilColor, head, 6);
        });

        // 2 mắt long lanh anime đen nhánh có đốm sáng trắng
        [-0.16, 0.16].forEach((ex, i) => {
          createSpherePart(`pig-eye-${i}`, [0.075, 0.085, 0.06], [ex, 0.08, -0.22], '#1e293b', head, 8);
          // Đốm sáng phản chiếu mắt
          createSpherePart(`pig-glint-${i}`, [0.03, 0.03, 0.025], [ex + (i === 0 ? -0.015 : 0.015), 0.105, -0.25], '#ffffff', head, 6);
        });

        // Má hồng baby blush
        [-0.24, 0.24].forEach((bx, i) => {
          createSpherePart(`pig-blush-${i}`, [0.11, 0.08, 0.06], [bx, -0.04, -0.19], blushPink, head, 6);
        });

        // 2 tai cụp mềm mại
        [-0.22, 0.22].forEach((tx, i) => {
          const ear = createSpherePart(`pig-ear-${i}`, [0.18, 0.11, 0.16], [tx, 0.18, 0.02], darkPink, head, 8);
          ear.rotation.z = i === 0 ? 0.35 : -0.35;
          ear.rotation.x = -0.15;
        });

        // Đuôi heo xoắn ngộ nghĩnh
        tail = createSpherePart('pig-tail', [0.09, 0.12, 0.24], [0, 0.52, 0.5], darkPink, root, 8);
        tail.rotation.x = -0.45;

        // 4 chân ngắn mập đáng yêu
        for (const lx of [-0.22, 0.22]) {
          for (const lz of [-0.26, 0.26]) {
            createSpherePart('pig-leg', [0.15, 0.26, 0.15], [lx, 0.15, lz], darkPink, root, 8);
          }
        }
      }

      // ==========================================
      // LOÀI 2: BÉ GÀ BÔNG CHIBI LÔNG TRẮNG (CHICKEN)
      // ==========================================
      else if (species === 'chicken') {
        root.scaling.setAll(0.55);
        const whiteBody = '#ffffff';
        const combRed = '#ef4444';
        const beakGold = '#f59e0b';

        // Thân tròn hình quả trứng béo múp
        body = createSpherePart('chick-body', [0.62, 0.58, 0.74], [0, 0.42, 0], whiteBody, root, 12);

        // Đầu tròn
        head = new TransformNode('chick-head', this.scene);
        head.parent = root;
        head.position.set(0, 0.65, -0.34);
        createSpherePart('chick-head-mesh', [0.44, 0.42, 0.42], [0, 0, 0], whiteBody, head, 10);

        // Mào đỏ tươi nhấp nhô trên đầu
        const comb = createSpherePart('chick-comb', [0.12, 0.22, 0.22], [0, 0.24, -0.02], combRed, head, 8);
        comb.rotation.x = -0.15;

        // Tích đỏ dưới cằm
        createSpherePart('chick-wattle', [0.08, 0.12, 0.08], [0, -0.14, -0.18], combRed, head, 6);

        // Mỏ vàng nhọn xinh xắn
        const beak = MeshBuilder.CreateCylinder('chick-beak', {
          diameterTop: 0.02,
          diameterBottom: 0.15,
          height: 0.18,
          tessellation: 6,
        }, this.scene);
        beak.position.set(0, -0.04, -0.28);
        beak.rotation.x = Math.PI / 2;
        beak.material = this.material(beakGold);
        beak.parent = head;

        // Mắt đen long lanh có đốm sáng
        [-0.14, 0.14].forEach((ex, i) => {
          createSpherePart(`chick-eye-${i}`, [0.06, 0.07, 0.05], [ex, 0.06, -0.16], '#1e293b', head, 8);
          createSpherePart(`chick-glint-${i}`, [0.025, 0.025, 0.02], [ex + (i === 0 ? -0.01 : 0.01), 0.08, -0.18], '#ffffff', head, 6);
        });

        // Má hồng
        [-0.18, 0.18].forEach((bx, i) => {
          createSpherePart(`chick-blush-${i}`, [0.08, 0.06, 0.04], [bx, -0.04, -0.14], '#fda4af', head, 6);
        });

        // 2 cánh nhỏ bên hông đập nhè nhẹ
        [-0.31, 0.31].forEach((wx, i) => {
          const wing = createSpherePart(`chick-wing-${i}`, [0.1, 0.24, 0.36], [wx, 0.42, 0], '#fffdf2', root, 8);
          wing.rotation.z = i === 0 ? -0.15 : 0.15;
          wings.push(wing);
        });

        // Đuôi gà lông vũ vểnh lên
        tail = createSpherePart('chick-tail', [0.14, 0.26, 0.22], [0, 0.55, 0.38], whiteBody, root, 8);
        tail.rotation.x = 0.55;

        // 2 chân cam nhỏ
        [-0.14, 0.14].forEach((lx) => {
          createSpherePart('chick-leg', [0.09, 0.2, 0.12], [lx, 0.12, 0.02], beakGold, root, 6);
        });
      }

      // ==========================================
      // LOÀI 3: BÉ VỊT VÀNG NƯỚC (DUCK)
      // ==========================================
      else if (species === 'duck') {
        root.scaling.setAll(0.60);
        const yellowBody = '#fef08a';
        const billOrange = '#fb923c';

        // Thân tròn màu vàng bơ
        body = createSpherePart('duck-body', [0.62, 0.56, 0.74], [0, 0.42, 0], yellowBody, root, 12);

        // Đầu vịt tròn
        head = new TransformNode('duck-head', this.scene);
        head.parent = root;
        head.position.set(0, 0.64, -0.34);
        createSpherePart('duck-head-mesh', [0.44, 0.42, 0.44], [0, 0, 0], yellowBody, head, 10);

        // Mỏ dẹt tròn màu cam đặc trưng của chú vịt
        const bill = createSpherePart('duck-bill', [0.26, 0.09, 0.26], [0, -0.06, -0.26], billOrange, head, 8);

        // Mắt đen long lanh
        [-0.14, 0.14].forEach((ex, i) => {
          createSpherePart(`duck-eye-${i}`, [0.06, 0.07, 0.05], [ex, 0.07, -0.16], '#1e293b', head, 8);
          createSpherePart(`duck-glint-${i}`, [0.025, 0.025, 0.02], [ex + (i === 0 ? -0.01 : 0.01), 0.09, -0.18], '#ffffff', head, 6);
        });

        // 2 cánh nhỏ xinh
        [-0.31, 0.31].forEach((wx, i) => {
          const wing = createSpherePart(`duck-wing-${i}`, [0.1, 0.22, 0.34], [wx, 0.42, 0], yellowBody, root, 8);
          wing.rotation.z = i === 0 ? -0.15 : 0.15;
          wings.push(wing);
        });

        // Đuôi vịt hỉnh lên
        tail = createSpherePart('duck-tail', [0.16, 0.18, 0.2], [0, 0.48, 0.38], yellowBody, root, 8);
        tail.rotation.x = 0.45;

        // 2 chân màng cam
        [-0.14, 0.14].forEach((lx) => {
          createSpherePart('duck-leg', [0.1, 0.18, 0.14], [lx, 0.11, 0.02], billOrange, root, 6);
        });
      }

      // ==========================================
      // LOÀI 4: CỪU BÔNG LÔNG XÙ (SHEEP)
      // ==========================================
      else if (species === 'sheep') {
        root.scaling.setAll(0.78);
        const wool = '#f8fafc';
        const woolShadow = '#e2e8f0';
        const face = '#475569';
        const hoof = '#334155';

        body = createSpherePart('sheep-body', [0.82, 0.72, 1.05], [0, 0.52, 0], wool, root, 10);
        // Các cụm len tạo silhouette bông mềm mà vẫn giữ ít polygon.
        [[-0.34, 0.58, -0.18, 0.38], [0.34, 0.58, -0.18, 0.38],
          [-0.3, 0.66, 0.24, 0.36], [0.3, 0.66, 0.24, 0.36],
          [0, 0.78, 0.05, 0.42]].forEach(([px, py, pz, d], i) => {
          createSpherePart(`sheep-wool-${i}`, [d, d, d], [px, py, pz], i === 4 ? '#ffffff' : woolShadow, root, 8);
        });

        head = new TransformNode('sheep-head', this.scene);
        head.parent = root;
        head.position.set(0, 0.8, -0.58);
        createSpherePart('sheep-face', [0.46, 0.48, 0.48], [0, 0, 0], face, head, 9);
        [-0.15, 0.15].forEach((ex, i) => {
          createSpherePart(`sheep-eye-${i}`, [0.065, 0.075, 0.05], [ex, 0.08, -0.21], '#0f172a', head, 7);
          createSpherePart(`sheep-glint-${i}`, [0.024, 0.024, 0.018], [ex + (i ? 0.01 : -0.01), 0.1, -0.24], '#ffffff', head, 5);
        });
        [-0.25, 0.25].forEach((ex, i) => {
          const ear = createSpherePart(`sheep-ear-${i}`, [0.2, 0.1, 0.16], [ex, 0.18, 0.02], woolShadow, head, 7);
          ear.rotation.z = i ? -0.35 : 0.35;
        });
        snout = createSpherePart('sheep-snout', [0.2, 0.14, 0.12], [0, -0.12, -0.23], '#94a3b8', head, 7);
        tail = createSpherePart('sheep-tail', [0.2, 0.2, 0.18], [0, 0.64, 0.55], wool, root, 7);

        for (const lx of [-0.24, 0.24]) {
          for (const lz of [-0.3, 0.3]) {
            createSpherePart('sheep-leg', [0.13, 0.3, 0.13], [lx, 0.18, lz], hoof, root, 6);
          }
        }
      }

      // ==========================================
      // LOÀI 5: BÉ BÒ SỮA ĐỐM CARAMEL (COW)
      // ==========================================
      else {
        root.scaling.setAll(0.95);
        const cowCream = '#ffffff';
        const cowBrown = '#5c3826';
        const cowNose = '#fbcfe8';

        // Thân tròn múp đốm nâu
        body = createSpherePart('cow-body', [0.76, 0.68, 1.05], [0, 0.52, 0], cowCream, root, 12);
        // Đốm bò đáng yêu trên lưng
        createSpherePart('cow-spot', [0.38, 0.38, 0.42], [0.22, 0.62, 0.08], cowBrown, root, 8);

        // Đầu bò
        head = new TransformNode('cow-head', this.scene);
        head.parent = root;
        head.position.set(0, 0.76, -0.52);
        createSpherePart('cow-head-mesh', [0.52, 0.46, 0.48], [0, 0, 0], cowCream, head, 10);

        // Mõm hồng tròn xinh
        snout = createSpherePart('cow-snout', [0.34, 0.22, 0.24], [0, -0.09, -0.22], cowNose, head, 8);

        // 2 sừng nhỏ xíu
        [-0.16, 0.16].forEach((hx, i) => {
          const horn = createSpherePart(`cow-horn-${i}`, [0.08, 0.16, 0.08], [hx, 0.24, -0.02], '#fef3c7', head, 6);
          horn.rotation.z = i === 0 ? 0.3 : -0.3;
        });

        // 2 tai vểnh
        [-0.26, 0.26].forEach((ex, i) => {
          const ear = createSpherePart(`cow-ear-${i}`, [0.18, 0.1, 0.12], [ex, 0.12, 0.02], cowBrown, head, 6);
          ear.rotation.z = i === 0 ? 0.4 : -0.4;
        });

        // Mắt đen anime
        [-0.16, 0.16].forEach((ex, i) => {
          createSpherePart(`cow-eye-${i}`, [0.07, 0.08, 0.05], [ex, 0.06, -0.2], '#1e293b', head, 8);
          createSpherePart(`cow-glint-${i}`, [0.025, 0.025, 0.02], [ex + (i === 0 ? -0.01 : 0.01), 0.08, -0.22], '#ffffff', head, 6);
        });

        // Chuông vàng lục lạc cổ
        createSpherePart('cow-bell', [0.14, 0.14, 0.14], [0, -0.24, -0.1], '#facc15', head, 8);

        // Đuôi bò có chùm lông
        tail = createSpherePart('cow-tail', [0.07, 0.28, 0.07], [0, 0.52, 0.55], cowBrown, root, 6);
        tail.rotation.x = -0.55;

        // 4 chân mập
        for (const lx of [-0.22, 0.22]) {
          for (const lz of [-0.3, 0.3]) {
            createSpherePart('cow-leg', [0.14, 0.28, 0.14], [lx, 0.16, lz], cowCream, root, 6);
          }
        }
      }

      this.members.set(key, {
        root,
        head,
        body,
        tail,
        snout,
        wings,
        isBird,
        species,
        baseX,
        baseZ,
        baseY,
        rx: offsetSpec.rx,
        rz: offsetSpec.rz,
        walkSpeed: offsetSpec.speed,
        phase: index * 1.85 + animalIdx * 2.1,
      });
    }

    // Dọn dẹp thú không còn trong danh sách
    for (const [key, member] of this.members) {
      if (!desired.has(key)) {
        member.root.dispose();
        this.members.delete(key);
      }
    }
  }

  dispose() {
    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.root.dispose();
    this.members.clear();
    this.pens.clear();
  }
}
