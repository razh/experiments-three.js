/* global THREE */
/* exported Box */

const Box = (() => {
  'use strict';

  const matrix = new THREE.Matrix4();
  const vector = new THREE.Vector3();

  class Node extends THREE.Object3D {
    constructor( width, height, depth ) {
      super();

      this.width = width;
      this.height = height;
      this.depth = depth;

      this.geometry = new THREE.BoxGeometry( width, height, depth )
        .translate( 0, height / 2, 0 );

      this.index = 0;
    }

    createGeometry() {
      const geometry = new THREE.Geometry().copy( this.geometry );
      const parent = this.parent;
      if ( !parent ) {
        return geometry;
      }

      parent.updateMatrixWorld();
      geometry.applyMatrix( parent.matrixWorld );
      return geometry;
    }

    createBone( geometry ) {
      vector.set( 0, this.height, 0 );

      const parent = this.parent;
      if ( parent ) {
        vector.applyMatrix4( matrix.extractRotation( parent.matrixWorld ) );
      }

      const parentIndex = parent && parent.index || 0;

      const index = geometry.bones.push({
        parent: parentIndex,
        pos: vector.toArray(),
        rotq: [ 0, 0, 0, 1 ],
      }) - 1;

      this.index = index;

      for ( let i = 0, il = this.geometry.vertices.length; i < il; i++ ) {
        geometry.skinIndices.push( new THREE.Vector4( parentIndex, 0, 0, 0 ) );
        geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
      }
    }
  }

  return Node;
})();
