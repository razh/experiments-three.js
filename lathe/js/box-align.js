/* eslint-env es6 */
/* global THREE, VertexIndices */
function computeCentroid( geometry, indices, centroid ) {
  centroid = centroid || new THREE.Vector3();

  if ( Array.isArray( indices ) ) {
    centroid.set( 0, 0, 0 );

    indices.forEach( index =>
      centroid.add( geometry.vertices[ index ] )
    );

    centroid.divideScalar( indices.length );
  } else {
    centroid.copy( geometry.vertices[ indices ] );
  }

  return centroid;
}

window.alignBox = (function() {
  'use strict';

  const centroid = new THREE.Vector3();

  return function align( geometry, alignment ) {
    const indices = VertexIndices[ alignment.toUpperCase() ];
    computeCentroid( geometry, indices, centroid );
    return geometry.translate( -centroid.x, -centroid.y, -centroid.z );
  };
}());

window.relativeAlignBox = (function() {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function alignA( geometryA, alignmentA ) {
    const indicesA = VertexIndices[ alignmentA.toUpperCase() ];
    computeCentroid( geometryA, indicesA, centroidA );

    return function alignB( geometryB, alignmentB ) {
      const indicesB = VertexIndices[ alignmentB.toUpperCase() ];
      computeCentroid( geometryB, indicesB, centroidB );
      delta.subVectors( centroidB, centroidA );
      return geometryB.translate( -delta.x, -delta.y, -delta.z );
    };
  };
}());
