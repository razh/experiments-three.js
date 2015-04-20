/*global THREE*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var planeGeometry, planeMaterial, planeMesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 16, 32 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    planeGeometry = new THREE.PlaneBufferGeometry( 64, 64, 16, 16 );
    planeGeometry.applyMatrix(
      new THREE.Matrix4().makeRotationX( -Math.PI / 2 )
    );

    planeMaterial = new THREE.MeshBasicMaterial({ color: '#333' });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    scene.add( planeMesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

})();
