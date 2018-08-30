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

  checkGround() {
    const objects = [];
    scene.traverse(object => {
      if (object instanceof THREE.Mesh && object !== this.mesh) {
        objects.push(object);
      }
    });

    const boundingBox = new THREE.Box3().setFromObject(this.mesh);
    boundingBox.translate(new THREE.Vector3(0, -0.25, 0));
  }

  stepSlideMove(gravity) {
    const MAX_CLIP_PLANES = 5;
    const numbumps = 4;
  }
}

class Trace {
  constructor() {
    this.allsolid = false; // if true, plane is not valid
    this.fraction = 0; // time completed, 1.0 = didn't hit anything
    this.endpos = undefined; // final position
    this.face = undefined;
    this.normal = undefined; // surface normal at impact, transformed to world space
  }
}

function intersectMovingAABBs(tw, boxA, boxB, velocity) {
  // Intersection moving AABB against AABB from 'Real-Time Collision Detection'.
  let enterFrac = -1;
  let leaveFrac = 1;

  if (boxA.intersects(boxB)) {
    enterFrac = 0;
    leaveFrac = 0;
    return 1;
  }

  // Determine overlap.
  // d0 is negative side or 'left' side.
  // d1 is positive or 'right' side.
  const d0x = boxA.min.x - boxB.max.x;
  const d1x = boxA.max.x - boxB.min.x;

  const d0y = boxA.min.y - boxB.max.y;
  const d1y = boxA.max.y - boxB.min.y;

  const d0z = boxA.min.z - boxB.max.z;
  const d1z = boxA.max.z - boxB.min.z;

  if (v.x < 0) {
    if (d0x > 0) return; // Nonintersecting and moving apart.
    if (d1x < 0) enterFrac = Math.max(d1x / v.x, enterFrac);
    if (d0x < 0) leaveFrac = Math.min(d0x / v.x, leaveFrac);
  }

  if (v.x > 0) {
    if (d1x < 0) return;
    if (d0x > 0) enterFrac = Math.max(d0x / v.x, enterFrac);
    if (d1x > 0) leaveFrac = Math.min(d1x / v.x, leaveFrac);
  }

  if (v.y < 0) {
    if (d0y > 0) return;
    if (d1y < 0) enterFrac = Math.max(d1y / v.y, enterFrac);
    if (d0y < 0) leaveFrac = Math.min(d0y / v.y, leaveFrac);
  }

  if (v.y > 0) {
    if (d1y < 0) return;
    if (d0y > 0) enterFrac = Math.max(d0y / v.y, enterFrac);
    if (d1y > 0) leaveFrac = Math.min(d1y / v.y, leaveFrac);
  }

  if (v.z < 0) {
    if (d0z > 0) return;
    if (d1z < 0) enterFrac = Math.max(d1z / v.z, enterFrac);
    if (d0z < 0) leaveFrac = Math.min(d0z / v.z, leaveFrac);
  }

  if (v.z > 0) {
    if (d1z < 0) return;
    if (d0z > 0) enterFrac = Math.max(d0z / v.z, enterFrac);
    if (d1z > 0) leaveFrac = Math.min(d1z / v.z, leaveFrac);
  }

  if (enterFrac > leaveFrac) {
    return;
  }

  if (enterFrac < tw.trace.fraction) {
    tw.trace.fraction = Math.max(enterFrac, 0);
    tw.trace.normal;
    tw.trace.endpos;
  }
}

const trace = (() => {
  const boxA = new THREE.Box3();
  const boxB = new THREE.Box3();

  const velocity = new THREE.Vector3();

  return (tw, bodyA, bodies) => {
    boxA.copy(bodyA.boundingBox).translate(bodyA.position);

    for (let i = 0; i < bodies.length; i++) {
      const bodyB = bodies[i];
      boxB.copy(bodyB.boundingBox).translate(bodyB.position);
      velocity.subVectors(bodyB.velocity, bodyA.velocity);
      intersectMovingAABBs(tw, boxA, boxB, velocity);
    }

    return tw;
  };
})();
