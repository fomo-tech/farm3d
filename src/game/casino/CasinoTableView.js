import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {VENUE_LAYOUT} from '../../../shared/venueLayout.js';
import {CASINO_SYMBOLS, CASINO_CONFIG} from '../../../shared/casino/casinoConfig.js';
import {cardLabel} from '../../../shared/casino/cards.js';
import {casinoAudio} from './casinoAudio.js';

/**
 * 3D Play Together Table Props: Dynamic 3D Dice, Ceramic Bowl, Felt Cards and Gold Chips
 * Lives inside the Babylon.js 3D Casino Lounge.
 */
export class CasinoTableView {
  constructor(scene) {
    this.scene = scene;
    this.root = new TransformNode('live-casino-table-props', scene);
    const p = VENUE_LAYOUT.casino.interior;
    this.root.position.set(p.x, p.y + 0.1, p.z - 3);
    this.materials = [];
    this.textures = [];

    const mat = (name, color, em = null) => {
      const m = new StandardMaterial(name, scene);
      m.diffuseColor = Color3.FromHexString(color);
      m.specularColor = Color3.Black();
      if (em) m.emissiveColor = Color3.FromHexString(em);
      this.materials.push(m);
      return m;
    };

    const gold = mat('casino-live-trim', '#d8c18d', '#f59e0b');
    const mesh = (m, material) => {
      m.parent = this.root;
      m.material = material;
      m.isPickable = false;
      m.metadata = { interiorVenue: 'casino', venue: 'casino' };
      return m;
    };

    // 3D xúc xắc
    this.dice = Array.from({ length: 3 }, (_, i) => {
      const t = new DynamicTexture(`casino-live-face-${i}`, { width: 256, height: 256 }, scene, false);
      this.textures.push(t);
      const m = mat(`casino-live-die-${i}`, '#fffbf0');
      m.diffuseTexture = t;
      const d = mesh(MeshBuilder.CreateBox(`casino-live-dice-${i}`, { size: 0.42 }, scene), m);
      d.position.set((i - 1) * 0.48, 1.45, 0);
      return d;
    });

    // 3D phỉnh vàng
    this.chips = Array.from({ length: CASINO_CONFIG.maxVisibleChips }, (_, i) => {
      const c = mesh(MeshBuilder.CreateCylinder(`casino-live-chip-${i}`, { diameter: 0.26, height: 0.05, tessellation: 16 }, scene), gold);
      c.position.set(-0.8 + (i % 4) * 0.28, 1.38 + Math.floor(i / 4) * 0.05, 0.4);
      c.setEnabled(false);
      return c;
    });

    // 3D bài tây
    this.cards = Array.from({ length: 13 }, (_, i) => {
      const t = new DynamicTexture(`casino-live-card-${i}`, { width: 128, height: 192 }, scene, false);
      this.textures.push(t);
      const m = mat(`casino-live-card-mat-${i}`, '#ffffff');
      m.diffuseTexture = t;
      m.backFaceCulling = false;
      const c = mesh(MeshBuilder.CreatePlane(`casino-live-card-${i}`, { width: 0.28, height: 0.42 }, scene), m);
      c.rotation.x = Math.PI / 2;
      c.position.set(-1.2 + i * 0.2, 1.38, -0.4);
      c.setEnabled(false);
      return c;
    });

    this.prevPhase = null;

    // Render loop animation cho xúc xắc & bát 3D
    this.observer = scene.onBeforeRenderObservable.add(() => {
      if (!this.root.isEnabled()) return;
      const t = performance.now() * 0.005;

      // Tìm bát 3D trên bàn Tài Xỉu
      const bowlMesh = this.scene.getMeshByName('tx-3d-bowl');

      if (this.phase === 'shaking') {
        this.dice.forEach((d, i) => {
          d.rotation.x = t * 3 + i * 1.5;
          d.rotation.y = t * 2 + i * 0.8;
          d.rotation.z = Math.sin(t * 3 + i) * 0.6;
          d.position.y = 1.48 + Math.abs(Math.sin(t * 4 + i)) * 0.12;
        });

        if (bowlMesh) {
          bowlMesh.position.y = 1.42;
          bowlMesh.position.x = Math.sin(t * 24) * 0.04;
          bowlMesh.position.z = Math.cos(t * 24) * 0.04;
        }
      } else if (this.phase === 'reveal' || this.phase === 'result' || this.phase === 'settling') {
        // Nâng bát 3D lên để mở xúc xắc
        if (bowlMesh) {
          const targetY = 2.15;
          bowlMesh.position.y += (targetY - bowlMesh.position.y) * 0.1;
          bowlMesh.position.x = 0;
          bowlMesh.position.z = 0;
        }
      } else {
        // Hạ bát 3D xuống khi cược hoặc chờ
        if (bowlMesh) {
          const targetY = 1.42;
          bowlMesh.position.y += (targetY - bowlMesh.position.y) * 0.12;
          bowlMesh.position.x = 0;
          bowlMesh.position.z = 0;
        }
      }
    });

    this.root.setEnabled(false);
  }

  update(room) {
    if (room?.game) {
      const p = VENUE_LAYOUT.casino.interior;
      const offsets = {
        'tai-xiu': { x: -6.5, z: -3.5 },
        'bau-cua': { x: 6.5, z: -3.5 },
        'bai-cao': { x: -6.5, z: 4.5 },
        'tien-len': { x: 6.5, z: 4.5 },
      };
      const off = offsets[room.game] || { x: 0, z: -3 };
      this.root.position.set(p.x + off.x, p.y + 0.05, p.z + off.z);
    }

    const nextPhase = room?.round?.phase;
    if (nextPhase !== this.prevPhase) {
      if (nextPhase === 'shaking') {
        casinoAudio.playDiceShake();
      } else if (nextPhase === 'reveal' || nextPhase === 'result') {
        casinoAudio.playBowlOpen();
      } else if (nextPhase === 'dealing') {
        casinoAudio.playCardFlip();
      }
      this.prevPhase = nextPhase;
    }
    this.phase = nextPhase;

    const result = room?.round?.result;
    const values = room?.game === 'tai-xiu' ? result?.dice : result?.symbols;
    const signature = JSON.stringify([room?.game, values, room?.round?.hand]);

    if (signature !== this.signature) {
      this.signature = signature;
      this.textures.slice(0, 3).forEach((t, i) => {
        const ctx = t.getContext();
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 244, 244);
        ctx.fillStyle = '#dc2626';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 72px "Baloo 2", sans-serif';
        const txt = values ? (CASINO_SYMBOLS[values[i]]?.name || String(values[i])) : '?';
        ctx.fillText(txt, 128, 128);
        t.update();
      });

      this.cards.forEach((c, i) => {
        const card = room?.round?.hand?.[i];
        c.setEnabled(card != null);
        const t = this.textures[i + 3];
        const ctx = t.getContext();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 128, 192);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, 120, 184);
        ctx.fillStyle = (card != null && (card.endsWith('h') || card.endsWith('d'))) ? '#dc2626' : '#0f172a';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card != null ? cardLabel(card) : '◆', 64, 96);
        t.update();
      });

      if (this.phase !== 'shaking') {
        this.dice.forEach((d, i) => {
          d.rotation.set(0, 0, 0);
          d.position.set((i - 1) * 0.48, 1.45, 0);
        });
      }
    }

    this.dice.forEach(d => d.setEnabled(['tai-xiu', 'bau-cua'].includes(room?.game)));
    const count = Math.min(CASINO_CONFIG.maxVisibleChips, Math.ceil(Object.values(room?.round?.totals || {}).reduce((a, b) => a + b, 0) / 10));
    this.chips.forEach((c, i) => c.setEnabled(i < count));
  }

  setEnabled(value) {
    this.root.setEnabled(value);
  }

  dispose() {
    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.root.dispose();
    this.textures.forEach(t => t.dispose());
    this.materials.forEach(m => m.dispose());
  }
}
