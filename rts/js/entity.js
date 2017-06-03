/* global THREE, withEntity */
/* exported Entity */

class Body {
  constructor() {
    this.type = 'Body';
  }

  update(dt) {
    const { parent } = this;

    parent.previousPosition.copy(parent.position);
    parent.previousVelocity.copy(parent.velocity);

    parent.velocity.addScaledVector(parent.acceleration, dt);
    parent.position.addScaledVector(parent.velocity, dt);
  }
}

class Entity extends withEntity(THREE.Mesh) {
  constructor(...args) {
    super(...args);

    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();

    this.previousPosition = new THREE.Vector3();
    this.previousVelocity = new THREE.Vector3();

    this.addComponent(new Body());
  }
}
