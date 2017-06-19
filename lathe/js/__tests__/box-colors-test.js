/* eslint-env jest */

'use strict';

const THREE = window.THREE = require('three');

describe( 'defaultVertexColors', () => {
  require('../box-indices');
  require('../box-colors');
  const { defaultVertexColors } = window;

  it( 'sets all vertex colors', () => {
    const box = new THREE.BoxGeometry( 1, 1, 1 );
    defaultVertexColors( box, 'red' );

    expect(
      box.faces.every(
        face => face.vertexColors.every(
          color => ( color.r === 1 && color.g === 0 && color.b === 0 )
        )
      )
    ).toBe( true );
  });
});

describe( 'applyBoxVertexColors', () => {
  require('../box-indices');
  require('../box-colors');
  const { applyBoxVertexColors } = window;

  it( 'sets some vertex colors', () => {
    const box = new THREE.BoxGeometry( 1, 1, 1 );
    const getVertexAtIndex = index => box.vertices[ index ];

    applyBoxVertexColors( box, 'px', 'red' );

    expect(
      box.faces.every(
        face => [ face.a, face.b, face.c ]
          .map( getVertexAtIndex )
          .map( ( vertex, index ) => {
            const color = face.vertexColors[ index ];
            return vertex.x > 0
              ? ( color.r === 1 && color.g === 0 && color.b === 0 )
              : color === undefined;
          })
      )
    ).toBe( true );
  });
});
