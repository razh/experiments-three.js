/* eslint-env es6 */
/* global THREE */
window.computeCentroid = (function() {
  'use strict';

  return function centroid( geometry, indices, vector = new THREE.Vector3() ) {
    vector.set( 0, 0, 0 );

    if ( Array.isArray( indices ) ) {
      indices.forEach( index =>
        vector.add( geometry.vertices[ index ] )
      );

      vector.divideScalar( indices.length );
    }

    return vector;
  };
}());
