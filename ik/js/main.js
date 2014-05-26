/*globals THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, renderer;
  var geometry, material, plane;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    scene.add( camera );

    geometry = new THREE.PlaneGeometry( 1000, 1000, 20, 20 );
    material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
