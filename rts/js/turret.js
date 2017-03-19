/* eslint-env es6 */
/* global THREE */
/* exported BallTurret */

class BallTurret extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.Geometry();

    const ballGeometry = new THREE.IcosahedronGeometry(4, 1);

    const barrelRadius = 0.5;
    const barrelHeight = 8;
    const barrelOffset = 1;

    const barrelGeometry = new THREE.CylinderGeometry(
      barrelRadius,
      barrelRadius,
      barrelHeight
    )
      .translate(0, -barrelHeight / 2, 0)
      .rotateX(-Math.PI / 2);

    const leftBarrelGeometry = barrelGeometry
      .clone()
      .translate(-barrelOffset, 0, 0);

    const rightBarrelGeometry = barrelGeometry
      .clone()
      .translate(barrelOffset, 0, 0);

    geometry.merge(ballGeometry);
    geometry.merge(leftBarrelGeometry);
    geometry.merge(rightBarrelGeometry);

    super(
      geometry,
      new THREE.MeshStandardMaterial({ shading: THREE.FlatShading })
    );
  }
}
