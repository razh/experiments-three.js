/*global THREE*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, renderer;
  var controls;

  function createTrackGeometry( radius, length, meshSpacing ) {
    var geometry = new THREE.Geometry();

    var height = radius * Math.sin( Math.PI / 3 );

    geometry.vertices = [
      // Left panel.
      new THREE.Vector3( radius / 2 + meshSpacing, 0, 0 ),
      new THREE.Vector3( radius + meshSpacing, height, 0 ),
      new THREE.Vector3( radius + meshSpacing, height, -length ),
      new THREE.Vector3( radius / 2 + meshSpacing, 0, -length ),

      // Center panel.
      new THREE.Vector3( -( radius / 2 ), 0, 0 ),
      new THREE.Vector3(  ( radius / 2 ), 0, 0 ),
      new THREE.Vector3(  ( radius / 2 ), 0, -length ),
      new THREE.Vector3( -( radius / 2 ), 0, -length ),

      // Right panel.
      new THREE.Vector3( -( radius + meshSpacing ), height, 0 ),
      new THREE.Vector3( -( radius / 2 + meshSpacing ), 0, 0 ),
      new THREE.Vector3( -( radius / 2 + meshSpacing ), 0, -length ),
      new THREE.Vector3( -( radius + meshSpacing ), height, -length )
    ];

    geometry.faces = [
      new THREE.Face3( 0, 1, 2 ),
      new THREE.Face3( 2, 3, 0 ),
      new THREE.Face3( 4, 5, 6 ),
      new THREE.Face3( 6, 7, 4 ),
      new THREE.Face3( 8, 9, 10 ),
      new THREE.Face3( 10, 11, 8 )
    ];

    geometry.computeFaceNormals();

    return geometry;
  }

  function createTrackMeshes( options ) {
    options = options || {};

    var count = options.count || 0;
    var radius = options.radius || 5;
    var length = options.length || 3;
    var spacing = options.spacing || 0.5;
    var meshSpacing = options.meshSpacing || 0.5;

    var geometry = createTrackGeometry( radius, length, meshSpacing );

    var material = new THREE.MeshBasicMaterial({
      color: '#fff'
    });

    var meshes = [];

    var mesh;
    for ( var i = 0; i < count; i++ ) {
      mesh = new THREE.Mesh( geometry, material );
      mesh.position.z = i * ( length + spacing );
      meshes.push( mesh );
    }

    return meshes;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    var vw = 568;
    var vh = 320;

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( vw, vh );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 90, vw / vh, 0.1, 1000 );
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var meshes = createTrackMeshes({
      count: 5
    });

    meshes.forEach(function( mesh ) {
      scene.add( mesh );
    });

    camera.position.set( 0, 2, -4 );
    var position = new THREE.Vector3().copy( camera.position );
    position.z = 10;
    controls.target = position;
    camera.lookAt( position );

    scene.fog = new THREE.FogExp2( 0x000000, 0.1 );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
