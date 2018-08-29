/* global Debug */

const { THREE } = window;

const PMF_JUMP_HELD = 1;

const MIN_WALK_NORMAL = 0.7; // can't walk on very steep slopes
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

  // console.log({ vector: vector.clone(), normal, backoff });
  if (vector.y < -200) {
    vector.addScaledVector(normal, -backoff);
  } else {
    vector.addScaledVector(normal, -backoff);
  }
  // console.log(vector);
}

// HACK: Should store a reference to scene instead.
function getScene(object) {
  while (object.parent) {
    object = object.parent;
  }

  return object;
}

let intersectionMeshes = [];

export class Player {
  constructor() {
    this.mesh = undefined;

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
    // clipVelocity(this.viewForward, calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face), OVERCLIP);
    // clipVelocity(this.viewRight, calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face), OVERCLIP);
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
    let oldVelocity = this.current.velocity.clone();

    const y = this.current.velocity.y;
    // slide along the ground plane
    clipVelocity(this.current.velocity, this.groundTrace.face.normal, OVERCLIP);
    // clipVelocity(this.current.velocity, calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face), OVERCLIP);

    // Doom 3 fix.
    // if (oldVelocity.dot(this.current.velocity) > 0.0) {
    //   const newVel = this.current.velocity.length();
    //   if (newVel > 1.0) {
    //     const oldVel = oldVelocity.length();
    //     if (oldVel > 1.0) {
    //       // don't decrease velocity when going up or down a slope
    //       this.current.velocity.multiplyScalar(oldVel / newVel);
    //     }
    //   }
    // }

    // // don't decrease velocity when going up or down a slope
    // this.current.velocity.normalize();
    // this.current.velocity.multiplyScalar(vel);

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
        // calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face),
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
    const scene = getScene(this.mesh);
    scene.traverse(object => {
      if (
        object instanceof THREE.Mesh &&
        object !== this.mesh &&
        !intersectionMeshes.includes(object)
      ) {
        objects.push(object);
      }
    });

    scene.remove(...intersectionMeshes);

    const boundingBox = new THREE.Box3().setFromObject(this.mesh);
    boundingBox.translate(new THREE.Vector3(0, -0.25, 0));

    const intersections = trace(boundingBox, objects);
    // this.groundTrace = intersections[0];
    if (!intersections.length) {
      this.groundPlane = false;
      this.walking = false;
      return;
    }

    Debug.i = intersections.map(i => i.point.toArray().map(Math.round));

    intersectionMeshes = intersections.map(intersection => {
      const mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(),
        new THREE.MeshStandardMaterial({ color: '#0f0' }),
      );
      mesh.position.copy(intersection.point);
      // console.log(mesh.position);
      scene.add(mesh);
      return mesh;
    });

    const intersection = intersections[0];

    const normal = calculateNormal(
      intersection.object.geometry,
      intersection.face,
    );
    normal.applyMatrix4(intersection.object.matrixWorld);

    // slopes that are too steep will not be considered onground
    if (normal.y < MIN_WALK_NORMAL) {
      this.groundPlane = false;
      this.walking = false;
      return;
    }

    this.groundPlane = true;
    this.walking = true;
  }

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
      if (this.groundPlane) {
        // slide along the ground plane
        clipVelocity(
          this.current.velocity,
          this.groundTrace.face.normal,
          calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face),
          OVERCLIP,
        );
      }
    }


    /*
    const objects = [];
    const scene = getScene(this.mesh);
    scene.traverse(object => {
      if (
        object instanceof THREE.Mesh &&
        object !== this.mesh &&
        !intersectionMeshes.includes(object)
      ) {
        objects.push(object);
      }
    });

    let time_left = this.frametime;

    let numplanes;
    const planes = [];

    // never turn against the ground plane
    if (this.groundPlane) {
      numplanes = 1;
      planes[0] = calculateNormal(this.groundTrace.object.geometry, this.groundTrace.face).clone();
    } else {
      numplanes = 0;
    }

    // never turn against original velocity
    planes[numplanes] = this.current.velocity.clone().normalize();
    numplanes++;

    const end = new THREE.Vector3();
    let _trace;
    for (let bumpcount = 0; bumpcount < numbumps; bumpcount++) {
      // calculate position we are trying to move to
      end.copy(this.current.velocity).multiplyScalar(time_left);

      const boundingBox = new THREE.Box3().setFromObject(this.mesh);
      boundingBox.translate(end);

      // see if we can make it there
      _trace = trace(boundingBox, objects)[0];
      const EMPTY = {};
      _trace = _trace || EMPTY;

      if (_trace.allsolid) {
        // entity is completely trapped in another solid
        this.current.velocity.y = 0; // don't build up falling damage, but allow sideways acceleration
        return true;
      }

      if (_trace.fraction > 0) {
        // actually covered some distance
        this.current.position.copy(_trace.endpos);
      }

      if (_trace.fraction === 1 || _trace === EMPTY) {
        break; // moved the entire distance
      }

      time_left -= time_left * _trace.fraction;

      if (numplanes >= MAX_CLIP_PLANES) {
        // this shouldn't really happen
        this.current.velocity.setScalar(0);
        return true;
      }

      // if this is the same plane we hit before, nudge velocity
      // out along it, which fixes some epsilon issues with
      // non-axial planes
      let i;
      for (i = 0; i < numplanes; i++) {
        const normal = calculateNormal(_trace.object.geometry, _trace.face);
        if (normal.dot(planes[i]) > 0.99) {
          this.current.velocity.add(normal);
          break;
        }
      }
      if (i < numplanes) {
        continue;
      }
      planes[numplanes] = calculateNormal(_trace.object.geometry, _trace.face).clone();
      numplanes++;

      // modify velocity so it parallels all of the clip planes

      // find a plane that it enters
      for (i = 0; i < numplanes; i++) {
        let into = this.current.velocity.dot(planes[i]);
        if (into >= 0.01) {
          continue; // move doesn't interact with the plane
        }

        // slide along the plane
        _clipVelocity.copy(this.current.velocity);
        clipVelocity(_clipVelocity, planes[i], OVERCLIP);

        // slide along the plane
        endClipVelocity.copy(endVelocity);
        clipVelocity(endVelocity, planes[i], OVERCLIP);

        // see if there is a second plane that the new move enters
        for (let j = 0; j < numplanes; j++) {
          if (j === i) {
            continue;
          }
          if (_clipVelocity.dot(planes[j]) >= 0.1) {
            continue; // move doesn't interact with the plane
          }

          // try clipping the move to the plane
          clipVelocity(_clipVelocity, planes[j], OVERCLIP);
          clipVelocity(endClipVelocity, planes[j], OVERCLIP);

          // see if it goes back into the first clip plane
          if (_clipVelocity.dot(planes[i]) >= 0) {
            continue;
          }

          // slide the original velocity along the crease
          dir
            .crossVectors(planes[i], planes[j])
            .normalize();

          let d = dir.dot(this.current.velocity);
          _clipVelocity.copy(dir).multiplyScalar(d);

          d = dir.dot(endVelocity);
          endClipVelocity.copy(dir).multiplyScalar(d);

          // see if there is a third plane that the new move enters
          for (let k = 0; k < numplanes; k++) {
            if (k === i || k === j) {
              continue;
            }
            if (_clipVelocity.dot(planes[k]) >= 0.1) {
              continue; // move doesn't interact with the plane
            }

            // stop dead at a triple plane intersection
            this.current.velocity.setScalar(0);
            return true;
          }
        }

        // if we have fixed all interactions, try another move
        this.current.velocity.copy(_clipVelocity);
        endVelocity.copy(endClipVelocity);
        break;
      }
    }
    */

    if (gravity) {
      this.current.velocity.copy(endVelocity);
    }
  }
}

const trace = (() => {
  const raycaster = new THREE.Raycaster();
  const { ray } = raycaster;

  const distances = [];

  return (boundingBox, objects) => {
    const { min, max } = boundingBox;
    boundingBox.getCenter(ray.origin);

    const intersections = [];
    let index = 0;

    function raycast(x, y, z) {
      ray.direction.set(x, y, z);

      const distance = ray.direction.distanceTo(ray.origin);
      distances[index++] = distance;

      ray.direction.sub(ray.origin).normalize();
      intersections.push(...raycaster.intersectObjects(objects));
    }

    raycast(min.x, min.y, min.z); // 000
    raycast(min.x, min.y, max.z); // 001
    raycast(min.x, max.y, min.z); // 010
    raycast(min.x, max.y, max.z); // 011
    raycast(max.x, min.y, min.z); // 100
    raycast(max.x, min.y, max.z); // 101
    raycast(max.x, max.y, min.z); // 110
    raycast(max.x, max.y, max.z); // 111

    return intersections
      .filter(
        (intersection, index) =>
          intersection.distance < distances[index] * OVERCLIP,
      )
      .sort((a, b) => a.distance - b.distance);
  };
})();

const calculateNormal = (() => {
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  return (geometry, face, normal = new THREE.Vector3()) => {
    if (geometry instanceof THREE.BufferGeometry) {
      throw new Error('Cannot calculate normals for THREE.BufferGeometry');
    }

    const a = geometry.vertices[face.a];
    const b = geometry.vertices[face.b];
    const c = geometry.vertices[face.c];

    edge1.subVectors(b, a);
    edge2.subVectors(c, a);

    return normal.crossVectors(edge1, edge2).normalize();
  };
})();
