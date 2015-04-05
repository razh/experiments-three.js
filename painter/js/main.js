/*global THREE, dat*/
(function() {
  'use strict';

  var container;

  var canvas, ctx;
  var size = 256;

  var brushCanvas, brushCtx;

  var scene, camera, renderer;
  var raycaster;
  var mouse;

  var geometry, material, mesh;
  var intersectionMesh;
  var texture;

  var mouseDown = false;

  var options = {
    brushRadius: 16
  };

  function updateBrushRadius( ) {
    var radius = options.brushRadius;

    var brushDiameter = 2 * radius;
    brushCanvas.width  = brushDiameter;
    brushCanvas.height = brushDiameter;

    var brushGradient = ctx.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius
    );
    brushGradient.addColorStop( 0, '#111' );
    brushGradient.addColorStop( 1, 'transparent' );

    brushCtx.fillStyle = brushGradient;
    brushCtx.fillRect( 0, 0, brushDiameter, brushDiameter );
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
      new THREE.SphereGeometry( 0.05 ),
      new THREE.MeshBasicMaterial({ wireframe: true })
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
    geometry.computeTangents();

    // Custom normal displacement shader.
    var shader = THREE.NormalDisplacementShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    uniforms.enableAO.value = true;
    uniforms.enableDisplacement.value = true;

    uniforms.tAO.value = texture;
    uniforms.tDisplacement.value = texture;
    uniforms.uDisplacementScale.value = 0.25;

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      lights: true,
      fog: false
    });

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // Brush gradient.
    brushCanvas = document.createElement( 'canvas' );
    brushCtx    = brushCanvas.getContext( '2d' );
    updateBrushRadius();

    // GUI.
    var gui = new dat.GUI();

    gui.add( options, 'brushRadius', 1, 128 )
      .listen()
      .onChange( updateBrushRadius );
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
        // Paint on left mouse button. Erase on right.
        ctx.globalCompositeOperation = event.button !== 2 ?
          'lighter' :
          'destination-out';

        ctx.drawImage(
          brushCanvas,
          size * (  point.x + 0.5 ) - options.brushRadius,
          size * ( -point.y + 0.5 ) - options.brushRadius
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

}) ();
