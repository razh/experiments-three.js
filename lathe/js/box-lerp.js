/* eslint-env es6 */
/* global VertexIndices */
window.lerpBoxVertex = (function() {
  'use strict';

  return function lerpA( geometryA, vertexA ) {
    const indexA = VertexIndices[ vertexA.toUpperCase() ];

    return function lerpB( geometryB, vertexB ) {
      const indexB = VertexIndices[ vertexB.toUpperCase() ];

      return function lerp( t ) {
        geometryA.vertices[ indexA ].lerp( geometryB.vertices[ indexB ], t );
        return geometryA;
      };
    };
  };
}());
