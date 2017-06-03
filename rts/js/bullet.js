/* global THREE, Entity, Destroy */
/* exported Bullet */

class DestroyAfterDistanceTraveledComponent {
  constructor(distance) {
    this.start = new THREE.Vector3();
    this.distance = distance;
  }

  update() {
    if (this.parent.position.distanceTo(this.start) > this.distance) {
      Destroy(this.parent);
    }
  }
}

class Bullet extends Entity {
  constructor() {
    super(Bullet.GEOMETRY, new THREE.MeshBasicMaterial());

    this.type = 'Bullet';

    this.addComponent(
      new DestroyAfterDistanceTraveledComponent(256)
    );
  }
}

Bullet.GEOMETRY = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
