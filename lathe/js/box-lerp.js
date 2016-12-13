/* eslint-env es6 */
/* global THREE, VertexIndices, computeCentroid */
window.lerpBoxVertices = (function() {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function lerp( geometryA, verticesA, geometryB, verticesB, t ) {
    const indicesA = VertexIndices[ verticesA.toUpperCase() ];
    const indicesB = VertexIndices[ verticesB.toUpperCase() ];

    computeCentroid( geometryA, indicesA, centroidA );
    computeCentroid( geometryB, indicesB, centroidB );

    delta.subVectors( centroidB, centroidA ).multiplyScalar( t );

    if ( Array.isArray( indicesA ) ) {
      indicesA.forEach( index =>
        geometryA.vertices[ index ].add( delta )
      );
    } else {
      geometryA.vertices[ indicesA ].add( delta );
    }

    return geometryA;
  };
}());
