import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial.js';
import { Effect } from '@babylonjs/core/Materials/effect.js';

/**
 * PROCEDURAL SKY DOME SHADER (GHIBLI X MAKOTO SHINKAI ANIME SKY)
 * - 100% GPU-computed 5-stop atmospheric gradient (zero CPU canvas rasterization)
 * - Built-in procedural anime cumulus clouds with real-time solar illumination & wind drift
 * - Directional Mie Scattering sunburst halo & atmospheric corona
 * - Anti-banding blue noise dithering
 * - Smooth camera tracking with zero garbage collection
 */

// Register GLSL Shaders in Babylon.js ShadersStore (Always overwrite so HMR works instantly)
Effect.ShadersStore['proceduralSkyVertexShader'] = `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 worldViewProjection;

  varying vec3 vWorldDirection;
  varying vec3 vLocalPosition;

  void main() {
    vLocalPosition = position;
    // World direction vector pointing from center outward
    vWorldDirection = normalize(position);
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

Effect.ShadersStore['proceduralSkyPixelShader'] = `
  precision highp float;

  varying vec3 vWorldDirection;
  varying vec3 vLocalPosition;

  uniform vec3 uZenithColor;
  uniform vec3 uUpperColor;
  uniform vec3 uTransColor;
  uniform vec3 uHazeColor;
  uniform vec3 uGroundColor;
  uniform vec3 uFogColor;

  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uSunGlowIntensity;
  uniform float uSunGlowExponent;

  uniform float uTime;
  uniform vec3 uCloudTopColor;
  uniform vec3 uCloudBaseColor;
  uniform float uCloudAlpha;

  // Pseudo-random hash for value noise
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // Smooth bilinear Value Noise
  float vNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // 3-Octave Fractional Brownian Motion for fluffy anime clouds
  float fbmCloud(vec2 p) {
    float v = 0.55 * vNoise(p);
    p *= 2.15;
    v += 0.30 * vNoise(p);
    p *= 2.18;
    v += 0.15 * vNoise(p);
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldDirection);
    float h = clamp(dir.y, -1.0, 1.0); // Normalized height [-1.0 to 1.0]

    // 5-stop Hermite painterly atmospheric gradient
    vec3 skyColor;
    if (h < 0.0) {
      float t = clamp((h + 0.22) / 0.22, 0.0, 1.0);
      t = smoothstep(0.0, 1.0, t);
      skyColor = mix(uGroundColor, uHazeColor, t);
    } else if (h < 0.20) {
      float t = clamp(h / 0.20, 0.0, 1.0);
      t = smoothstep(0.0, 1.0, t);
      skyColor = mix(uHazeColor, uTransColor, t);
    } else if (h < 0.50) {
      float t = clamp((h - 0.20) / 0.30, 0.0, 1.0);
      t = smoothstep(0.0, 1.0, t);
      skyColor = mix(uTransColor, uUpperColor, t);
    } else {
      float t = clamp((h - 0.50) / 0.50, 0.0, 1.0);
      t = smoothstep(0.0, 1.0, t);
      skyColor = mix(uUpperColor, uZenithColor, t);
    }

    // Seamless Fog Horizon Blending (chân trời hòa cùng núi tuyết & đại dương)
    float fogMask = 1.0 - smoothstep(0.0, 0.08, abs(h));
    skyColor = mix(skyColor, uFogColor, fogMask * 0.45);

    // Sun vector normalization & angles
    vec3 sunDirNorm = normalize(uSunDirection);
    float sunDot = clamp(dot(dir, sunDirNorm), 0.0, 1.0);
    float sunAltitude = clamp(sunDirNorm.y, 0.0, 1.0);

    // Directional Sun Mie Scattering (3-Tier Makoto Shinkai / Ghibli solar radiance)
    if (sunDot > 0.0001 && uSunGlowIntensity > 0.001) {
      // Tier 1: Tight luminous solar core
      float tightCore = pow(sunDot, max(1.0, uSunGlowExponent)) * (uSunGlowIntensity * 1.35);
      // Tier 2: Wide atmospheric corona bloom
      float wideCorona = pow(sunDot, max(2.0, uSunGlowExponent * 0.16)) * (uSunGlowIntensity * 0.45);
      // Tier 3: Forward hemisphere Rayleigh warmth
      float hemiForward = pow(sunDot, 1.8) * (uSunGlowIntensity * 0.20);
      skyColor += uSunColor * (tightCore + wideCorona + hemiForward);
    }

    // Horizon Azimuthal Flare & Belt of Venus during low sun (Dawn / Dusk)
    if (sunAltitude < 0.45 && uSunGlowIntensity > 0.001) {
      float lenDirXZ = length(dir.xz);
      float lenSunXZ = length(sunDirNorm.xz);
      if (lenDirXZ > 0.01 && lenSunXZ > 0.01) {
        vec2 dirXZ = dir.xz / lenDirXZ;
        vec2 sunXZ = sunDirNorm.xz / lenSunXZ;
        float aziDot = dot(dirXZ, sunXZ);

        // 1. Warm Golden Hour Horizon Flare (phía hướng Mặt Trời)
        if (aziDot > 0.001) {
          float horizMask = exp(-h * h * 55.0);
          float flare = pow(clamp(aziDot, 0.0, 1.0), 2.2) * horizMask * (1.0 - sunAltitude / 0.45) * (uSunGlowIntensity * 0.55);
          skyColor += uSunColor * flare;
        }

        // 2. Belt of Venus (Vành Đai Sao Kim - Dải hồng tím thơ mộng phía đối diện Mặt Trời)
        float antiDot = -aziDot;
        if (antiDot > 0.001 && h > 0.01) {
          float venusBand = exp(-pow((h - 0.07) * 18.0, 2.0));
          float venusEffect = pow(clamp(antiDot, 0.0, 1.0), 1.8) * venusBand * (1.0 - sunAltitude / 0.45) * (uSunGlowIntensity * 0.38);
          vec3 venusLilac = vec3(0.96, 0.58, 0.76);
          skyColor = mix(skyColor, venusLilac, clamp(venusEffect, 0.0, 0.65));
        }
      }
    }

    // =========================================================================
    // PROCEDURAL ANIME CLOUDS LAYER (100% GPU, Zero-glitch, Pure Fluffy Clouds)
    // =========================================================================
    if (h > 0.03 && uCloudAlpha > 0.01) {
      vec2 planeUV = (dir.xz / (h + 0.16)) * 0.32;
      vec2 cloudWind = vec2(uTime * 0.0035, uTime * 0.0015);
      vec2 cloudUV = planeUV + cloudWind;

      float cloudSample = fbmCloud(cloudUV * 2.8);
      float cloudCoverage = smoothstep(0.44, 0.68, cloudSample);

      if (cloudCoverage > 0.001) {
        vec3 cColor = mix(uCloudBaseColor, uCloudTopColor, pow(cloudCoverage, 0.8));
        cColor += uSunColor * pow(sunDot, 3.5) * 0.4;

        float horizonFade = smoothstep(0.03, 0.18, h);
        float finalCloudAlpha = cloudCoverage * horizonFade * uCloudAlpha;

        skyColor = mix(skyColor, cColor, clamp(finalCloudAlpha, 0.0, 0.95));
      }
    }

    // Anti-banding dither
    float dither = (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
    skyColor += vec3(dither);

    gl_FragColor = vec4(clamp(skyColor, 0.0, 1.0), 1.0);
  }
`;

export function createProceduralSkyDome(scene, parentNode = null) {
  // Bán kính 450m (đường kính 900m) bao bọc toàn bộ thế giới và dãy núi tuyết chân trời
  const skyDome = MeshBuilder.CreateSphere('ghibli-procedural-skydome', {
    diameter: 900,
    segments: 56,
    sideOrientation: Mesh.BACKSIDE,
  }, scene);

  skyDome.position.set(0, 0, 0);
  skyDome.infiniteDistance = true;
  skyDome.ignoreCameraMaxZ = true;
  skyDome.alwaysSelectAsActiveMesh = true;
  skyDome.isPickable = false;
  skyDome.renderingGroupId = 0;

  const skyMat = new ShaderMaterial(
    'procedural-sky-shader-mat',
    scene,
    {
      vertex: 'proceduralSky',
      fragment: 'proceduralSky',
    },
    {
      attributes: ['position', 'normal', 'uv'],
      uniforms: [
        'worldViewProjection',
        'world',
        'uZenithColor',
        'uUpperColor',
        'uTransColor',
        'uHazeColor',
        'uGroundColor',
        'uFogColor',
        'uSunDirection',
        'uSunColor',
        'uSunGlowIntensity',
        'uSunGlowExponent',
        'uTime',
        'uCloudTopColor',
        'uCloudBaseColor',
        'uCloudAlpha',
      ],
      needAlphaBlending: false,
      needAlphaTesting: false,
    }
  );

  skyMat.backFaceCulling = false;
  skyMat.disableLighting = true;
  skyMat.disableDepthWrite = true;
  skyMat.fogEnabled = false;

  // Initial default values (Vibrant Daytime Anime Sky)
  skyMat.setColor3('uZenithColor', Color3.FromHexString('#0284c7'));
  skyMat.setColor3('uUpperColor', Color3.FromHexString('#38bdf8'));
  skyMat.setColor3('uTransColor', Color3.FromHexString('#7dd3fc'));
  skyMat.setColor3('uHazeColor', Color3.FromHexString('#e0f2fe'));
  skyMat.setColor3('uGroundColor', Color3.FromHexString('#f0f9ff'));
  skyMat.setColor3('uFogColor', Color3.FromHexString('#e0f2fe'));
  skyMat.setVector3('uSunDirection', new Vector3(0.45, 0.85, 0.32));
  skyMat.setColor3('uSunColor', Color3.FromHexString('#fffbeb'));
  skyMat.setFloat('uSunGlowIntensity', 0.85);
  skyMat.setFloat('uSunGlowExponent', 28.0);
  skyMat.setFloat('uTime', 0.0);
  skyMat.setColor3('uCloudTopColor', Color3.White());
  skyMat.setColor3('uCloudBaseColor', Color3.FromHexString('#e0f2fe'));
  skyMat.setFloat('uCloudAlpha', 0.85);

  skyDome.material = skyMat;

  // Reusable vectors to avoid allocations
  const _sunDirNorm = new Vector3();
  let accumulatedTime = 0.0;

  return {
    mesh: skyDome,
    material: skyMat,

    setSkyParameters({
      zenith,
      upper,
      trans,
      haze,
      ground,
      fogColor,
      sunDir,
      sunColor,
      sunGlowIntensity = 0.75,
      sunGlowExponent = 28.0,
      cloudTopColor = null,
      cloudBaseColor = null,
      cloudAlpha = 0.85,
    }) {
      if (zenith) skyMat.setColor3('uZenithColor', zenith);
      if (upper) skyMat.setColor3('uUpperColor', upper);
      if (trans) skyMat.setColor3('uTransColor', trans);
      if (haze) skyMat.setColor3('uHazeColor', haze);
      if (ground) skyMat.setColor3('uGroundColor', ground);
      if (fogColor) skyMat.setColor3('uFogColor', fogColor);

      if (sunDir) {
        _sunDirNorm.copyFrom(sunDir).normalize();
        skyMat.setVector3('uSunDirection', _sunDirNorm);
      }
      if (sunColor) skyMat.setColor3('uSunColor', sunColor);
      skyMat.setFloat('uSunGlowIntensity', sunGlowIntensity);
      skyMat.setFloat('uSunGlowExponent', sunGlowExponent);

      if (cloudTopColor) skyMat.setColor3('uCloudTopColor', cloudTopColor);
      if (cloudBaseColor) skyMat.setColor3('uCloudBaseColor', cloudBaseColor);
      skyMat.setFloat('uCloudAlpha', cloudAlpha);
    },

    updateTime(dt = 0.016) {
      accumulatedTime += dt;
      skyMat.setFloat('uTime', accumulatedTime);
    },

    updateCamera(cam) {
      if (!cam) return;
      skyDome.position.x = cam.position.x;
      skyDome.position.y = cam.position.y;
      skyDome.position.z = cam.position.z;
    },

    dispose() {
      skyMat.dispose(true, true);
      skyDome.dispose(false, false);
    },
  };
}
