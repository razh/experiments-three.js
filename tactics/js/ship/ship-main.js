/*
global
THREE
createShipGeometry
createGunGeometry
createTurretGeometry
createSmokestackGeometry
createFrontDeckGeometry
*/

(function() {
  'use strict';

  const keys = [];

  let container;

  let scene, camera, controls, renderer;

  const clock = new THREE.Clock();

  let ambient;
  let light;
  const lightSpeed = 8;

  function createShipMesh() {
    const geometry = createShipGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.8,
    });

    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = -Math.PI / 2;

    const shipHeight = 3.5;

    // (x, y) coordinates.
    const turretPositions = [
      // Aft turrets.
      [ 0, 40 ],
      [ 0, 12 ],
      // Wing turrets.
      [ 7, -13 ],
      [ -7, -13 ],
      // Fore turret.
      [ 0, -40 ],
    ];

    const turretGeometry = createTurretGeometry();
    const gunGeometry = createGunGeometry();
    for ( let i = 0; i < turretPositions.length; i++ ) {
      const turretMesh = new THREE.Mesh( turretGeometry, material );
      turretMesh.castShadow = true;
      turretMesh.position.set(
        turretPositions[i][0],
        turretPositions[i][1],
        // shipHeight + turretHeight / 2.
        shipHeight + 1
      );

      const gunMesh = new THREE.Mesh( gunGeometry, material );
      gunMesh.castShadow = true;
      gunMesh.receiveShadow = true;
      gunMesh.position.y = shipHeight;
      turretMesh.add( gunMesh );

      // Aft turrets.
      if ( i > 1 ) {
        turretMesh.rotation.z = Math.PI;
      }

      mesh.add( turretMesh );
    }

    // (y, z) coordinates.
    const smokestackPositions = [
      [ 0, shipHeight ],
      [ -24, shipHeight ],
    ];

    const smokestackGeometry = createSmokestackGeometry();
    for ( let i = 0; i < smokestackPositions.length; i++ ) {
      const smokestackMesh = new THREE.Mesh( smokestackGeometry, material );
      smokestackMesh.castShadow = true;
      smokestackMesh.receiveShadow = true;
      smokestackMesh.position.y = smokestackPositions[i][0];
      smokestackMesh.position.z = smokestackPositions[i][1];
      mesh.add( smokestackMesh );
    }

    const frontDeckGeometry = createFrontDeckGeometry();
    const frontDeckMesh = new THREE.Mesh( frontDeckGeometry, material );
    frontDeckMesh.position.z = shipHeight;
    mesh.add( frontDeckMesh );

    return mesh;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 32, 160 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    scene.add( createShipMesh() );

    light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 40, 60, 160 );
    light.castShadow = true;
    light.shadow.camera.near = 40;
    light.shadow.camera.far = 1024;
    light.shadow.mapSize.set( 2048, 2048 );
    scene.add( light );

    const shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera );
    scene.add( shadowCameraHelper );

    ambient = new THREE.AmbientLight( 0x333333 );
    scene.add( ambient );

    const lightHelper = new THREE.SpotLightHelper( light, 1 );
    scene.add( lightHelper );
  }

  function animate() {
    // Update light position.
    const dt = clock.getDelta();
    // I. Forward.
    if ( keys.KeyI ) { light.position.z -= lightSpeed * dt; }
    // K. Backward.
    if ( keys.KeyK ) { light.position.z += lightSpeed * dt; }
    // J. Left.
    if ( keys.KeyJ ) { light.position.x -= lightSpeed * dt; }
    // L. Right.
    if ( keys.KeyL ) { light.position.x += lightSpeed * dt; }

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  document.addEventListener( 'keydown', event => keys[ event.code ] = true );
  document.addEventListener( 'keyup', event => keys[ event.code ] = false );
}());
