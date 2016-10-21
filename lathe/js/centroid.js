/* eslint-env es6 */
/* global THREE */
window.computeCentroid = (function() {
  'use strict';

  return function centroid( geometry, indices, vector = new THREE.Vector3() ) {
    if ( Array.isArray( indices ) ) {
      vector.set( 0, 0, 0 );

      indices.forEach( index =>
        vector.add( geometry.vertices[ index ] )
      );

      vector.divideScalar( indices.length );
    } else {
      vector.copy( geometry.vertices[ indices ] );
    }

    return vector;
  };
}());
