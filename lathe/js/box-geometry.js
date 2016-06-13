/* eslint-env es6 */
/* global THREE, Indices */
window.translateBoxVertices = (function() {
  'use strict';

  const vector = new THREE.Vector3();
  const zero = new THREE.Vector3();

  return function translate( geometry, vectors ) {
    Object.keys( vectors ).forEach( key => {
      const delta = vectors[ key ];
      const indices = Indices[ key.toUpperCase() ];

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
          geometry.vertices[ index ].add( vector )
        );
      } else {
        geometry.vertices[ indices ].add( vector );
      }
    });

    return geometry;
  };
}());
