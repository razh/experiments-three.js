/*global THREE, requestAnimationFrame*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var mesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry( 1, 3 ),
      new THREE.MeshBasicMaterial({ color: '#fff' })
    );

    scene.add( mesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ();
