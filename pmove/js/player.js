const { THREE } = window;

// movement parameters
const PM_STOPSPEED = 100;

const PM_ACCELERATE = 10;
const PM_AIRACCELERATE = 1;

const PM_FRICTION = 6;

class PlayerState {
  constructor() {
    this.position = new THREE.Vector3(),
    this.velocity = new THREE.Vector3(),
  }
}

export default class Player {
  constructor() {
    this.current = new PlayerState();

    // run-time variables
    this.frametime = 0;

    // walk movement
    this.walking = false;
    this.groundPlane = false;
  }

  update() {
    this.groundTrace();

    if (this.walking) {
      // walking on ground
      this.walkMove();
    } else {
      // airborne
      this.airMove();
    }

    this.groundTrace();
  }

  checkJump() {

  }

  walkMove() {

  }

  airMove() {

  }

  friction() {
    const vel = this.current.velocity;

    const vec = vel.clone();
    if (this.walking) {
      vec.y = 0; // ignore slope movement
    }

    speed = vec.length();
    if (speed < 1)  {
      vel.x = 0;
      vel.z = 0; // allow sinking underwater
      // FIXME: still have z friction underwater?
      return;
    }

    let drop = 0;

    // apply ground friction
    if (this.walking) {
      const control = speed < PM_STOPSPEED ? PM_STOPSPEED : speed;
      drop += control * PM_FRICTION * this.frametime;
    }

    // scale the velocity
    let newspeed = speed - drop;
    if (newspeed < 0) {
      newspeed = 0;
    }
    newspeed /= speed;

    vel.multiplyScalar(newspeed);
  }

  accelerate(wishdir, wishspeed, accel) {
    const currentspeed = this.current.velocity.dot(wishdir);
    const addspeed = wishspeed - currentspeed;
    if (addspeed <= 0) {
      return;
    }
    const accelspeed = accel * this.frametime * wishspeed;
    if (accelspeed > addspeed) {
      accelspeed = addspeed;
    }

    this.current.velocity.addScaledVector(wishdir, accelspeed);
  }
}
