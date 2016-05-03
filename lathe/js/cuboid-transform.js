/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;
  var wireframe;

  var faceHelpers;
  var edgeHelpers;
  var vertexHelpers;

  var transformControls;

  var state = {
    vertex: null
  };

  function remove( object ) {
    if ( object && object.parent ) {
      object.parent.remove( object );
    }
  }

  function createWireframe() {
    remove( wireframe );
    wireframe = new THREE.WireframeHelper( mesh );
    scene.add( wireframe );
  }


  function highlightVertex( vertex ) {
    if ( vertex === state.vertex ) {
      return;
    }

    state.vertex = vertex;

    if ( vertexHelpers ) {
      vertexHelpers.forEach( remove );
    }

    var size = 0.15;

    vertexHelpers = [ vertex ].map(function( vertex ) {
      var vertexHelper = new THREE.Mesh(
        new THREE.BoxBufferGeometry( size, size, size ),
        new THREE.MeshBasicMaterial()
      );

      vertexHelper.position.copy( vertex );
      scene.add( vertexHelper );
      return vertexHelper;
    });
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    var axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading,
      opacity: 0.8,
      transparent: true
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  var mouse = new THREE.Vector2();
  var vector = new THREE.Vector3();

  function onMouseMove( event ) {
    mouse.set( event.clientX, event.clientY );

    var minDistanceToSquared = Infinity;
    var minVertex;

    geometry.vertices.forEach(function( vertex ) {
      vector.copy( vertex ).project( camera );

      vector.set(
        window.innerWidth  * ( 1 + vector.x ) / 2,
        window.innerHeight * ( 1 - vector.y ) / 2
      );

      var distanceToSquared = mouse.distanceToSquared( vector );
      if ( distanceToSquared < minDistanceToSquared ) {
        minDistanceToSquared = distanceToSquared;
        minVertex = vertex;
      }
    });

    highlightVertex( minVertex );
    render();
  }

  document.addEventListener( 'mousemove', onMouseMove );

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

})();
