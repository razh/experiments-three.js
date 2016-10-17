/* eslint-env es6, jest */

'use strict';

const THREE = window.THREE = require('three');

describe( 'VertexIndices', () => {
  require('../box-indices');
  const { VertexIndices } = window;

  const box = new THREE.BoxGeometry( 1, 1, 1 );
  const getVertexAtIndex = index => box.vertices[ index ];

  it( 'matches the orientation of THREE.BoxGeometry vertices', () => {
    expect( VertexIndices.PX.map( getVertexAtIndex ).every( v => v.x > 0 ) );
    expect( VertexIndices.NX.map( getVertexAtIndex ).every( v => v.x < 0 ) );

    expect( VertexIndices.PY.map( getVertexAtIndex ).every( v => v.y > 0 ) );
    expect( VertexIndices.NY.map( getVertexAtIndex ).every( v => v.y < 0 ) );

    expect( VertexIndices.PZ.map( getVertexAtIndex ).every( v => v.z > 0 ) );
    expect( VertexIndices.NZ.map( getVertexAtIndex ).every( v => v.z < 0 ) );
  });
});
