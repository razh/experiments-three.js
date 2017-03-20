/* eslint-env es6 */
/* global THREE */
/* exported Entity */

class Entity extends THREE.Mesh {
  constructor(...args) {
    super(...args);

    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
  }

  update(dt) {
    this.velocity.addScaledVector(this.acceleration, dt);
    this.position.addScaledVector(this.velocity, dt);
  }
}
