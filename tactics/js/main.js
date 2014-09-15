/*global THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var ambientLight;
  var spotLight;

  var planeGeometry, planeMaterial, planeMesh;
  var geometry, material, mesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 6, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI / 2;

    ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );

    spotLight = new THREE.SpotLight( 0xffffff, 1, 0 );
    spotLight.castShadow = true;
    spotLight.position.set( 0, 32, 0 );
    spotLight.shadowCameraNear = 24;
    scene.add( spotLight );

    planeGeometry = new THREE.PlaneGeometry( 16, 16 );
    planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.receiveShadow = true;
    scene.add( planeMesh );

    geometry = new THREE.BoxGeometry( 8, 0.2, 8 );
    material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = 1;
    mesh.castShadow = true;
    scene.add( mesh );

    camera.lookAt( mesh.position );
    controls.target.copy( mesh.position );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
