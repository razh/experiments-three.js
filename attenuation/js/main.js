/*global THREE, requestAnimationFrame*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLDeferredRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 2 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 2, 2 ),
      new THREE.MeshPhongMaterial({
        color: '#777',
        specular: '#fff'
      })
    );

    scene.add( mesh );

    var areaLight = new THREE.AreaLight( 0xffffff );
    areaLight.position.set( 0, 0, 2 );
    areaLight.normal.subVectors( mesh.position, areaLight.position );
    scene.add( areaLight );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ();
