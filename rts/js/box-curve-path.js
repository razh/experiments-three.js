/* global THREE */
/* exported createBoxCurvePath */

function createBoxCurvePath(...args) {
  const curvePath = new THREE.CurvePath();

  const { vertices } = new THREE.BoxGeometry(...args);
  for (let i = 0; i < vertices.length; i++) {
    const v0 = vertices[i];
    const v1 = vertices[(i + 1) % vertices.length];
    curvePath.add(new THREE.LineCurve3(v0.clone(), v1.clone()));
  }

  return curvePath;
}
