/* global THREE, Entity, Destroy */
/* exported Bullet */

class Bullet extends Entity {
  constructor() {
    super(Bullet.GEOMETRY, new THREE.MeshBasicMaterial());

    this.start = new THREE.Vector3();
    this.distance = 256;
  }

  update(dt) {
    super.update(dt);

    if (this.position.distanceTo(this.start) > this.distance) {
      Destroy(this);
    }
  }
}

Bullet.GEOMETRY = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
