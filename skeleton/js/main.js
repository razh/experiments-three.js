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

    var tempGeometry = boxGeometry.clone();
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    tempGeometry.applyMatrix( matrix.makeRotationZ( -angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    tempGeometry.applyMatrix( matrix.makeRotationZ( -angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    geometry.merge( tempGeometry );

    tempGeometry = boxGeometry.clone();
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
    tempGeometry.applyMatrix( matrix.makeRotationZ( angle ) );
    tempGeometry.applyMatrix( matrix.makeTranslation( 0, 1, 0 ) );
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
          geometry[ key ].push( new THREE.Vector4( x, y, z, w ) );
        };
      };
    }

    var skinIndices = mapVertices( 'skinIndices' );
    var skinWeights = mapVertices( 'skinWeights' );

    // Skin indices.
    boxGeometry.vertices.forEach( skinIndices( 0, 1, 0, 0 ) );
    boxGeometry.vertices.forEach( skinIndices( 1, 2, 0, 0 ) );
    boxGeometry.vertices.forEach( skinIndices( 1, 3, 0, 0 ) );
    boxGeometry.vertices.forEach( skinIndices( 2, 4, 0, 0 ) );
    boxGeometry.vertices.forEach( skinIndices( 2, 5, 0, 0 ) );
    boxGeometry.vertices.forEach( skinIndices( 4, 6, 0, 0 ) );

    // Skin weights.
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );
    boxGeometry.vertices.forEach( skinWeights( 1, 0, 0, 0 ) );

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
