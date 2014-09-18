/*global THREE, requestAnimationFrame, createShipGeometry, createTurretGeometry*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var shipGeometry, shipMaterial, shipMesh;
  var turretGeometry, turretMesh;

  var ambient;
  var light;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 3, 16 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    shipGeometry = createShipGeometry();
    shipMaterial = new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      specular: 0xffffff
    });
    shipMesh = new THREE.Mesh( shipGeometry, shipMaterial );
    shipMesh.rotation.x = -Math.PI / 2;
    scene.add( shipMesh );

    turretGeometry = createTurretGeometry();
    turretMesh = new THREE.Mesh( turretGeometry, shipMaterial );
    turretMesh.position.z = 0.5;
    shipMesh.add( turretMesh );

    light = new THREE.PointLight( 0xffffff );
    light.position.set( 6, 6, 12 );
    scene.add( light );

    ambient = new THREE.AmbientLight( 0x333333 );
    scene.add( ambient );

    var pointLightHelper = new THREE.PointLightHelper( light, 1 );
    scene.add( pointLightHelper );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
