/* global THREE, VertexIndices, computeCentroid */

const relativeLerpBoxVertices = (function() {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function relativeLerp( geometryA, keyA, geometryB, keyB, t ) {
    const indicesA = VertexIndices[ keyA.toUpperCase() ];
    const indicesB = VertexIndices[ keyB.toUpperCase() ];

    computeCentroid( geometryA, indicesA, centroidA );
    computeCentroid( geometryB, indicesB, centroidB );

    delta.subVectors( centroidB, centroidA ).multiplyScalar( t );

    if ( Array.isArray( indicesA ) ) {
      indicesA.forEach( index =>
        geometryA.vertices[ index ].add( delta )
      );
    }

    return geometryA;
  };
}());

window.relativeLerpBoxVertices = relativeLerpBoxVertices;
