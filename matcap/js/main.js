/*global THREE, requestAnimationFrame, Promise, fetch*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var mesh, texture,  material;

  var shaders = {};

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
    fetch( './shaders/matcap.vert' ),
    fetch( './shaders/matcap.frag' )
  ]).then(function( responses ) {
    shaders.vertex = responses[0].body;
    shaders.fragment = responses[1].body;

    init();
    animate();
  });


  var image = new Image();

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    image.onload = function() {
      texture.needsUpdate = true;
    };

    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

}) ();
