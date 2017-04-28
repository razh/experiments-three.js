/* global THREE */
/* exported Entity */

class Entity extends THREE.Mesh {
  constructor(...args) {
    super(...args);

    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();

    this.previousPosition = new THREE.Vector3();
    this.previousVelocity = new THREE.Vector3();
  }

  update(dt) {
    this.previousPosition.copy(this.position);
    this.previousVelocity.copy(this.velocity);

    this.velocity.addScaledVector(this.acceleration, dt);
    this.position.addScaledVector(this.velocity, dt);
  }
}
