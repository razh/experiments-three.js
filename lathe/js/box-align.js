/* global THREE, VertexIndices, computeCentroid */

const alignBox = (() => {
  'use strict';

  const centroid = new THREE.Vector3();

  return function align( geometry, key ) {
    const indices = VertexIndices[ key.toUpperCase() ];
    computeCentroid( geometry, indices, centroid );
    return geometry.translate( -centroid.x, -centroid.y, -centroid.z );
  };
})();

const relativeAlignBox = (() => {
  'use strict';

  const centroidA = new THREE.Vector3();
  const centroidB = new THREE.Vector3();
  const delta = new THREE.Vector3();

  return function relativeAlign( geometryA, keyA, geometryB, keyB ) {
    const indicesA = VertexIndices[ keyA.toUpperCase() ];
    const indicesB = VertexIndices[ keyB.toUpperCase() ];

    computeCentroid( geometryA, indicesA, centroidA );
    computeCentroid( geometryB, indicesB, centroidB );

    delta.subVectors( centroidB, centroidA );
    return geometryA.translate( delta.x, delta.y, delta.z );
  };
})();

window.alignBox = alignBox;
window.relativeAlignBox = relativeAlignBox;
