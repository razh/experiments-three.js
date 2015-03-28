/*global THREE*/
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;
  var raycaster;
  var mouse;

  var geometry, material, mesh;
  var intersectionMesh;

  var mouseDown = false;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 1 );
    scene.add( camera );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    geometry = new THREE.PlaneGeometry( 1, 1 );
    material = new THREE.MeshPhongMaterial();

    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = -Math.PI / 4;
    scene.add( mesh );

    intersectionMesh = new THREE.Mesh(
      new THREE.SphereGeometry( 0.05 ),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    intersectionMesh.visible = false;
    scene.add( intersectionMesh );

    var light = new THREE.PointLight( '#fff', 0.25 );
    light.position.set( 1, 4, 0 );
    scene.add( light );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  function onMouse( event ) {
    event.preventDefault();

    mouse.x =  ( event.clientX / window.innerWidth  ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( [ mesh ] );
    intersectionMesh.visible = false;
    if ( intersections.length ) {
      var intersection = intersections[0];
      intersectionMesh.position.copy( intersection.point );
      intersectionMesh.visible = true;
    }

    render();
  }

  document.addEventListener( 'mousedown', function( event ) {
    mouseDown = true;
    onMouse( event );
  });

  document.addEventListener( 'mousemove', onMouse );

  document.addEventListener( 'mouseup', function( event ) {
    mouseDown = false;
    onMouse( event );
  });

}) ();
