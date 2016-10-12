/* eslint-env es6 */
/* global THREE, VertexIndices, computeCentroid */
window.createBoxBones = function() {
  'use strict';

  const bones = [];
  const byId = {};

  function createBone( geometry, parent, key ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    const bone = new THREE.Bone();
    computeCentroid( geometry, indices, bone.position );

    bones.push( bone );
    byId[ geometry.id ] = bone;

    geometry.skinIndices.push(
      new THREE.Vector4(
        bones.indexOf( byId[ parent.id ] ),
        bones.length - 1,
        0,
        0
      )
    );

    geometry.skinWeights.push( new THREE.Vector4( 0.5, 0.5, 0, 0 ) );

    return geometry;
  }

  createBone.bones = bones;

  return createBone;
};
