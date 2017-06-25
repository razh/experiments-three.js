/* global THREE */
/* exported predictMissile */

// http://www.moddb.com/members/blahdy/blogs/gamedev-introduction-to-proportional-navigation-part-i
const predictMissile = (() => {
  'use strict';

  const vector = new THREE.Vector3();

  const pdx = new THREE.Vector3();
  const dx = new THREE.Vector3();

  // Line-of-sight delta.
  const losDelta = new THREE.Vector3();

  return (source, target, dt, navigationConstant = 3) => {
    pdx.subVectors(target.previousPosition, source.previousPosition);
    dx.subVectors(target.position, source.position);

    if (!pdx.lengthSq()) {
      return;
    }

    pdx.normalize();
    dx.normalize();

    losDelta.subVectors(dx, pdx);
    vector.copy(losDelta).projectOnVector(dx);

    return dx
      .multiplyScalar(dt)
      .add(losDelta.sub(vector).multiplyScalar(navigationConstant));
  };
})();
