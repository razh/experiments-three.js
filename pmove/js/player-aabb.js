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
    clipVelocity(this.viewForward, this.groundTrace.normal, OVERCLIP);
    clipVelocity(this.viewRight, this.groundTrace.normal, OVERCLIP);
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

    clipVelocity(this.current.velocity, this.groundTrace.normal, OVERCLIP);

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
      clipVelocity(this.current.velocity, this.groundTrace.normal, OVERCLIP);
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

    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh && object !== this.mesh) {
        objects.push(object);

        if (!object.boundingBox) {
          object.boundingBox = new THREE.Box3()
            .setFromObject(object)
            .translate(object.position.clone().negate());
        }
      }
    });

    const traceWork = {
      trace: new Trace(),
    };

    const point = this.current.position.clone();
    point.y -= 0.25;

    trace(
      traceWork,
      point,
      { boundingBox: this.mesh.boundingBox, velocity: this.current.velocity },
      objects,
      this.frametime,
    );
    this.groundTrace = traceWork.trace;

    if (traceWork.trace.fraction === 1) {
      this.groundPane = false;
      this.walking = false;
      return;
    }

    this.groundPlane = true;
    this.walking = true;
  }

  slideMove() {}

  stepSlideMove(gravity) {
    const start_o = this.current.position.clone();
    const start_v = this.current.velocity.clone();

    const MAX_CLIP_PLANES = 5;
    const numbumps = 4;

    const dir = new THREE.Vector3();
    const _clipVelocity = new THREE.Vector3();
    const endVelocity = new THREE.Vector3();
    const endClipVelocity = new THREE.Vector3();

    if (gravity) {
      // console.log('obj');
      // console.log(this.current.velocity.y.toFixed(2));
      // console.log(this.current.gravity * this.frametime);
      endVelocity.copy(this.current.velocity);
      endVelocity.y -= this.current.gravity * this.frametime;
      this.current.velocity.y = (this.current.velocity.y + endVelocity.y) * 0.5;
      // console.log(this.current.velocity.y.toFixed(2));
      // primal_velocity = endVelocity;
      // if (this.groundPlane) {
      //   // slide along the ground plane
      //   clipVelocity(
      //     this.current.velocity,
      //     this.groundTrace.normal,
      //     calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face),
      //     OVERCLIP,
      //   );
      // }
    }

    // console.log(this.groundTrace.fraction);

    if (gravity) {
      this.current.velocity.copy(endVelocity);
    }
  }
}

class Trace {
  constructor() {
    this.allsolid = false; // if true, plane is not valid
    this.fraction = 0; // time completed, 1.0 = didn't hit anything
    this.endpos = undefined; // final position
    this.face = undefined;
    this.normal = new THREE.Vector3(); // surface normal at impact, transformed to world space
  }
}

function intersectAABBs(tw, boxA, boxB) {}

function intersectMovingAABBs(tw, start, boxA, boxB, end) {
  // Intersection moving AABB against AABB from 'Real-Time Collision Detection'.
  let enterFrac = -1;
  let leaveFrac = 1;

  // console.log(boxA.min, boxA.max, boxB.min, boxB.max);
  //

  // Determine overlap.
  // d0 is negative side or 'left' side.
  // d1 is positive or 'right' side.
  const d0x = boxA.min.x - boxB.max.x;
  const d1x = boxA.max.x - boxB.min.x;

  const d0y = boxA.min.y - boxB.max.y;
  const d1y = boxA.max.y - boxB.min.y;

  const d0z = boxA.min.z - boxB.max.z;
  const d1z = boxA.max.z - boxB.min.z;

  const normal = new THREE.Vector3();

  // if (boxB.min.x === -768) {
  //   console.log(boxA.min.y, boxB.max.y, v.y);
  //   console.log(v.y, d0y / v.y, d1y / v.y);

  //   console.log(
  //     enterFrac,
  //     leaveFrac,
  //     boxB.min.toArray(),
  //     boxB.max.toArray(),
  //     boxA.min.toArray(),
  //     boxA.max.toArray(),
  //     v.toArray()
  //   );
  //   // console.log(v);
  // }

  // Only overlapping on an axis if both ranges intersect.
  let dx = 0;
  if (d0x < 0 && d1x > 0) {
    dx = -d0x < d1x ? d0x : d1x;
  }

  let dy = 0;
  if (d0y < 0 && d1y > 0) {
    dy = -d0y < d1y ? d0y : d1y;
  }

  let dz = 0;
  if (d0z < 0 && d1z > 0) {
    dz = -d0z < d1z ? d0z : d1z;
  }

  // Determine minimum axis of separation.
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const adz = Math.abs(dz);

  if (adx < ady && adx < adz) {
    normal.set(-dx, 0, 0);
  } else if (ady < adz) {
    normal.set(0, -dy, 0);
  } else {
    normal.set(0, 0, -dz);
  }

  if (boxB.intersectsBox(boxA)) {
    tw.trace.allsolid = false;
    tw.trace.normal.copy(normal).normalize();
    return true;
  }

  const v = new THREE.Vector3().subVectors(end, start);

  // console.log(v);
  // console.log(start, end);
  //

  if (v.x < 0) {
    if (d0x > 0) return false; // Nonintersecting and moving apart
    if (d1x < 0) enterFrac = Math.max(d1x / v.x, enterFrac);
    if (d0x < 0) leaveFrac = Math.min(d0x / v.x, leaveFrac);
  }

  if (v.x > 0) {
    if (d1x < 0) return false;
    if (d0x > 0) enterFrac = Math.max(d0x / v.x, enterFrac);
    if (d1x > 0) leaveFrac = Math.min(d1x / v.x, leaveFrac);
  }

  // No overlap possible if time of first contact occurs after time of last contact
  if (enterFrac > leaveFrac) {
    return false;
  }

  if (v.y < 0) {
    if (d0y > 0) return false;
    if (d1y < 0) enterFrac = Math.max(d1y / v.y, enterFrac);
    if (d0y < 0) leaveFrac = Math.min(d0y / v.y, leaveFrac);
  }

  if (v.y > 0) {
    if (d1y < 0) return false;
    if (d0y > 0) enterFrac = Math.max(d0y / v.y, enterFrac);
    if (d1y > 0) leaveFrac = Math.min(d1y / v.y, leaveFrac);
  }

  if (enterFrac > leaveFrac) {
    return false;
  }

  if (v.z < 0) {
    if (d0z > 0) return false;
    if (d1z < 0) enterFrac = Math.max(d1z / v.z, enterFrac);
    if (d0z < 0) leaveFrac = Math.min(d0z / v.z, leaveFrac);
  }

  if (v.z > 0) {
    if (d1z < 0) return false;
    if (d0z > 0) enterFrac = Math.max(d0z / v.z, enterFrac);
    if (d1z > 0) leaveFrac = Math.min(d1z / v.z, leaveFrac);
  }

  if (enterFrac > leaveFrac) {
    return false;
  }

  if (enterFrac > -1 && enterFrac < tw.trace.fraction) {
    // if (boxB.min.x === -768) {
    //   console.log(boxA.min.y, boxB.max.y, v.y);
    //   console.log(v.y, d0y / v.y, d1y / v.y);

    //   console.log(
    //     enterFrac,
    //     leaveFrac,
    //     boxB.min.toArray(),
    //     boxB.max.toArray(),
    //     boxA.min.toArray(),
    //     boxA.max.toArray(),
    //     v.toArray()
    //   );
    //   // console.log(v);
    // }


    tw.trace.fraction = Math.max(enterFrac, 0);
    tw.trace.normal.copy(normal);
    tw.trace.endpos = start.clone().addScaledVector(v, tw.trace.fraction);
    return true;
  }

  return false;
}

const ZERO = new THREE.Vector3();

const trace = (() => {
  const boxA = new THREE.Box3();
  const boxB = new THREE.Box3();

  const end = new THREE.Vector3();
  const velocity = new THREE.Vector3();

  return (tw, start, bodyA, bodies, dt) => {
    boxA.copy(bodyA.boundingBox).translate(start);

    tw.trace.fraction = 1; // assume it goes the entire distance until shown otherwise

    let count = 0;

    for (let i = 0; i < bodies.length; i++) {
      const bodyB = bodies[i];
      bodyB.material.color.set('#fff');
      boxB.copy(bodyB.boundingBox).translate(bodyB.position);
      velocity.subVectors(bodyB.velocity || ZERO, bodyA.velocity || ZERO);
      end.copy(start).addScaledVector(velocity, dt);
      if (intersectMovingAABBs(tw, start, boxA, boxB, end)) {
        bodyB.material.color.set('#0f0');
        count++;
      }
    }

    // console.log(count);

    return tw;
  };
})();

// const traceBox = (() => {
//   return (tw, start, boundingBox, end, scene) => {
//   };
// })();
