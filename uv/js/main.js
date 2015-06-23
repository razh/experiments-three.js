/*global THREE, dat*/
(function() {
  'use strict';

  var container;

  var canvas, ctx;
  var size = 256;

  var scene, camera, controls, renderer;

  var geometry, material, mesh;
  var texture;

  var options = {
    powerOfTwo: 8
  };

  function drawUVs( ctx, mesh ) {
    var canvas = ctx.canvas;
    var width  = canvas.width;
    var height = canvas.height;
    ctx.beginPath();

    mesh.geometry.faceVertexUvs[0].forEach(function( uvs ) {
      ctx.moveTo( width * uvs[0].x, height * uvs[0].y );
      ctx.lineTo( width * uvs[1].x, height * uvs[1].y );
      ctx.lineTo( width * uvs[2].x, height * uvs[2].y );
    });

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.stroke();
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
    camera.position.set( 0, 0, 2 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    scene.add( new THREE.HemisphereLight( '#fff', '#000' ) );

    // UV map.
    canvas = document.createElement( 'canvas' );
    ctx = canvas.getContext( '2d' );

    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '256px';
    canvas.style.height = '256px';

    texture = new THREE.Texture( canvas );
    document.body.appendChild( canvas );

    // Mesh.
    geometry = new THREE.IcosahedronGeometry( 1, 3 );
    material = new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.FlatShading
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    function drawUVTexture( exponent ) {
      var size = Math.pow( 2, exponent );
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#fff';
      ctx.fillRect( 0, 0, size, size );
      drawUVs( ctx, mesh );

      texture.needsUpdate = true;
    }

    drawUVTexture( options.powerOfTwo );

    // GUI.
    var gui = new dat.GUI();

    gui.add( options, 'powerOfTwo', 0, 12 )
      .step( 1 )
      .listen()
      .onChange( drawUVTexture );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

})();
