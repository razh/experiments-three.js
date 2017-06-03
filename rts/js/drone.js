/* global THREE, Entity */
/* exported Drone */

class FollowPathComponent {
  constructor(path) {
    this.path = path;
    this.time = 0;
    this.speed = 4;
  }

  update(dt) {
    if (!this.path) {
      return;
    }

    const duration = this.path.getLength() / this.speed;

    this.time += dt;
    const t = (this.time / duration) % 1;
    const point = this.path.getPointAt(t);

    this.parent.velocity
      .subVectors(point, this.parent.position)
      .divideScalar(dt);
  }
}

class Drone extends Entity {
  constructor(path) {
    const geometry = new THREE.IcosahedronBufferGeometry(2);
    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
    });

    super(geometry, material);

    this.addComponent(
      new FollowPathComponent(path)
    );
  }
}
