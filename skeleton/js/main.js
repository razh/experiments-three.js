/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;
  var geometry, material, mesh;

  var skeletonHelper;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01 );
    camera.position.set( 0, 0, 2 );
    scene.add( camera );

    new THREE.OrbitControls( camera, renderer.domElement );

    var matrix = new THREE.Matrix4();
    var vector = new THREE.Vector3();

    var boxGeometry = new THREE.Geometry().copy( new THREE.BoxGeometry( 0.25, 1, 0.25 ) );
    boxGeometry.translate( 0, 0.5, 0 );

    var angle = Math.PI / 6;

    class Box extends THREE.Object3D {
      constructor() {
        super();

        this.position.set( 0, 1, 0 );

        this.index = 0;
        this.left = undefined;
        this.right = undefined;
      }

      add( object, direction ) {
        super.add( object );

        if ( direction === 'left' ) { this.left = object; }
        if ( direction === 'right' ) { this.right = object; }
      }

      createGeometry() {
        var geometry = boxGeometry.clone();
        var parent = this.parent;
        if ( !parent ) {
          return geometry;
        }

        if ( this === parent.left ) { parent.transformLeft(); }
        if ( this === parent.right ) { parent.transformRight(); }

        geometry.applyMatrix( parent.matrixWorld );
        return geometry;
      }

      createBone( geometry ) {
        vector.set( 0, 1, 0 );

        var parent = this.parent;
        if ( parent ) {
          if ( this === parent.left ) { parent.transformLeft(); }
          if ( this === parent.right ) { parent.transformRight(); }

          vector.applyMatrix4( matrix.extractRotation( parent.matrixWorld ) );
        }

        var parentIndex = parent && parent.index || 0;

        var index = geometry.bones.push({
          parent: parentIndex,
          pos: vector.toArray(),
          rotq: [ 0, 0, 0, 1 ]
        }) - 1;

        this.index = index;

        for ( var i = 0, il = boxGeometry.vertices.length; i < il; i++ ) {
          geometry.skinIndices.push( new THREE.Vector4( parentIndex, 0, 0, 0 ) );
          geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
        }
      }

      transformLeft() {
        this.rotation.z = angle;
        this.updateMatrixWorld();
      }

      transformRight() {
        this.rotation.z = -angle;
        this.updateMatrixWorld();
      }
    }

    var tree = new Box();
    tree.add( new Box(), 'left' );
    tree.add( new Box(), 'right' );
    tree.left.add( new Box(), 'left' );
    tree.left.add( new Box(), 'right' );
    tree.left.left.add( new Box(), 'right' );

    geometry = new THREE.Geometry();
    geometry.bones = [
      {
        parent: -1,
        name: 'root',
        pos: [ 0, 0, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      }
    ];

    tree.traverse(function( object ) {
      var tempGeometry = object.createGeometry();
      object.createBone( geometry );
      geometry.merge( tempGeometry );
    });

    material = new THREE.MeshBasicMaterial({
      skinning: true,
      wireframe: true
    });

    mesh = new THREE.SkinnedMesh( geometry, material );
    scene.add( mesh );

    skeletonHelper = new THREE.SkeletonHelper( mesh );
    skeletonHelper.material.linewidth = 4;
    mesh.add( skeletonHelper );
  }

  var scale = new THREE.Vector3();

  function animate() {
    var time = Date.now() * 1e-3;
    var cos = Math.cos( time );
    var angle = cos;
    var length = 0.5 * ( cos + 1 );

    mesh.skeleton.bones.forEach(function( bone, index ) {
      scale.setFromMatrixScale( bone.parent.matrixWorld );
      bone.scale.setLength( ( length + 0.25 ) / scale.length() );

      // Set angle if not root.
      if ( index > 1 ) {
        bone.rotation.z = angle;
      }

      bone.updateMatrixWorld();
    });

    skeletonHelper.update();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });
}());
