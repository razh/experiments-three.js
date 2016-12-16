/* eslint-env es6 */
/* global THREE, VertexIndices, computeCentroid */
window.relativeLerpBoxVertices = (function() {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function relativeLerp( geometryA, lerpA, geometryB, lerpB, t ) {
    const indicesA = VertexIndices[ lerpA.toUpperCase() ];
    const indicesB = VertexIndices[ lerpB.toUpperCase() ];

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
