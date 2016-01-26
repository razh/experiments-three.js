/* global THREE */
/* exported Box */
var Box = (function() {
  'use strict';

  var matrix = new THREE.Matrix4();
  var vector = new THREE.Vector3();

  function Node( width, height, depth ) {
    THREE.Object3D.call( this );

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.geometry = new THREE.BoxGeometry( width, height, depth )
      .translate( 0, height / 2, 0 );
  }

  Node.prototype = Object.create( THREE.Object3D.prototype );
  Node.prototype.constructor = Node;

  Node.prototype.createGeometry = function() {
    var geometry = new THREE.Geometry().copy( this.geometry );
    var parent = this.parent;
    if ( !parent ) {
      return geometry;
    }

    parent.updateMatrixWorld();
    geometry.applyMatrix( parent.matrixWorld );
    return geometry;
  };

  Node.prototype.createBone = function( geometry ) {
    vector.set( 0, this.height, 0 );

    var parent = this.parent;
    if ( parent ) {
      vector.applyMatrix( matrix.extractRotation( parent.matrixWorld ) );
    }

    var parentIndex = parent && parent.index || 0;

    var index = geometry.bones.push({
      parent: parentIndex,
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    for ( var i = 0, il = this.geometry.vertices.length; i < il; i++ ) {
      geometry.skinIndices.push( new THREE.Vector4( parentIndex, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    }
  };

  return Node;

})();
