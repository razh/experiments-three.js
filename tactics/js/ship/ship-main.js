/*global
THREE,
requestAnimationFrame,
createShipGeometry,
createGunGeometry,
createTurretGeometry,
createSmokestackGeometry,
createFrontDeckGeometry
*/
(function( window, document, undefined ) {
  'use strict';

  var keys = [];

  var container;

  var scene, camera, controls, renderer;

  var clock = new THREE.Clock();

  var shipGeometry, shipMaterial, shipMesh;
  var gunGeometry, gunMesh;
  var turretGeometry, turretMesh;

  var ambient;
  var light;
  var lightSpeed = 8;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
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

    var shipHeight = 0.35;

    // (x, y) coordinates.
    var turretPositions = [
      // Aft turrets.
      [ 0, 4 ],
      [ 0, 1.2 ],
      // Wing turrets.
      [ 0.7, -1.3 ],
      [ -0.7, -1.3 ],
      // Fore turret.
      [ 0, -4 ]
    ];

    turretGeometry = createTurretGeometry();
    gunGeometry = createGunGeometry();
    for ( var i = 0; i < turretPositions.length; i++ ) {
      turretMesh = new THREE.Mesh( turretGeometry, shipMaterial );
      turretMesh.castShadow = true;
      turretMesh.position.set(
        turretPositions[i][0],
        turretPositions[i][1],
        // shipHeight + turretHeight / 2.
        shipHeight + 0.1
      );

      gunMesh = new THREE.Mesh( gunGeometry, shipMaterial );
      gunMesh.castShadow = true;
      gunMesh.receiveShadow = true;
      gunMesh.position.y = shipHeight;
      turretMesh.add( gunMesh );

      // Aft turrets.
      if ( i > 1 ) {
        turretMesh.rotation.z = Math.PI;
      }

      shipMesh.add( turretMesh );
    }

    // (y, z) coordinates.
    var smokestackPositions = [
      [ 0, shipHeight ],
      [ -2.4, shipHeight ]
    ];

    var smokestackGeometry = createSmokestackGeometry();
    var smokestackMesh;
    for ( i = 0; i < smokestackPositions.length; i++ ) {
      smokestackMesh = new THREE.Mesh( smokestackGeometry, shipMaterial );
      smokestackMesh.castShadow = true;
      smokestackMesh.receiveShadow = true;
      smokestackMesh.position.y = smokestackPositions[i][0];
      smokestackMesh.position.z = smokestackPositions[i][1];
      shipMesh.add( smokestackMesh );
    }

    var frontDeckGeometry = createFrontDeckGeometry();
    var frontDeckMesh = new THREE.Mesh( frontDeckGeometry, shipMaterial );
    frontDeckMesh.position.z = shipHeight;
    shipMesh.add( frontDeckMesh );

    light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 4, 6, 16 );
    light.castShadow = true;
    light.shadowCameraNear = 6;
    light.shadowCameraFar = 128;
    light.shadowCameraVisible = true;
    scene.add( light );

    ambient = new THREE.AmbientLight( 0x333333 );
    scene.add( ambient );

    var lightHelper = new THREE.SpotLightHelper( light, 1 );
    scene.add( lightHelper );
  }

  function animate() {
    // Update light position.
    var dt = clock.getDelta();
    // I. Forward.
    if ( keys[ 73 ] ) { light.position.z -= lightSpeed * dt; }
    // K. Backward.
    if ( keys[ 75 ] ) { light.position.z += lightSpeed * dt; }
    // J. Left.
    if ( keys[ 74 ] ) { light.position.x -= lightSpeed * dt; }
    // L. Right.
    if ( keys[ 76 ] ) { light.position.x += lightSpeed * dt; }

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  document.addEventListener( 'keydown', function( event ) {
    keys[ event.which ] = true;
  });

  document.addEventListener( 'keyup', function( event ) {
    keys[ event.which ] = false;
  });

}) ( window, document );
