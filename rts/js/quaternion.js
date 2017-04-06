'use strict';

// Computes the angle in radians between two quaternions.
function quaternionAngle(a, b) {
  const dot = a.dot(b);
  return 2 * Math.acos(Math.min(Math.abs(dot), 1));
}

/* exported quaternionRotateTowards */
function quaternionRotateTowards(a, b, speed) {
  const angle = quaternionAngle(a, b);
  const t = Math.min(speed / angle, 1);
  return a.slerp(b, t);
}
