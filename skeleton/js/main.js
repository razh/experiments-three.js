/*global THREE*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;
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

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var matrix = new THREE.Matrix4();
    var vector = new THREE.Vector3();

    geometry = new THREE.Geometry();

    var boxGeometry = new THREE.BoxGeometry( 0.25, 1, 0.25 );
    boxGeometry.applyMatrix( matrix.makeTranslation( 0, 0.5, 0 ) );
    geometry.merge( boxGeometry );

    var angle = Math.PI / 6;

    function rotateZ( geometry, angle ) {
      geometry.applyMatrix( matrix.makeRotationZ( angle ) );
    }

    function translate( geometry, x, y, z ) {
      geometry.applyMatrix( matrix.makeTranslation( x, y, z ) );
    }

    function Box() {
      THREE.Object3D.call( this );

      this.left  = undefined;
      this.right = undefined;
    }

    Box.prototype = Object.create( THREE.Object3D );
    Box.prototype.constructor = Box;

    Box.prototype.add = function( object, direction ) {
      THREE.Object3D.prototype.add.call( this, object );

      if ( direction === 'left'  ) { this.left = object;  }
      if ( direction === 'right' ) { this.right = object; }
    };

    Box.prototype.createGeometry = function() {
      var geometry = boxGeometry.clone();
      var parent = this.parent;
      if ( !parent ) {
        return geometry;
      }

      if ( this === parent.left  ) { parent.transformLeft();  }
      if ( this === parent.right ) { parent.transformRight(); }

      geometry.applyMatrix( this.matrixWorld );
      return geometry;
    };

    Box.prototype.createBone = function( vector ) {
      var parent = this.parent;
      if ( !parent ) {
        return vector;
      }

      if ( this === parent.left  ) { parent.transformLeft();  }
      if ( this === parent.right ) { parent.transformRight(); }

      return vector.applyMatrix4( matrix.extractRotation( parent.matrixWorld ) );
    };

    Box.prototype.transformLeft = function() {
      this.rotation.z = angle;
      this.updateMatrixWorld();
    };

    Box.prototype.transformRight = function() {
      this.rotation.z = -angle;
      this.updateMatrixWorld();
    };

    var tempGeometry = boxGeometry.clone();
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    rotateZ( tempGeometry, -angle );
    translate( tempGeometry, 0, 1, 0 );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    rotateZ( tempGeometry, -angle );
    translate( tempGeometry, 0, 1, 0 );
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    rotateZ( tempGeometry, angle );
    translate( tempGeometry, 0, 1, 0 );
    geometry.merge( tempGeometry );

    geometry.bones = [
      {
        parent: -1,
        name: 'root',
        pos: [ 0, 0, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 0,
        name: 'bone.0',
        pos: [ 0, 1, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 1,
        name: 'bone.0.0',
        pos: vector.set( 0, 1, 0 )
          .applyMatrix4( matrix.makeRotationZ( angle ) )
          .toArray(),
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 1,
        name: 'bone.0.1',
        pos: vector.set( 0, 1, 0 )
          .applyMatrix4( matrix.makeRotationZ( -angle ) )
          .toArray(),
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 2,
        name: 'bone.0.0.0',
        pos: vector.set( 0, 1, 0 )
          .applyMatrix4( matrix.makeRotationZ( 2 * angle ) )
          .toArray(),
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 2,
        name: 'bone.0.0.1',
        pos: [ 0, 1, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      },
      {
        parent: 4,
        name: 'bone.0.0.0.0',
        pos: vector.set( 0, 1, 0 )
          .applyMatrix4( matrix.makeRotationZ( 3 * angle ) )
          .toArray(),
        rotq: [ 0, 0, 0, 1 ]
      }
    ];

    function mapVertices( key ) {
      return function( x, y, z, w ) {
        return function() {
          geometry[ key ].push( new THREE.Vector4( x, y, z, w || 0 ) );
        };
      };
    }

    var skinIndices = mapVertices( 'skinIndices' );
    var skinWeights = mapVertices( 'skinWeights' );

    // Skin indices.
    boxGeometry.vertices.forEach( skinIndices( 0, 1 ) );
    boxGeometry.vertices.forEach( skinIndices( 1, 2 ) );
    boxGeometry.vertices.forEach( skinIndices( 1, 3 ) );
    boxGeometry.vertices.forEach( skinIndices( 2, 4 ) );
    boxGeometry.vertices.forEach( skinIndices( 2, 5 ) );
    boxGeometry.vertices.forEach( skinIndices( 4, 6 ) );

    // Skin weights.
    boxGeometry.vertices.forEach( skinWeights( 1 ) );
    boxGeometry.vertices.forEach( skinWeights( 1 ) );
    boxGeometry.vertices.forEach( skinWeights( 1 ) );
    boxGeometry.vertices.forEach( skinWeights( 1 ) );
    boxGeometry.vertices.forEach( skinWeights( 1 ) );
    boxGeometry.vertices.forEach( skinWeights( 1 ) );

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
    var angle = Math.cos( time );
    var length = 0.5 * ( Math.cos( time ) + 1 );

    mesh.skeleton.bones.forEach(function( bone, index ) {
      scale.setFromMatrixScale( bone.parent.matrixWorld );
      bone.scale.setLength( ( length + 0.25 ) / scale.length() );
      bone.updateMatrixWorld();

      // Set angle if not root.
      if ( index ) {
        bone.rotation.z = angle;
      }
    });

    skeletonHelper.update();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

})();
