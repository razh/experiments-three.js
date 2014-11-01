/*global THREE, requestAnimationFrame, dat*/
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
    camera.position.set( 0, 0, 6 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var material = new THREE.MeshPhongMaterial({
      color: '#777',
      specular: '#fff',
    });

    var mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry( 2, 4 ),
      material
    );

    scene.add( mesh );

    var areaLight = new THREE.AreaLight( 0xffffff );
    areaLight.position.set( 0, 0, 6 );
    areaLight.normal.subVectors( mesh.position, areaLight.position );
    scene.add( areaLight );

    var gui = new dat.GUI({ width: 320 });

    gui.add( areaLight, 'width', 1, 8 );
    gui.add( areaLight, 'height', 1, 8 );
    gui.add( areaLight, 'constantAttenuation', 0, 2 );
    gui.add( areaLight, 'linearAttenuation', 0, 2 );
    gui.add( areaLight, 'quadraticAttenuation', 0, 2 );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ();
