/* global THREE */
/* exported Agent */

class Agent extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry( 1, 1 ),
      new THREE.MeshBasicMaterial()
    );
  }
}
