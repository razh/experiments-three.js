/* global THREE, Entity */

class Missile extends Entity {
  constructor() {
    super(Missile.GEOMETRY, new THREE.MeshBasicMaterial());
  }
}

Missile.GEOMETRY = new THREE.ConeBufferGeometry(4, 8, 4).rotateX(Math.PI / 2);
