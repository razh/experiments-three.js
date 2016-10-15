/* eslint-env es6 */
/* global THREE */
function computeCentroid( geometry, indices, centroid ) {
  'use strict';

  centroid = centroid || new THREE.Vector3();

  if ( Array.isArray( indices ) ) {
    centroid.set( 0, 0, 0 );

    indices.forEach( index =>
      centroid.add( geometry.vertices[ index ] )
    );

    centroid.divideScalar( indices.length );
  } else {
    centroid.copy( geometry.vertices[ indices ] );
  }

  return centroid;
}

window.computeCentroid = computeCentroid;