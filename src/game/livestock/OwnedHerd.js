import {livestockLife} from '../../../shared/livestockLifecycle.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { createLivestockAnimal } from './createLivestockAnimal.js';
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
    this.root.metadata={dynamicLivestock:true};
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

        const feeding = member.interacting || member.animal.fedAt > 0 && Date.now() - member.animal.fedAt < 4000;
        const life=livestockLife(member.animal);
        member.root.scaling.setAll(member.adultScale*life.scale);
        const ready = member.animal.productReadyAt > 0 && member.animal.productReadyAt <= Date.now();
        member.readyMarker.setEnabled(ready);
        member.readyMarker.position.y = 1.7 + Math.sin(this.time * 2 + member.phase) * .045;

        // Quỹ đạo di chuyển hình elip tự nhiên quanh vị trí trung tâm của từng bé
        const dx = feeding ? 0 : Math.sin(angle) * member.rx;
        const dz = feeding ? 0 : Math.cos(angle * 1.1) * member.rz;
        member.root.position.x = member.baseX + dx;
        member.root.position.z = member.baseZ + dz;

        // Xoay hướng nhìn theo chiều chuyển động mượt mà
        const vx = Math.cos(angle) * member.rx;
        const vz = -Math.sin(angle * 1.1) * 1.1 * member.rz;
        if (!feeding && Math.hypot(vx, vz) > 0.01) {
          member.root.rotation.y = Math.atan2(-vx, -vz);
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
          member.head.rotation.x = feeding ? -.35 + Math.sin(this.time * 7) * .09 : Math.sin(this.time * (member.isBird ? 3.5 : 2.2) + member.phase) * (member.isBird ? 0.15 : 0.08);
        }

        // Đuôi ngoe nguẩy (đuôi heo xoắn lắc tít, đuôi bò phe phẩy)
        if (member.tail) {
          const tailSpeed = member.species === 'pig' ? 7.0 : 4.0;
          member.tail.rotation.y = Math.sin(this.time * tailSpeed + member.phase) * 0.35;
        }

        member.legs?.forEach((leg, i) => {
          leg.rotation.x = feeding ? 0 : Math.sin(this.time * (member.isBird ? 5.5 : 3.8) + member.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * (member.isBird ? .22 : .16);
        });

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
      specularLevel: options.specularLevel ?? 0.16,
      ambientScale: options.ambientScale ?? 0.4,
      emissiveScale: 0.1,
      emissiveHex: options.emissiveHex,
      zOffset: options.zOffset ?? 0,
    });
  }

  sync(animals = [], pens = {}) {
    // 1. Phân vùng tiện nghi phẳng sàn cực kỳ tối giản (KHÔNG có hộp to, KHÔNG có nhà chắn)
    const floorLevel = 0.16;

    for (const species of Object.keys(FARM_CONFIG.animals)) {
      const built = pens?.[species] || animals.some(a => a.species === species);
      if (!built) continue;
      if (this.pens.has(species)) { const [x,z]=FARM_CONFIG.livestockVisuals.slots[species];this.pens.get(species).position.set(x,0,z);continue; }

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
        splash.material = this.material('#76bfc3', { specularPower: 64, zOffset: -2 });
        splash.parent = pen;
        splash.isPickable = false;
      } else if (species === 'pig') {
        // Thảm rơm cỏ êm ái phẳng sàn cho đàn heo nằm lăn
        const strawPuddle = MeshBuilder.CreateCylinder('pig-straw-bed', { diameter: 0.95, height: 0.02, tessellation: 16 }, this.scene);
        strawPuddle.position.set(0, floorLevel + 0.01, 0);
        strawPuddle.material = this.material('#d9b66e', { zOffset: -2 });
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

      // Small raised feed bowl, kept near the rear edge of each activity area.
      const bowl = MeshBuilder.CreateCylinder(`herd-feed-bowl-${species}`, { diameterTop: .38, diameterBottom: .3, height: .12, tessellation: 12 }, this.scene);
      bowl.position.set(.38, floorLevel + .06, -.68); bowl.parent = pen; bowl.material = this.material('#bd8661'); bowl.isPickable = false;
      const feed = MeshBuilder.CreateCylinder(`herd-feed-${species}`, { diameter: .3, height: .025, tessellation: 12 }, this.scene);
      feed.position.set(.38, floorLevel + .12, -.68); feed.parent = pen; feed.material = this.material('#dfbd6b'); feed.isPickable = false;
      if (species === 'chicken') {
        const rim = MeshBuilder.CreateTorus('chicken-nest-rim', {diameter:.65, thickness:.13, tessellation:16}, this.scene);
        rim.position.y = floorLevel + .065; rim.parent = pen; rim.material = this.material('#d6aa56'); rim.isPickable = false;
      }
      if (species === 'duck') {
        const rim = MeshBuilder.CreateTorus('duck-pool-rim', {diameter:.84, thickness:.09, tessellation:20}, this.scene);
        rim.position.y = floorLevel + .035; rim.parent = pen; rim.material = this.material('#c4c5a9'); rim.isPickable = false;
      }

      pen.getChildMeshes().forEach(mesh => { mesh.isPickable = true; mesh.metadata = {type: 'livestock-interact', farmId: this.root.parent?.metadata?.farmId, species}; });
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

      if (this.members.has(key)) {
        const member=this.members.get(key),[x,z]=FARM_CONFIG.livestockVisuals.slots[animal.species],o=naturalOffsets[animalIdx % naturalOffsets.length];
        member.baseX=x+o.ox;member.baseZ=z+o.oz;member.animal=animal;continue;
      }

      const [slotX, slotZ] = FARM_CONFIG.livestockVisuals.slots[animal.species];
      const offsetSpec = naturalOffsets[animalIdx % naturalOffsets.length];

      const baseX = slotX + offsetSpec.ox;
      const baseZ = slotZ + offsetSpec.oz;
      const baseY = floorLevel;

      const root = new TransformNode(`owned-${animal.species}-${key}`, this.scene);
      root.parent = this.root;
      root.position.set(baseX, baseY, baseZ);

      const species = animal.species;
      const {head, body, tail, wings, legs, isBird, snout} = createLivestockAnimal(this.scene, root, species, tint => this.material(tint));

      const adultScale=root.scaling.x;
      root.scaling.setAll(adultScale*livestockLife(animal).scale);
      const readyMarker = new TransformNode(`ready-product-${key}`,this.scene);
      readyMarker.parent=root;readyMarker.position.y=1.7;
      const readyProduct=species==='cow'
        ? MeshBuilder.CreateCylinder(`ready-milk-${key}`,{height:.28,diameterTop:.12,diameterBottom:.19,tessellation:10},this.scene)
        : MeshBuilder.CreateSphere(`ready-product-shape-${key}`,{diameterX:.21,diameterY:species==='sheep'||species==='pig'?.21:.28,diameterZ:species==='pig'?.055:.21,segments:8},this.scene);
      readyProduct.parent=readyMarker;readyProduct.material=this.material(species==='pig'?'#eac15c':'#fff4d6');
      const halo=MeshBuilder.CreateTorus(`ready-halo-${key}`,{diameter:.34,thickness:.035,tessellation:16},this.scene);
      halo.parent=readyMarker;halo.position.y=-.16;halo.material=this.material('#e2ae46');
      readyMarker.setEnabled(false);

      root.getChildMeshes().forEach(mesh => { mesh.isPickable = true; mesh.metadata = {type:'livestock-interact', farmId:this.root.parent?.metadata?.farmId, species, id:animal.id}; });

      this.members.set(key, {
        root,
        adultScale,
        animal,
        readyMarker,
        head,
        body,
        tail,
        snout,
        wings,
        legs,
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
