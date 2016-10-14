/* eslint-env es6, jest */

'use strict';

const THREE = window.THREE = require('three');

describe( 'translateBoxVertices', () => {
  require('../box-indices');
  require('../box-geometry');
  const { translateBoxVertices } = window;

  const base = new THREE.BoxGeometry( 1, 1, 1 );

  it( 'should change the geometry bounding box', () => {
    // Moving the entire right side.
    const geometry = translateBoxVertices( base.clone(), {
      right: { x: 1 }
    });

    geometry.computeBoundingBox();

    expect(
      geometry.boundingBox.equals(
        new THREE.Box3(
          new THREE.Vector3( -0.5, -0.5, -0.5 ),
          new THREE.Vector3( 1.5, 0.5, 0.5 )
        )
      )
    ).toBe( true );
  });

  it( 'should not change the bounding box if translated vertices are in original bounds', () => {
    // Move the top-left right.
    const geometry = translateBoxVertices( base.clone(), {
      top_left: { x: 0.5 }
    });

    geometry.computeBoundingBox();

    expect(
      geometry.boundingBox.equals(
        new THREE.Box3(
          new THREE.Vector3( -0.5, -0.5, -0.5 ),
          new THREE.Vector3( 0.5, 0.5, 0.5 )
        )
      )
    ).toBe( true );
  });
});
