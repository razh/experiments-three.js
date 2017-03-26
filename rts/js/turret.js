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

    this.offset = new THREE.Vector3();
    this.spherical = new THREE.Spherical();

    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI / 2;
  }

  lookAt(vector) {
    const { offset, spherical } = this;

    // Convert to local position.
    offset.subVectors(vector, this.position);

    // Convert to spherical coordinates.
    spherical.setFromVector3(offset);

    // Limit phi.
    spherical.phi = THREE.Math.clamp(
      spherical.phi,
      (Math.PI / 2) - this.maxPolarAngle,
      (Math.PI / 2) - this.minPolarAngle
    );

    spherical.makeSafe();

    // Convert to world position.
    offset
      .setFromSpherical(spherical)
      .add(this.position);

    super.lookAt(offset);
  }
}
