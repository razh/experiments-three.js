/*globals THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, renderer;
  var projector;

  var geometry, material, plane;
  var sphereGeometry, sphereMaterial, sphere;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.set( 0, -400, 200 );
    camera.rotation.x = THREE.Math.degToRad( 60 );

    scene.add( camera );

    // Projector.
    projector = new THREE.Projector();

    // Plane.
    geometry = new THREE.PlaneGeometry( 500, 500, 20, 20 );
    material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    // Sphere.
    sphereGeometry = new THREE.SphereGeometry( 10 );
    sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    });
    sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    scene.add( sphere );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'mousemove', function( event ) {
    // Calculate intersection.
    var vector = new THREE.Vector3(
      ( event.pageX / window.innerWidth ) * 2 - 1,
      -( event.pageY / window.innerHeight ) * 2 + 1,
      0
    );

    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub( camera.position ).normalize()
    );

    var intersections = raycaster.intersectObject( plane );
    if ( intersections[0] ) {
      sphere.position.copy( intersections[0].point );
    }
  });

  window.addEventListener( 'wheel', function( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    plane.position.z += event.deltaY;
    sphere.position.z = plane.position.z;
  });

}) ( window, document );
