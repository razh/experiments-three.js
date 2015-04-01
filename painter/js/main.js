/*global THREE*/
(function() {
  'use strict';

  var container;

  var canvas, ctx;

  var brushCanvas, brushCtx;
  var brushGradient;
  var brushRadius = 16;
  var brushDiameter = 2 * brushRadius;

  var scene, camera, renderer;
  var raycaster;
  var mouse;

  var geometry, material, mesh;
  var intersectionMesh;
  var texture;

  var mouseDown = false;

  var size = 256;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, -0.75, 0.75 );
    camera.lookAt( new THREE.Vector3() );
    scene.add( camera );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    geometry = new THREE.PlaneBufferGeometry( 1, 1 );
    material = new THREE.MeshPhongMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    intersectionMesh = new THREE.Mesh(
      new THREE.SphereGeometry( 0.05 ),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    intersectionMesh.visible = false;
    scene.add( intersectionMesh );

    var light = new THREE.PointLight( '#fff', 0.5 );
    light.position.set( 1, 2, 1 );
    scene.add( light );

    // Height map.
    canvas = document.createElement( 'canvas' );
    ctx    = canvas.getContext( '2d' );

    canvas.width = size;
    canvas.height = size;

    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;

    texture = new THREE.Texture( canvas );
    material.bumpMap = texture;
    document.body.appendChild( canvas );

    // Brush gradient.
    brushCanvas = document.createElement( 'canvas' );
    brushCtx    = brushCanvas.getContext( '2d' );

    brushCanvas.width  = brushDiameter;
    brushCanvas.height = brushDiameter;

    brushGradient = ctx.createRadialGradient(
      brushRadius, brushRadius, 0,
      brushRadius, brushRadius, brushRadius
    );
    brushGradient.addColorStop( 0, '#222' );
    brushGradient.addColorStop( 1, 'transparent' );

    brushCtx.fillStyle = brushGradient;
    brushCtx.fillRect( 0, 0, brushDiameter, brushDiameter );
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
      var point = intersection.point;
      intersectionMesh.position.copy( point );
      intersectionMesh.visible = true;

      if ( mouseDown ) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(
          brushCanvas,
          size * (  point.x + 0.5 ) - brushRadius,
          size * ( -point.y + 0.5 ) - brushRadius
        );

        texture.needsUpdate = true;
      }
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
