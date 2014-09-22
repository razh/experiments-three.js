/*global THREE, requestAnimationFrame, createShipGeometry, createGunGeometry, createTurretGeometry*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var shipGeometry, shipMaterial, shipMesh;
  var gunGeometry, gunMesh;
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

    // (x, y) coordinates.
    var turretPositions = [
      // Aft turrets.
      [ 0, 4 ],
      [ 0, 1 ],
      // Wing turrets.
      [ 0.5, -1.5 ],
      [ -0.5, -1.5 ],
      // Fore turret.
      [ 0, -4 ]
    ];

    turretGeometry = createTurretGeometry();
    gunGeometry = createGunGeometry();
    for ( var i = 0; i < 5; i++ ) {
      turretMesh = new THREE.Mesh( turretGeometry, shipMaterial );
      turretMesh.position.set(
        turretPositions[i][0],
        turretPositions[i][1],
        0.5
      );

      gunMesh = new THREE.Mesh( gunGeometry, shipMaterial );
      gunMesh.position.y = 0.4;
      turretMesh.add( gunMesh );

      // Aft turrets.
      if ( i > 1 ) {
        turretMesh.rotation.x = Math.PI;
      }

      shipMesh.add( turretMesh );
    }

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
