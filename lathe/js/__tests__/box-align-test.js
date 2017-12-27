/* eslint-env jest */

'use strict';

const THREE = window.THREE = require('three');

describe( 'alignBox', () => {
  require('../box-indices');
  require('../box-align');
  require('../centroid');
  const { alignBox } = window;

  const box = () => new THREE.BoxGeometry();

  it( 'shifts the vertex or face-centroid to the origin', () => {
    // Align right face.
    let geometry = alignBox( box(), 'right' );

    geometry.computeBoundingBox();

    expect(
      geometry.boundingBox.equals(
        new THREE.Box3(
          new THREE.Vector3( -1, -0.5, -0.5 ),
          new THREE.Vector3( 0, 0.5, 0.5 )
        )
      )
    ).toBe( true );

    // Align top_left edge.
    geometry = alignBox( box(), 'top_left' );

    geometry.computeBoundingBox();

    expect(
      geometry.boundingBox.equals(
        new THREE.Box3(
          new THREE.Vector3( 0, -1, -0.5 ),
          new THREE.Vector3( 1, 0, 0.5 )
        )
      )
    ).toBe( true );
  });
});
