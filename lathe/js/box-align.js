/* eslint-env es6 */
/* global THREE, Indices */
window.alignBox = (function() {
  'use strict';

  const centroid = new THREE.Vector3();

  return function align( geometry, alignment ) {
    const indices = Indices[ alignment.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      centroid.set( 0, 0, 0 );

      indices.forEach( index =>
        centroid.add( geometry.vertices[ index ] )
      );

      centroid.divideScalar( indices.length );
    } else {
      centroid.copy( geometry.vertices[ indices ] );
    }

    return geometry.translate( -centroid.x, -centroid.y, -centroid.z );
  };
}());
