/*global THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var planeGeometry, planeMaterial, planeMesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 8, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI / 2 - Math.PI / 16;

    planeGeometry = new THREE.PlaneGeometry( 32, 32 );
    planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    controls.target.copy( planeMesh.position );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
