/* eslint-env es6, jest */

'use strict';

jest
  .unmock( 'three' )
  .unmock( '../box-indices.js' )
  .unmock( '../box-align.js' );

const THREE = window.THREE = require('three');

describe( 'alignBox', () => {
  require('../box-indices');
  require('../box-align');
  const { alignBox } = window;

  const base = new THREE.BoxGeometry( 1, 1, 1 )

  it( 'should shift the vertex or face-centroid to the origin', () => {
    // Align right face.
    let geometry = alignBox( base.clone(), 'right' );

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
    geometry = alignBox( base.clone(), 'top_left');

    geometry.computeBoundingBox();

    expect(
      geometry.boundingBox.equals(
        new THREE.Box3(
          new THREE.Vector3( 0, 0, -0.5 ),
          new THREE.Vector3( 1, -1, 0.5 )
        )
      )
    ).toBe( true );
  });
});