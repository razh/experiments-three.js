/* eslint-env es6 */
/* global VertexIndices */
window.applyBoxNoise = (function() {
  'use strict';

  return function noise( geometry, key, noise ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      indices.forEach( index => noise( geometry.vertices[ index ] ) );
    } else {
      noise( geometry.vertices[ indices ] );
    }

    return geometry;
  };
}());
