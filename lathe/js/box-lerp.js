/* eslint-env es6 */
/* global VertexIndices */
window.lerpBoxVertex = (function() {
  'use strict';

  return function lerpA( vertexA, t ) {
    const indexA = VertexIndices[ vertexA.toUpperCase() ];

    return function lerpB( geometryA, geometryB, vertexB ) {
      const indexB = VertexIndices[ vertexB.toUpperCase() ];
      geometryA.vertices[ indexA ].lerp( geometryB.vertices[ indexB ], t );
      return geometryA;
    };
  };
}());
