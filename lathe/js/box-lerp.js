/* eslint-env es6 */
/* global VertexIndices */
window.lerpBoxVertex = (function() {
  'use strict';

  return function lerp( geometryA, vertexA, geometryB, vertexB, t ) {
    const indexA = VertexIndices[ vertexA.toUpperCase() ];
    const indexB = VertexIndices[ vertexB.toUpperCase() ];

    geometryA.vertices[ indexA ].lerp( geometryB.vertices[ indexB ], t );

    return geometryA;
  };
}());
