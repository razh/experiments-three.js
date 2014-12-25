/*global THREE, requestAnimationFrame, Promise, fetch*/
(function() {
  'use strict';

  var container;
  var scene, camera, controls, renderer;
  var mesh, texture,  material;
  var shaders = {};

  var image = new Image();

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    texture = new THREE.Texture( image );
    texture.anisotropy = renderer.getMaxAnisotropy();
    image.onload = function() {
      texture.needsUpdate = true;
    };

    material = new THREE.ShaderMaterial({
      uniforms: { tMatCap: { type: 't', value: texture } },
      vertexShader: shaders.vertex,
      fragmentShader: shaders.fragment
    });

    mesh = new THREE.Mesh(
      new THREE.TorusGeometry( 1, 0.4, 64, 48 ),
      material
    );

    scene.add( mesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  Promise.all([
    './shaders/matcap-phong.vert',
    './shaders/matcap-phong.frag'
  ].map(function( url ) {
    return fetch( url ).then(function( response ) {
      return response.text();
    });
  })).then(function( responses ) {
    shaders.vertex = responses[0];
    shaders.fragment = responses[1];

    // Use default texture.
    image.src = createDefaultTexture().toDataURL();

    init();
    animate();
  });

  function getURL( event ) {
    var files = event.dataTransfer.files;
    var file = files[0];
    if ( file ) {
      return URL.createObjectURL( file );
    }

    var url = event.dataTransfer.getData( 'url' );
    if ( url ) {
      return url;
    }

    return;
  }

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    var url = getURL( event );
    if ( url ) {
      image.crossOrigin = '';
      image.src = url;
    }
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });


  function createDefaultTexture() {
    var canvas = document.createElement( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    var size = 256;
    var radius = size / 2;

    canvas.width = canvas.height = size;

    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, size, size );

    ctx.beginPath();
    ctx.arc( radius, radius, radius, 0, 2 * Math.PI );
    ctx.fillStyle = '#222';
    ctx.fill();

    var gradient = ctx.createRadialGradient(
      radius, 0.5 * radius, 0.25 * radius,
      radius, radius, radius
    );

    gradient.addColorStop( 0, '#fff' );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fill();

    return canvas;
  }

}) ();
