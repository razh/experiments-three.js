const { THREE } = window;

export const pm_trace = (() => {
  const v = new THREE.Vector3();
  const boxA = new THREE.Box3();
  const boxB = new THREE.Box3();

  return (trace, start, end, a, b) => {
    v.subVectors(end, start);

    let enterFrac = 0;
    let leaveFrac = 1;

    boxA.copy(a).translate(start);
    boxB.copy(b);

    // For each axis, determine times of first and last contact, if any
    for (const i of ['x', 'y', 'z']) {
      const d0 = boxA.min[i] - boxB.max[i];
      const d1 = boxA.max[i] - boxB.min[i];

      if (v[i] === 0) {
        if (d0 >= 0 || d1 <= 0) {
          return false;
        }
      }

      if (v[i] < 0) {
        if (d0 < 0) return false; // Nonintersecting and moving apart
        if (d0 > 0) enterFrac = Math.max(-d0 / v[i], enterFrac);
        if (d1 > 0) leaveFrac = Math.min(-d1 / v[i], leaveFrac);
      }

      if (v[i] > 0) {
        if (d1 < 0) return false; // Nonintersecting and moving apart
        if (d0 > 0) enterFrac = Math.max(d0 / v[i], enterFrac);
        if (d1 > 0) leaveFrac = Math.min(d1 / v[i], leaveFrac);
      }

      // No overlap possible if time of first contact occurs after time of last contact
      if (enterFrac > leaveFrac) return false;
    }

    trace.fraction = enterFrac;
    return true;
  };
})();

export class Trace {
  constructor() {
    this.allsolid = false; // if true, plane is not valid
    this.fraction = 1; // time completed, 1.0 = didn't hit anything
    this.endpos = new THREE.Vector3(); // final position
    this.normal = new THREE.Vector3(); // surface normal at impact, transformed to world space
  }
}
