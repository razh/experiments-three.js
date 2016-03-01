/*global THREE, dat*/
(function() {
  'use strict';

  var container;

  var canvas, ctx;
  var size = 256;

  var brushCanvas, brushCtx;
  var eraserCanvas, eraserCtx;

  var scene, camera, renderer;
  var raycaster;
  var mouse;

  var geometry, material, mesh;
  var intersectionMesh;
  var texture;

  var mouseDown = false;

  var options = {
    brushRadius: 16,
    scale: 0.25
  };

  function drawRadialGradient( context, radius, colorStops ) {
    var diameter = 2 * radius;

    var gradient = context.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius
    );

    colorStops.map(function( colorStop ) {
      gradient.addColorStop.apply( gradient, colorStop );
    });

    context.fillStyle = gradient;
    context.fillRect( 0, 0, diameter, diameter );
  }

  function updateBrushRadius() {
    var radius = options.brushRadius;

    var brushDiameter = 2 * radius;
    brushCanvas.width  = brushDiameter;
    brushCanvas.height = brushDiameter;
    eraserCanvas.width  = brushDiameter;
    eraserCanvas.height = brushDiameter;

    // Draw brush.
    drawRadialGradient( brushCtx, radius, [
      [ 0, '#111' ],
      [ 1, 'transparent' ]
    ]);

    // Draw eraser.
    drawRadialGradient( eraserCtx, radius, [
      [ 0, 'rgba(0, 0, 0, 0.1)' ],
      [ 1, 'transparent' ]
    ]);
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( '#222' );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    scene.add( new THREE.AmbientLight( '#fff' ) );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, -0.75, 0.75 );
    camera.lookAt( new THREE.Vector3() );
    scene.add( camera );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    intersectionMesh = new THREE.Mesh(
      new THREE.SphereGeometry( 1 ),
      new THREE.MeshBasicMaterial({
        wireframe: true,
        opacity: 0.5,
        transparent: true
      })
    );
    intersectionMesh.visible = false;
    scene.add( intersectionMesh );

    // Height map.
    canvas = document.createElement( 'canvas' );
    ctx    = canvas.getContext( '2d' );

    canvas.width = size;
    canvas.height = size;

    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;

    texture = new THREE.Texture( canvas );
    document.body.appendChild( canvas );

    // Create canvas mesh.
    geometry = new THREE.PlaneBufferGeometry( 1, 1, 256, 256 );

    material = new THREE.MeshPhongMaterial({
      map: texture,
      displacementMap: texture,
      displacementScale: options.scale,
      fog: false
    });

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // Brush gradient.
    brushCanvas = document.createElement( 'canvas' );
    brushCtx    = brushCanvas.getContext( '2d' );

    // Erase brush gradient.
    eraserCanvas = document.createElement( 'canvas' );
    eraserCtx    = eraserCanvas.getContext( '2d' );

    updateBrushRadius();

    // GUI.
    var gui = new dat.GUI();

    gui.add( options, 'brushRadius', 1, 128 )
      .listen()
      .onChange( updateBrushRadius );

    gui.add( options, 'scale', 0.01, 2, 0.01 )
      .listen()
      .onChange(function( scale ) {
        material.setValues({ displacementScale: scale });
        material.needsUpdate = true;
      });
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

    var intersections = raycaster.intersectObject( mesh );
    var intersection;
    var point;
    intersectionMesh.visible = false;
    if ( intersections.length ) {
      intersection = intersections[0];
      point = intersection.point;
      intersectionMesh.position.copy( point );
      intersectionMesh.visible = true;

      var x = Math.round( size * (  point.x + 0.5 ) );
      var y = Math.round( size * ( -point.y + 0.5 ) );
      var z = options.scale * ( ctx.getImageData( x, y, 1, 1 ).data[ 0 ] / 255 );
      intersectionMesh.position.z = z || 0;

      var radius = options.brushRadius / 256;
      intersectionMesh.scale.set( radius, radius, radius );

      if ( mouseDown ) {
        // Paint on left mouse button. Erase on right.
        ctx.globalCompositeOperation = event.button !== 2 ?
          'lighter' :
          'normal';

        ctx.drawImage(
          event.button !== 2 ?
            brushCanvas :
            eraserCanvas,
          x - options.brushRadius,
          y - options.brushRadius
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

  document.addEventListener( 'contextmenu', onMouse );

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

}) ();
