/* eslint-env es6, jest */

'use strict';

const THREE = window.THREE = require('three');

describe( 'VertexIndices', () => {
  require('../box-indices');
  const { VertexIndices } = window;

  const box = new THREE.BoxGeometry( 1, 1, 1 );
  const getVertexAtIndex = index => box.vertices[ index ];

  it( 'matches the orientation of THREE.BoxGeometry vertices', () => {
    expect( VertexIndices.PX.map( getVertexAtIndex ).every( v => v.x > 0 ) ).toBe( true );
    expect( VertexIndices.NX.map( getVertexAtIndex ).every( v => v.x < 0 ) ).toBe( true );

    expect( VertexIndices.PY.map( getVertexAtIndex ).every( v => v.y > 0 ) ).toBe( true );
    expect( VertexIndices.NY.map( getVertexAtIndex ).every( v => v.y < 0 ) ).toBe( true );

    expect( VertexIndices.PZ.map( getVertexAtIndex ).every( v => v.z > 0 ) ).toBe( true );
    expect( VertexIndices.NZ.map( getVertexAtIndex ).every( v => v.z < 0 ) ).toBe( true );
  });
});

describe( 'FaceIndices', () => {
  require('../box-indices');
  const { FaceIndices } = window;

  const box = new THREE.BoxGeometry( 1, 1, 1 );

  function getVerticesForFaceIndices( faceIndices ) {
    return faceIndices
      .map( faceIndex => box.faces[ faceIndex ] )
      .map( face => [ face.a, face.b, face.c ] )
      .reduce( ( a, b ) => a.concat( b ) )
      .map( vertexindex => box.vertices[ vertexindex ] );
  }

  it( 'matches the orientation of THREE.BoxGeometry faces', () => {
    expect( getVerticesForFaceIndices( FaceIndices.PX ).every( v => v.x > 0 ) ).toBe( true );
    expect( getVerticesForFaceIndices( FaceIndices.NX ).every( v => v.x < 0 ) ).toBe( true );

    expect( getVerticesForFaceIndices( FaceIndices.PY ).every( v => v.y > 0 ) ).toBe( true );
    expect( getVerticesForFaceIndices( FaceIndices.NY ).every( v => v.y < 0 ) ).toBe( true );

    expect( getVerticesForFaceIndices( FaceIndices.PZ ).every( v => v.z > 0 ) ).toBe( true );
    expect( getVerticesForFaceIndices( FaceIndices.NZ ).every( v => v.z < 0 ) ).toBe( true );
  });
});
