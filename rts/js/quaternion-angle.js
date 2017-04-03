/* exported quaternionAngle */

// Computes the angle in radians between two quaternions.
function quaternionAngle(a, b) {
  'use strict';

  const dot = a.dot(b);
  return 2 * Math.acos(Math.min(Math.abs(dot), 1));
}
