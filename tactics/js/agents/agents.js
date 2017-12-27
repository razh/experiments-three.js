/* global THREE */
/* exported Agent */

class Agent extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(),
      new THREE.MeshBasicMaterial()
    );
  }
}
