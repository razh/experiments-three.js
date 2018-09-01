const { THREE } = window;

export const pm_trace = (() => {
  const delta = new THREE.Vector3();
  return (trace, start, end, boxA, boxB) => {
    delta.subVectors(end, start);



    return boxA.intersectsBox(boxB);
  };
})();

export class Trace {
  constructor() {
    this.allsolid = false; // if true, plane is not valid
    this.fraction = 0; // time completed, 1.0 = didn't hit anything
    this.endpos = new THREE.Vector3(); // final position
    this.normal = new THREE.Vector3(); // surface normal at impact, transformed to world space
  }
}
