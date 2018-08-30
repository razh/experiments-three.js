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

  walkMove() {
    if (this.checkJump()) {
      this.airMove();
      return;
    }

    this.friction();

    const fmove = this.command.forwardmove;
    const smove = this.command.rightmove;

    const cmd = this.command;
    const scale = this.cmdScale(cmd);

    // project moves down to flat plane
    this.viewForward.y = 0;
    this.viewRight.y = 0;

    // project the forward and right directions onto the ground plane
    clipVelocity(this.viewForward, this.groundTrace.face.normal, OVERCLIP);
    clipVelocity(this.viewRight, this.groundTrace.face.normal, OVERCLIP);
    //
    this.viewForward.normalize();
    this.viewRight.normalize();

    const wishvel = new THREE.Vector3()
      .addScaledVector(this.viewForward, fmove)
      .addScaledVector(this.viewRight, smove);

    const wishdir = wishvel.clone();
    let wishspeed = wishdir.length();
    wishdir.normalize();
    wishspeed *= scale;

    this.accelerate(wishdir, wishspeed, PM_ACCELERATE);

    const vel = this.current.velocity.length();

    clipVelocity(this.current.velocity, this.groundTrace.face.normal, OVERCLIP);

    // don't decrease velocity when going up or down a slope
    this.current.velocity.normalize();
    this.current.velocity.multiplyScalar(vel);

    // don't do anything if standing still
    if (!this.current.velocity.x && !this.current.velocity.z) {
      return;
    }

    this.stepSlideMove(false);
  }

  airMove() {
    this.friction();

    const fmove = this.command.forwardmove;
    const smove = this.command.rightmove;

    const cmd = this.command;
    const scale = this.cmdScale(cmd);

    // project moves down to flat plane
    this.viewForward.y = 0;
    this.viewRight.y = 0;
    this.viewForward.normalize();
    this.viewRight.normalize();

    const wishvel = new THREE.Vector3()
      .addScaledVector(this.viewForward, fmove)
      .addScaledVector(this.viewRight, smove);
    wishvel.y = 0;

    const wishdir = wishvel.clone();
    let wishspeed = wishdir.length();
    wishdir.normalize();
    wishspeed *= scale;

    // not on ground, so little effect on velocity
    this.accelerate(wishdir, wishspeed, PM_AIRACCELERATE);

    // we may have a ground plane that is very steep, even
    // though we don't have a groundentity
    // slide along the steep plane
    if (this.groundPlane) {
      clipVelocity(
        this.current.velocity,
        this.groundTrace.face.normal,
        OVERCLIP,
      );
    }

    this.stepSlideMove(true);
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

  checkGround() {}

  stepSlideMove(gravity) {
    const MAX_CLIP_PLANES = 5;
    const numbumps = 4;
  }
}

const trace = (() => {
  const boxA = new THREE.Box3();
  const boxB = new THREE.Box3();

  return (tw, bodyA, bodies) => {
    boxA.copy(bodyA.boundingBox);

    const intersections = [];

    for (let i = 0; i < bodies.length; i++) {
      const bodyB = bodies[i];

      boxB.copy(bodyB.boundingBox).translate(bodyB.position);

      // Intersection moving AABB against AABB from 'Real-Time Collision Detection'.
      let enterFrac;
      let leaveFrac;

      if (boxA.intersects(boxB)) {
        enterFrac = 0;
        leaveFrac = 0;
        return 1;
      }

      const v = bodyB.sub(bodyA.velocity);

      enterFrac = 0;
      leaveFrac = 1;

      if (v.x < 0) {
        if (boxB.max.x < boxA.min.x) return 0; // Nonintersecting and moving apart.
        if (boxA.max.x < boxB.min.x)
          enterFrac = Math.max((boxA.max.x - boxB.min.x) / v.x, enterFrac);
        if (boxB.max.x > boxA.min.x)
          leaveFrac = Math.min((boxA.min.x - boxB.max.x) / v.x, leaveFrac);
      }

      if (v.x > 0) {
        if (boxB.min.x > boxA.max.x) return 0; // Nonintersecting and moving apart.
        if (boxB.max.x < boxA.min.x)
          enterFrac = Math.max((boxA.min.x - boxB.max.x) / v.x, enterFrac);
        if (boxA.max.x > boxB.min.x)
          leaveFrac = Math.min((boxA.max.x - boxB.min.x) / v.x, leaveFrac);
      }

      if (v.y < 0) {
        if (boxB.max.y < boxA.min.y) return 0; // Nonintersecting and moving apart.
        if (boxA.max.y < boxB.min.y)
          enterFrac = Math.max((boxA.max.y - boxB.min.y) / v.y, enterFrac);
        if (boxB.max.y > boxA.min.y)
          leaveFrac = Math.min((boxA.min.y - boxB.max.y) / v.y, leaveFrac);
      }

      if (v.y > 0) {
        if (boxB.min.y > boxA.max.y) return 0; // Nonintersecting and moving apart.
        if (boxB.max.y < boxA.min.y)
          enterFrac = Math.max((boxA.min.y - boxB.max.y) / v.y, enterFrac);
        if (boxA.max.y > boxB.min.y)
          leaveFrac = Math.min((boxA.max.y - boxB.min.y) / v.y, leaveFrac);
      }

      if (v.z < 0) {
        if (boxB.max.z < boxA.min.z) return 0; // Nonintersecting and moving apart.
        if (boxA.max.z < boxB.min.z)
          enterFrac = Math.max((boxA.max.z - boxB.min.z) / v.z, enterFrac);
        if (boxB.max.z > boxA.min.z)
          leaveFrac = Math.min((boxA.min.z - boxB.max.z) / v.z, leaveFrac);
      }

      if (v.z > 0) {
        if (boxB.min.z > boxA.max.z) return 0; // Nonintersecting and moving apart.
        if (boxB.max.z < boxA.min.z)
          enterFrac = Math.max((boxA.min.z - boxB.max.z) / v.z, enterFrac);
        if (boxA.max.z > boxB.min.z)
          leaveFrac = Math.min((boxA.max.z - boxB.min.z) / v.z, leaveFrac);
      }

      if (enterFrac > leaveFrac) {
        return 0;
      }

      return 1;
    }

    return intersections;
  };
})();
