/* eslint-env es6 */
/* global THREE, VertexIndices, computeCentroid */
window.lerpBoxVertices = (function() {
  'use strict';

  return function lerp( geometry, vertices, vector, t ) {
    const indices = VertexIndices[ vertices.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      indices.forEach( index =>
        geometry.vertices[ index ].lerp( vector, t )
      );
    } else {
      geometry.vertices[ indices ].lerp( vector, t );
    }

    return geometry;
  };
}());

window.relativeLerpBoxVertices = (function() {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function relativeLerp( geometryA, verticesA, geometryB, verticesB, t ) {
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
