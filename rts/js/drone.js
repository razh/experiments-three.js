/* global THREE, Entity */
/* exported Drone */

class Drone extends Entity {
  constructor(path) {
    const geometry = new THREE.IcosahedronBufferGeometry(1);
    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
    });

    super(geometry, material);

    this.path = path;
    this.time = 0;
    this.speed = 1;
  }

  update(dt) {
    if (!this.path) {
      return;
    }

    const duration = this.path.getLength() / this.speed;

    this.time += dt;
    const t = (this.time / duration) % 1;
    const point = this.path.getPointAt(t);

    this.velocity
      .subVectors(point, this.position)
      .divideScalar(dt);

    this.position.copy(point);
  }
}
