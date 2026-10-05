import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { LAKE_CENTER, LAKE_CONFIG } from '../../../shared/lakeConfig.js';

// Each builder owns its materials, observer and shadow registrations. Disposing
// and rebuilding the lake must not leave animations or GPU resources behind.
export function createLakeSceneScope(scene, name, shadows) {
  const root = new TransformNode(name, scene);
  const detail = new TransformNode(`${name}-detail`, scene); detail.parent = root;
  const materials = [];
  const animations = [];
  let disposed=false, detailed=true, nextDistanceCheck=0, animationFrames=0;
  root.metadata = { district: 'crystal-lake', detailEnabled: true, animationFrames: 0 };
  const observer = scene.onBeforeRenderObservable.add(() => {
    if(disposed || !root.isEnabled()) return;
    const now=performance.now();
    if(now>=nextDistanceCheck) {
      nextDistanceCheck=now+250;
      const camera=scene.activeCamera;
      const locked=camera?.lockedTarget;
      const focus=locked?.getAbsolutePosition?.() ?? locked?.position ?? camera?.getTarget?.() ?? camera?.target ?? camera?.globalPosition;
      if(focus) {
        const distanceSquared=(focus.x-LAKE_CENTER.x)**2+(focus.z-LAKE_CENTER.z)**2;
        const threshold=detailed ? LAKE_CONFIG.keepDetailDistance : LAKE_CONFIG.detailDistance;
        const next=distanceSquared<=threshold*threshold;
        if(next!==detailed) {detailed=next;detail.setEnabled(next);root.metadata.detailEnabled=next;}
      }
    }
    if(!detailed) return;
    const time=now*.001;
    for(const animate of animations) animate(time);
    root.metadata.animationFrames=++animationFrames;
  });
  const cleanup = () => {
    if(disposed)return;
    disposed=true;
    scene.onBeforeRenderObservable.remove(observer);
    for(const mesh of root.getChildMeshes()) shadows?.removeShadowCaster(mesh);
    animations.length=0;
    for(const material of materials) material.dispose(false,false);
  };
  root.onDisposeObservable.addOnce(cleanup);
  return {
    root,detail,
    material(name,hex) {
      const material=new StandardMaterial(name,scene);
      material.diffuseColor=Color3.FromHexString(hex);
      material.specularColor=Color3.Black();
      materials.push(material);return material;
    },
    own(mesh,material,parent=root,{staticMesh=true,castShadow=false}={}) {
      mesh.material=material;mesh.parent=parent;mesh.isPickable=false;
      mesh.receiveShadows=true;
      mesh.metadata={...mesh.metadata,lakeStatic:staticMesh};
      if(castShadow)shadows?.addShadowCaster(mesh);
      return mesh;
    },
    animate(callback) {animations.push(callback);},
    dispose() {cleanup();if(!root.isDisposed())root.dispose(false,false);},
  };
}
