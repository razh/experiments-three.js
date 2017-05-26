/* global THREE, createSkeletonGeometry */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;
  var geometry, material, mesh;

  var skeletonHelper;

  var clock = new THREE.Clock();

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

    material = new THREE.MeshBasicMaterial({
      skinning: true,
      wireframe: true,
    });

    geometry = createSkeletonGeometry([
      1.5, 4, 1.5,
      [
        [
          1, 3, 1, { pos: [ 0, 5, 0 ] },
          [
            [ 0.5, 0.5, 0.5 ],
          ],
        ],
        [ 1, 2, 1 ],
      ],
    ]);

    mesh = new THREE.SkinnedMesh( geometry, material );
    scene.add( mesh );

    skeletonHelper = new THREE.SkeletonHelper( mesh );
    skeletonHelper.material.linewidth = 4;
    mesh.add( skeletonHelper );
  }

  function animate() {
    var time = clock.getElapsedTime();
    var angle = Math.cos( time );

    mesh.skeleton.bones.forEach(function( bone, index ) {
      // Set angle if not root.
      if ( index > 0 ) {
        bone.rotation.z = angle;
      }
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

})();
