import { beachWaterAt } from '../../../shared/beachConfig.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

// Explicit diagnostic only, never scanned in the render loop.
export function auditCoastalMeshes(scene) {
  const found=[]; let thinPlacementsChecked=0;
  for(const mesh of scene.meshes) {
    if(!/road|dash|curb|lamp|tree|palm|foliage|umbrella|lounger|fence|flower|bush|rock|bench|hay|pumpkin|bus-|stop-/i.test(mesh.name) || !mesh.getTotalVertices()) continue;
    let node=mesh, names=[];
    while(node) { names.push(node.name);node=node.parent; }
    if(names.some(name=>/steamboat|fishing-pier|bridge-|template/i.test(name))) continue;
    mesh.computeWorldMatrix(true);
    if(mesh.hasThinInstances) {
      for(const matrix of mesh.thinInstanceGetWorldMatrices()) {
        const p=Vector3.TransformCoordinates(matrix.getTranslation(),mesh.getWorldMatrix());
        thinPlacementsChecked++;
        if(beachWaterAt(p.x,p.z)) found.push({name:mesh.name,kind:'thin-instance-center',hit:{x:p.x,z:p.z},enabled:mesh.isEnabled(),visible:mesh.isVisible});
      }
      continue;
    }
    const b=mesh.getBoundingInfo().boundingBox, a=b.minimumWorld,c=b.maximumWorld;
    if(c.z<350 || a.z>970 || a.y>20 || c.x<-550 || a.x>550) continue;
    let hit=null;
    for(let i=0;i<=12&&!hit;i++) for(let j=0;j<=12;j++) {
      const x=a.x+(c.x-a.x)*i/12,z=a.z+(c.z-a.z)*j/12;
      if(beachWaterAt(x,z)) { hit={x:Math.round(x*10)/10,z:Math.round(z*10)/10};break; }
    }
    if(hit) found.push({name:mesh.name,parents:names.slice(1,4),enabled:mesh.isEnabled(),visible:mesh.isVisible,hit});
  }
  return {count:found.length,thinPlacementsChecked,meshes:found.slice(0,100)};
}
