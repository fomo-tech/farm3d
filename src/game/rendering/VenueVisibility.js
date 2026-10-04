// Hide drawable leaves without recursively propagating Node enabled state.
// Node.setEnabled walks descendants and can become expensive for large worlds.
export class VenueVisibility {
  constructor(scene, protectedRoots = () => []) {
    this.scene = scene;
    this.protectedRoots = protectedRoots;
    this.hidden = new Map();
  }
  hide() {
    const protectedNodes = new Set(this.protectedRoots().filter(Boolean));
    let count = 0;
    for (const mesh of this.scene.meshes) {
      if (mesh.metadata?.interiorVenue || mesh.metadata?.isPlayerMesh || mesh.metadata?.isRemotePlayer) continue;
      let root = mesh, protectedHierarchy = false;
      while (root) {
        if (protectedNodes.has(root)) { protectedHierarchy = true; break; }
        if (!root.parent) break;
        root = root.parent;
      }
      if (protectedHierarchy || !root || mesh.isDisposed?.() || this.hidden.has(mesh)) continue;
      this.hidden.set(mesh, mesh.isVisible);
      mesh.isVisible = false;
      count++;
    }
    return count;
  }
  show() {
    for (const [mesh, visible] of this.hidden) if (!mesh.isDisposed?.()) mesh.isVisible = visible;
    this.hidden.clear();
  }
}
