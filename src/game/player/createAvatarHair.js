import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

export const HAIR_STYLE_ALIASES = Object.freeze({
  hair_classic: 'classic', hair_anime_bangs: 'two_block', anime_bangs: 'two_block',
  hair_twintails: 'twintails', hair_chic_bob: 'bob', hair_wavy_curly: 'curly',
  wavy: 'curly', hair_slick_side: 'side_part', hair_slick_back: 'slick',
  hair_wolf_cut: 'two_block', hair_beach_surfer: 'curly',
  hair_celestial_flow: 'shoulder', celestial_flow: 'shoulder',
  hair_buzzcut: 'buzzcut', hair_high_ponytail: 'high_ponytail',
  hair_ponytail: 'ponytail', hair_side_part: 'side_part',
  hair_two_block: 'two_block', hair_short_curly: 'curly', hair_shoulder: 'shoulder',
});
const STYLES = new Set(['classic', 'classic_sprout', 'side_part', 'two_block', 'curly', 'bob', 'shoulder', 'twintails', 'ponytail', 'high_ponytail', 'buzzcut', 'slick']);

// Continuous rounded silhouettes: no separate bangs or strand-shaped pieces.
export function createAvatarHair(scene, prefix, head, materials) {
  const root = new TransformNode(`${prefix}-hair-root`, scene);
  root.parent = head;
  const ponytail = new TransformNode(`${prefix}-ponytail`, scene);
  ponytail.parent = root;
  ponytail.position.set(0, 0.62, -0.40);
  let current = null;
  let revision = 0;

  function build(style, lod) {
    const steps = [12, 8, 5][lod];
    const sides = [10, 8, 6][lod];
    const buckets = { body: { positions: [], indices: [] }, tail: { positions: [], indices: [] }, ties: { positions: [], indices: [] } };
    function surface(bucket, rings) {
      const { positions, indices } = buckets[bucket];
      const base = positions.length / 3;
      for (const ring of rings) for (const p of ring) positions.push(p.x, p.y, p.z);
      const n = rings[0].length;
      for (let r = 0; r < rings.length - 1; r++) for (let j = 0; j < n; j++) {
        const a = base + r * n + j, b = base + r * n + (j + 1) % n;
        indices.push(a, b, a + n, b, b + n, a + n);
      }
      // Cap both ends with center vertices, avoiding open tips at any LOD.
      for (const [r, reverse] of [[0, true], [rings.length - 1, false]]) {
        const center = rings[r].reduce((sum, p) => sum.add(p), Vector3.Zero()).scale(1 / n);
        const c = positions.length / 3;
        positions.push(center.x, center.y, center.z);
        for (let j = 0; j < n; j++) {
          const a = base + r * n + j, b = base + r * n + (j + 1) % n;
          indices.push(c, reverse ? b : a, reverse ? a : b);
        }
      }
    }
    const buzzcut = style === 'buzzcut';
    const tiedHair = style === 'ponytail' || style === 'high_ponytail';
    const longHair = style === 'bob' || style === 'shoulder';
    const bottom = style === 'shoulder' ? -.21 : .04;
    const around = sides * 4;
    const shell = [];
    const smooth = value => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };
    // Each longitude is one continuous curve from the crown to the hairline/nape.
    // Long hair extends only around the sides and back, leaving a clear face opening.
    for (let layer = 0; layer < 2; layer++) {
      for (let row = 0; row <= steps; row++) {
        const t = layer === 0 ? row / steps : 1 - row / steps;
        const ring = [];
        for (let j = 0; j < around; j++) {
          const phi = j / around * Math.PI * 2;
          const cosine = Math.cos(phi);
          const front = Math.max(0, cosine);
          const sideBack = smooth((.72 - cosine) / .40);
          let edge = 1.13 + .76 * (1 - front) ** 1.6;
          if (style === 'side_part') edge += .14 * Math.sin(phi * 2) * front;
          if (style === 'two_block') edge += .11 * front;
          if (style === 'slick') edge -= .10 * front;
          if (buzzcut) edge = 1.18 + .70 * (1 - front) ** 1.6;
          if (longHair) edge = 1.16 + .39 * (1 - front);
          const sphereT = longHair ? Math.min(1, t / .72) : t;
          const theta = .012 + sphereT * edge;
          const thickness = layer === 0 ? 0 : buzzcut ? .008 : .036;
          const sweep = longHair ? smooth((t - .72) / .28) * sideBack : 0;
          const puff = style === 'curly' ? .009 * Math.sin(phi * 5) * Math.sin(theta) ** 2 : 0;
          const radiusX = (buzzcut ? .527 : .552) - thickness + puff - .025 * sweep;
          const radiusZ = (buzzcut ? .498 : .522) - thickness + puff - .020 * sweep;
          const crownLift = style === 'side_part' ? .025 * Math.sin(phi) * Math.sin(theta) : 0;
          let y = .39 + ((buzzcut ? .471 : .495) - thickness) * Math.cos(theta) + crownLift;
          y += (bottom - y) * sweep;
          ring.push(new Vector3(radiusX * Math.sin(theta) * Math.sin(phi), y, radiusZ * Math.sin(theta) * cosine));
        }
        shell.push(ring);
      }
    }
    surface('body', shell);

    function roundedPiece(center, radius, bucket) {
      const rings = [];
      for (let row = 0; row <= steps; row++) {
        const theta = .012 + row / steps * (Math.PI - .024);
        rings.push(Array.from({ length: sides * 2 }, (_, j) => {
          const phi = j / (sides * 2) * Math.PI * 2;
          return new Vector3(center[0] + radius[0] * Math.sin(theta) * Math.sin(phi),
            center[1] + radius[1] * Math.cos(theta), center[2] + radius[2] * Math.sin(theta) * Math.cos(phi));
        }));
      }
      surface(bucket, rings);
    }
    if (style === 'twintails') for (const sign of [-1, 1]) {
      roundedPiece([sign * .56, .12, -.22], [.16, .31, .15], 'body');
      roundedPiece([sign * .48, .37, -.19], [.075, .045, .09], 'ties');
    }
    if (tiedHair) {
      const high = style === 'high_ponytail';
      roundedPiece(high ? [0, -.02, -.19] : [0, -.20, -.17], high ? [.15, .26, .19] : [.17, .33, .18], 'tail');
      roundedPiece([0, .0, -.04], [.13, .05, .12], 'ties');
    }
    const meshes = [];
    for (const [bucket, data] of Object.entries(buckets)) {
      if (!data.positions.length) continue;
      const mesh = new Mesh(`${prefix}-hair-${style}-${lod}-${bucket}-${revision}`, scene);
      const vertexData = new VertexData();
      vertexData.positions = data.positions;
      vertexData.indices = data.indices;
      vertexData.normals = [];
      VertexData.ComputeNormals(data.positions, data.indices, vertexData.normals);
      vertexData.applyToMesh(mesh);
      mesh.material = bucket === 'ties' ? materials.tieRed : materials.hair;
      mesh.parent = bucket === 'tail' || (bucket === 'ties' && tiedHair) ? ponytail : root;
      meshes.push(mesh);
    }
    return meshes;
  }
  return {
    root, ponytail,
    setStyle(requested, gender, lod = 0) {
      let style = HAIR_STYLE_ALIASES[requested] || requested;
      if (!STYLES.has(style)) style = 'classic';
      if (style === 'classic' || style === 'classic_sprout') style = gender === 'female' ? 'bob' : 'side_part';
      const level = Math.max(0, Math.min(2, Math.floor(Number(lod) || 0)));
      const key = `${style}:${level}`;
      if (current?.key !== key) {
        current?.meshes.forEach(mesh => mesh.dispose());
        revision++;
        current = { key, meshes: build(style, level) };
      }
      ponytail.position.set(0, style === 'high_ponytail' ? .78 : .62, style === 'high_ponytail' ? -.33 : -.40);
      ponytail.setEnabled(style === 'ponytail' || style === 'high_ponytail');
      root.metadata = { style, lod: level };
      return style;
    },
  };
}
