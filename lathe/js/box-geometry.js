/* eslint-env es6 */
/* global THREE, VertexIndices */
function transformBoxVertices( method ) {
  'use strict';

  const vector = new THREE.Vector3();
  const zero = new THREE.Vector3();

  return function transform( geometry, vectors ) {
    Object.keys( vectors ).forEach( key => {
      const delta = vectors[ key ];
      const indices = VertexIndices[ key.toUpperCase() ];

      if ( Array.isArray( delta ) ) {
        vector.fromArray( delta );
      } else if ( typeof delta === 'object' ) {
        Object.assign( vector, zero, delta );
      } else if ( typeof delta === 'number' ) {
        vector.setScalar( delta );
      } else {
        return;
      }

      if ( Array.isArray( indices ) ) {
        indices.forEach( index =>
          geometry.vertices[ index ][ method ]( vector )
        );
      } else {
        geometry.vertices[ indices ][ method ]( vector );
      }
    });

    return geometry;
  };
}

window.translateBoxVertices = transformBoxVertices( 'add' );
window.scaleBoxVertices = transformBoxVertices( 'multiply' );
