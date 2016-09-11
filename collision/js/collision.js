/* eslint-env es6 */
/* global THREE */

/* exported BODY_STATIC, BODY_DYNAMIC */
const BODY_STATIC = 1;
const BODY_DYNAMIC = 2;

// Hacky naïve physics.
/* exported Collision */
const Collision = {
  normal: new THREE.Vector3(),
  penetration: new THREE.Vector3(),

  boxA: new THREE.Box3(),
  boxB: new THREE.Box3(),

  centerA: new THREE.Vector3(),
  centerB: new THREE.Vector3(),

  update(bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const bodyA = bodies[i];

      for (let j = i + 1; j < bodies.length; j++) {
        const bodyB = bodies[j];

        if (!bodyA.physics || !bodyB.physics) {
          continue;
        }

        // Both bodies can't move.
        if (bodyA.physics === BODY_STATIC &&
            bodyB.physics === BODY_STATIC) {
          continue;
        }

        const boxA = Collision.boxA.copy(bodyA.boundingBox).translate(bodyA.position);
        const boxB = Collision.boxB.copy(bodyB.boundingBox).translate(bodyB.position);

        if (boxA.intersectsBox(boxB)) {
          // Resolve collision.
          boxA.center(Collision.centerA);
          boxB.center(Collision.centerB);

          Collision.normal.subVectors(Collision.centerA, Collision.centerB);

          // Determine overlap.
          // d0 is negative side or 'left' side.
          // d1 is positive or 'right' side.
          const d0x = boxB.max.x - boxA.min.x;
          const d1x = boxA.max.x - boxB.min.x;

          const d0y = boxB.max.y - boxA.min.y;
          const d1y = boxA.max.y - boxB.min.y;

          const d0z = boxB.max.z - boxA.min.z;
          const d1z = boxA.max.z - boxB.min.z;

          // Only overlapping on an axis if both ranges intersect.
          let dx = 0;
          if (d0x > 0 && d1x > 0) {
            dx = d0x < d1x ? d0x : -d1x;
          }

          let dy = 0;
          if (d0y > 0 && d1y > 0) {
            dy = d0y < d1y ? d0y : -d1y;
          }

          let dz = 0;
          if (d0z > 0 && d1z > 0) {
            dz = d0z < d1z ? d0z : -d1z;
          }

          Collision.penetration.set(dx, dy, dz);

          if (bodyA.physics === BODY_STATIC) {
            bodyB.position.add(Collision.penetration);
          } else if (bodyB.physics === BODY_STATIC) {
            bodyA.position.add(Collision.penetration);
          } else {
            Collision.penetration.multiplyScalar(0.5);
            bodyA.position.add(Collision.penetration);
            bodyB.position.sub(Collision.penetration);
          }
        }
      }
    }
  }
};
