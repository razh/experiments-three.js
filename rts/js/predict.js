/* global THREE */
/* exported predict */

// Compute time of flight.
const predict = (() => {
  'use strict';

  const delta = new THREE.Vector3();

  return (source, target, muzzleVelocity = 0) => {
    delta.subVectors(target.position, source.position);

    const distance = delta.length();
    const speed = source.velocity.dot(delta.normalize()) + muzzleVelocity;

    return distance / speed;
  };
})();
