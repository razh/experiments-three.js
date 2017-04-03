/* global quaternionAngle */
/* exported quaternionRotateTowards */

function quaternionRotateTowards(a, b, speed) {
  'use strict';

  const angle = quaternionAngle(a, b);
  const t = Math.min(speed / angle, 1);
  return a.slerp(b, t);
}
