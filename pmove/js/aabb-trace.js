const { THREE } = window;

export function pm_trace(trace, start, end, boxA, boxB) {

}

export class Trace {
  constructor() {
    this.allsolid = false; // if true, plane is not valid
    this.fraction = 0; // time completed, 1.0 = didn't hit anything
    this.endpos = new THREE.Vector3(); // final position
    this.normal = new THREE.Vector3(); // surface normal at impact, transformed to world space
  }
}
