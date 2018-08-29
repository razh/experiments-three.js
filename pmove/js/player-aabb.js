const { THREE } = window;

const PMF_JUMP_HELD = 1;

const STEPSIZE = 18;

const JUMP_VELOCITY = 270;

const OVERCLIP = 1.001;

// movement parameters
const PM_STOPSPEED = 100;

const PM_ACCELERATE = 10;
const PM_AIRACCELERATE = 1;

const PM_FRICTION = 6;

const g_speed = 320;
const g_gravity = 800;

class PlayerState {
  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.gravity = 0;
    this.movementFlags = 0;
  }
}

function clipVelocity(vector, normal, overbounce) {
  let backoff = vector.dot(normal);

  if (backoff < 0) {
    backoff *= overbounce;
  } else {
    backoff /= overbounce;
  }

  vector.addScaledVector(normal, -backoff);
}

export class Player {
  constructor() {
    this.mesh = undefined;
    this.scene = undefined;

    this.current = new PlayerState();

    // player input
    this.command = {
      forwardmove: 0,
      rightmove: 0,
      upmove: 0,
    };

    // run-time variables
    this.frametime = 0;
    this.current.gravity = g_gravity;
    this.playerSpeed = g_speed;
    this.viewForward = new THREE.Vector3();
    this.viewRight = new THREE.Vector3();

    // walk movement
    this.walking = false;
    this.groundPlane = false;
    this.groundTrace = {
      face: {
        normal: new THREE.Vector3(0, 1, 0),
      },
    };
  }

  update() {
    if (this.command.upmove < 10) {
      // not holding jump
      this.current.movementFlags &= ~PMF_JUMP_HELD;
    }

    this.checkGround();

    if (this.walking) {
      // walking on ground
      this.walkMove();
    } else {
      // airborne
      this.airMove();
    }

    this.checkGround();

    this.current.position.addScaledVector(
      this.current.velocity,
      this.frametime,
    );
  }

  checkJump() {
    if (this.command.upmove < 10) {
      // not holding jump
      return false;
    }

    if (this.current.movementFlags & PMF_JUMP_HELD) {
      this.command.upmove = 0;
      return false;
    }

    this.groundPlane = false;
    this.walking = false;
    this.current.movementFlags |= PMF_JUMP_HELD;

    this.current.velocity.y = JUMP_VELOCITY;

    return true;
  }

  friction() {
    const vel = this.current.velocity;

    const vec = vel.clone();
    if (this.walking) {
      vec.y = 0; // ignore slope movement
    }

    const speed = vec.length();
    if (speed < 1) {
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

  cmdScale() {
    let max = Math.abs(this.command.forwardmove);
    if (Math.abs(this.command.rightmove) > max) {
      max = Math.abs(this.command.rightmove);
    }

    if (Math.abs(this.command.upmove) > max) {
      max = Math.abs(this.command.upmove);
    }

    if (!max) {
      return 0;
    }

    const total = Math.sqrt(
      this.command.forwardmove ** 2 +
        this.command.rightmove ** 2 +
        this.command.upmove ** 2,
    );
    const scale = (this.playerSpeed * max) / (127 * total);

    return scale;
  }

  accelerate(wishdir, wishspeed, accel) {
    const currentspeed = this.current.velocity.dot(wishdir);
    const addspeed = wishspeed - currentspeed;
    if (addspeed <= 0) {
      return;
    }
    let accelspeed = accel * this.frametime * wishspeed;
    if (accelspeed > addspeed) {
      accelspeed = addspeed;
    }

    this.current.velocity.addScaledVector(wishdir, accelspeed);
  }
}
