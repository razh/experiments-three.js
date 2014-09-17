/*global THREE, requestAnimationFrame, createShipGeometry*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var shipGeometry, shipMaterial, shipMesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 12 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    shipGeometry = createShipGeometry();
    shipMaterial = new THREE.LineBasicMaterial({
      side: THREE.DoubleSide
    });
    shipMesh = new THREE.Mesh( shipGeometry, shipMaterial );
    scene.add( shipMesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
