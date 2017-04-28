/* global THREE */
/* exported predict */

// Compute time of flight.
// http://wiki.unity3d.com/index.php/Calculating_Lead_For_Projectiles
const predict = (() => {
  'use strict';

  const dx = new THREE.Vector3();
  const dv = new THREE.Vector3();

  return (source, target, muzzleVelocity = 0) => {
    dx.subVectors(target.position, source.position);
    dv.subVectors(target.velocity, source.velocity);

    const a = dv.lengthSq() - (muzzleVelocity * muzzleVelocity);
    const b = 2 * dv.dot(dx);
    const c = dx.lengthSq();

    if (a === 0) {
      if (b === 0) {
        return;
      }

      return -c / b;
    }

    const d = (b * b) - (4 * a * c);

    if (d < 0) {
      return;
    }

    const p = -b / (2 * a);

    if (d === 0) {
      return p;
    }

    const q = Math.sqrt(d) / (2 * a);

    const t0 = p - q;
    const t1 = p + q;

    if (t0 >= 0 && t1 >= 0) {
      return Math.min(t0, t1);
    } else if (t0 >= 0) {
      return t0;
    } else if (t1 >= 0) {
      return t1;
    }

    return;
  };
})();
