/* eslint-env es6 */
/* global THREE, VertexIndices, computeCentroid */
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

  return function relativeAlign( geometryA, alignmentA, geometryB, alignmentB ) {
    const indicesA = VertexIndices[ alignmentA.toUpperCase() ];
    const indicesB = VertexIndices[ alignmentB.toUpperCase() ];

    computeCentroid( geometryA, indicesA, centroidA );
    computeCentroid( geometryB, indicesB, centroidB );

    delta.subVectors( centroidB, centroidA );
    return geometryA.translate( delta.x, delta.y, delta.z );
  };
}());
