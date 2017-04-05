/* global THREE, Weapon, Bullet */
/* exported Gun */

class Gun extends Weapon {
  constructor(...args) {
    super(...args);

    this.muzzleVelocity = 128;
    this.offset = new THREE.Vector3();
  }

  fire() {
    const bullet = new Bullet();

    bullet.position.copy(this.offset)
      .applyQuaternion(this.parent.quaternion)
      .add(this.parent.position);

    // Fire in parent direction.
    bullet.velocity.set(0, 0, this.muzzleVelocity)
      .applyQuaternion(this.parent.quaternion)
      .add(this.parent.velocity);

    return bullet;
  }
}
