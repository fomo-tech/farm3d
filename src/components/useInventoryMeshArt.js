import { useEffect, useState } from 'react';
import { FISHING_CONFIG } from '../../shared/fishingConfig.js';
import { applyFashionInventoryItem } from './fashionInventoryMesh.js';
import { getDefaultCustomization } from '../../shared/fashionConfig.js';
import { FARM_CONFIG } from '../../shared/farmConfig.js';
import { createInventoryObjectMesh } from './createInventoryObjectMesh.js';
import { createCropMesh } from '../game/farming/createCropMesh.js';

const imageCache = new Map();

// Render the exact catch mesh used by the player, once per species. Never run a
// second continuous render loop alongside the main world.
export function useInventoryMeshArt(isOpen, category, items) {
  const [images, setImages] = useState({});
  const ids = items.map(item => item.id).join('|');

  useEffect(() => {
    if (!isOpen || !items.length) return;
    const cached = Object.fromEntries(items.filter(item => imageCache.has(item.id)).map(item => [item.id, imageCache.get(item.id)]));
    setImages(previous => ({ ...previous, ...cached }));
    const pending = items.filter(item => !imageCache.has(item.id));
    if (!pending.length) return;

    let cancelled = false;
    let timer;
    let idleHandle;
    let engine;
    let scene;
    let rig;
    let avatar;
    let objectRoot;
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(timer);
      if (idleHandle !== undefined && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleHandle);
      rig?.clear?.();
      scene?.dispose();
      engine?.dispose();
    };

    (async () => {
      const [{ Engine }, { Scene }, { ArcRotateCamera }, { HemisphericLight }, { DirectionalLight }, { Vector3 }, { Color3, Color4 }, { TransformNode }] = await Promise.all([
        import('@babylonjs/core/Engines/engine.js'), import('@babylonjs/core/scene.js'),
        import('@babylonjs/core/Cameras/arcRotateCamera.js'), import('@babylonjs/core/Lights/hemisphericLight.js'),
        import('@babylonjs/core/Lights/directionalLight.js'), import('@babylonjs/core/Maths/math.vector.js'),
        import('@babylonjs/core/Maths/math.color.js'), import('@babylonjs/core/Meshes/transformNode.js'),
      ]);
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      engine = new Engine(canvas, true, { preserveDrawingBuffer: true, alpha: true, stencil: true });
      scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);
      new HemisphericLight('fish-icon-hemi', new Vector3(0, 1, 0), scene).intensity = 0.9;
      const key = new DirectionalLight('fish-icon-key', new Vector3(-1, -2, 2), scene);
      key.intensity = 0.75;
      key.diffuse = Color3.White();
      const camera = new ArcRotateCamera('inventory-icon-camera', Math.PI / 2, 1.42, 0.85, Vector3.Zero(), scene);
      camera.minZ = 0.05;
      scene.activeCamera = camera;
      let caught;
      if (category === 'fish') {
        const { createFishingRig } = await import('../game/player/createPlayer.js');
        if (cancelled) return;
        rig = createFishingRig(scene, new TransformNode('fish-icon-root', scene), {});
        caught = scene.getTransformNodeByName('caught-fish');
        if (!caught) throw new Error('Caught fish mesh was not created');
      } else if (category === 'fashion') {
        const { buildHumanMesh } = await import('../game/player/buildHumanMesh.js');
        if (cancelled) return;
        avatar = buildHumanMesh(scene, 'inventory-fashion-object');
      }
      await scene.whenReadyAsync();
      if (cancelled) return;

      let index = 0;
      const next = async () => {
        if (cancelled) return;
        const item = pending[index++];
        if (!item) { release(); return; }
        try {
          if (category === 'fish') {
            const fish = FISHING_CONFIG.fish[item.itemId];
            if (!fish) throw new Error('Unknown fish species');
            rig.finishCatch(true, fish);
            caught.position.set(0, 0, 0);
            caught.rotation.set(0, 0, 0);
            camera.target.set(0, 0, 0);
            camera.radius = 0.85;
          } else if (category === 'fashion') {
            avatar.applyCustomization(getDefaultCustomization());
            const type = applyFashionInventoryItem(avatar, item);
            if (!type) throw new Error('Fashion item has no mesh mapping');
            camera.target.set(0, 1.08, 0);
            camera.radius = 2.9;
            camera.alpha = item.itemId.includes('backpack') || item.itemId.includes('wings') ? Math.PI * 1.35 : Math.PI / 2;
            camera.beta = 1.52;
          } else {
            objectRoot?.dispose(false, true);
            objectRoot = null;
            if (FARM_CONFIG.crops[item.itemId]) {
              objectRoot = createCropMesh(scene, item.itemId, 1, `inventory-${item.itemId}`).root;
              for (const mesh of objectRoot.getChildMeshes()) {
                if (mesh.name.includes('soil-') || mesh.name.includes('mound-') || mesh.name.includes('star-')) mesh.setEnabled(false);
              }
            } else objectRoot = createInventoryObjectMesh(scene, item.itemId);
            if (!objectRoot) throw new Error('No 3D object for this item');
            const meshes = objectRoot.getChildMeshes().filter(mesh => mesh.isEnabled() && mesh.getTotalVertices() > 0);
            const bounds = meshes.map(mesh => { mesh.computeWorldMatrix(true); return mesh.getBoundingInfo().boundingBox; });
            const min = bounds.reduce((value, box) => Vector3.Minimize(value, box.minimumWorld), new Vector3(Infinity, Infinity, Infinity));
            const max = bounds.reduce((value, box) => Vector3.Maximize(value, box.maximumWorld), new Vector3(-Infinity, -Infinity, -Infinity));
            camera.target.copyFrom(min.add(max).scale(.5));
            camera.radius = Math.max(.96, Vector3.Distance(min, max) * 1.12);
            camera.alpha = Math.PI * .72;
            camera.beta = 1.27;
          }
          await scene.whenReadyAsync();
          if (cancelled) return;
          scene.render();
          scene.render();
          scene.render();
          const src = canvas.toDataURL('image/png');
          imageCache.set(item.id, src);
          setImages(previous => ({ ...previous, [item.id]: src }));
        } catch (error) {
          console.warn('Inventory mesh image:', item.id, error);
          imageCache.set(item.id, 'unavailable');
          setImages(previous => ({ ...previous, [item.id]: 'unavailable' }));
        }
        if (typeof requestIdleCallback === 'function') idleHandle = requestIdleCallback(next, { timeout: 800 });
        else timer = setTimeout(next, 120);
      };
      timer = setTimeout(next, 120);
    })().catch(error => {
      console.warn('Fish inventory renderer unavailable:', error);
      if (!cancelled) setImages(previous => ({ ...previous, ...Object.fromEntries(pending.map(item => [item.id, 'unavailable'])) }));
      release();
    });

    return () => { cancelled = true; release(); };
  }, [isOpen, category, ids]);

  return images;
}
