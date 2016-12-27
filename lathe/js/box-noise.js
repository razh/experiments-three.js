/* eslint-env es6 */
/* global VertexIndices */

const applyBoxNoise = (function() {
  'use strict';

  return function applyNoise( geometry, key, noise ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      indices.forEach( index => noise( geometry.vertices[ index ] ) );
    }

    return geometry;
  };
}());

window.applyBoxNoise = applyBoxNoise;
