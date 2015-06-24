/*global THREE, dat*/
(function() {
  'use strict';

  var container;

  var canvas, ctx;

  var scene, camera, controls, renderer;

  var geometry, material, mesh;
  var texture;

  var geometries = {
    icosahedron: new THREE.IcosahedronGeometry( 1, 3 ),
    sphere: new THREE.SphereGeometry( 1, 16, 16 ),
    octahedron: new THREE.OctahedronGeometry( 1, 2 ),
    tetrahedron: new THREE.TetrahedronGeometry( 1 ),
    box: new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4 ),
    cylinder: new THREE.CylinderGeometry( 0.5, 0.5, 2, 32, 4 ),
    torus: new THREE.TorusGeometry( 1, 0.25, 16, 16 )
  };

  var types = Object.keys( geometries );

  var options = {
    powerOfTwo: 8,
    strokeStyle: '#000',
    lineWidth: 0.5,
    type: 'icosahedron'
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

    ctx.strokeStyle = options.strokeStyle;
    ctx.lineWidth = options.lineWidth;
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

    scene.add( new THREE.HemisphereLight( '#fff', '#111' ) );

    // UV map.
    canvas = document.createElement( 'canvas' );
    ctx = canvas.getContext( '2d' );

    function resizeCanvas( exponent ) {
      var size = Math.pow( 2, exponent );
      canvas.width = size;
      canvas.height = size;
    }

    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '256px';
    canvas.style.height = '256px';

    resizeCanvas( options.powerOfTwo );
    texture = new THREE.Texture( canvas );
    document.body.appendChild( canvas );

    material = new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.FlatShading
    });

    function createMesh() {
      scene.remove( mesh );
      geometry = geometries[ options.type ];
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );
    }

    createMesh();

    function drawUVTexture() {
      ctx.fillStyle = '#fff';
      ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      drawUVs( ctx, mesh );

      texture.needsUpdate = true;
    }

    function resizeUVTexture( exponent ) {
      resizeCanvas( exponent );
      drawUVTexture();
    }

    drawUVTexture( options.powerOfTwo );

    // GUI.
    var gui = new dat.GUI();

    gui.add( options, 'powerOfTwo', 0, 12 )
      .step( 1 )
      .listen()
      .onChange( resizeUVTexture );

    gui.add( options, 'lineWidth', 0.01, 4 )
      .listen()
      .onChange( drawUVTexture );

    gui.addColor( options, 'strokeStyle' )
      .listen()
      .onChange( drawUVTexture );

    gui.add( options, 'type', types )
      .listen()
      .onChange(function() {
        createMesh();
        drawUVTexture();
      });
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

})();
