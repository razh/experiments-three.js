/*global THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var skyboxScene, skyboxCamera;
  var scene, camera, controls, renderer;

  var canvases = {};
  var contexts = {};

  [
    'left',
    'right',
    'top',
    'bottom',
    'back',
    'front'
  ].forEach(function( key ) {
    var canvas = canvases[ key ] = document.createElement( 'canvas' );
    contexts[ key ] = canvas.getContext( '2d' );
  });

  function setSkyboxTextureDimensions( width, height ) {
    Object.keys( canvases ).forEach(function( key ) {
      var canvas = canvases[ key ];
      canvas.width = width;
      canvas.height = height;

      var ctx = contexts[ key ];
      ctx.fillStyle = 'rgb(' +
        Math.round( Math.random() * 255 ) + ',' +
        Math.round( Math.random() * 255 ) + ',' +
        Math.round( Math.random() * 255 ) +
      ')';

      ctx.fillRect( 0, 0, width, height );
    });
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    skyboxScene = new THREE.Scene();
    skyboxCamera = camera.clone();
    skyboxScene.add( skyboxCamera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    setSkyboxTextureDimensions( 512, 512 );

    var textures = Object.keys( canvases ).map(function( key ) {
      return canvases[ key ];
    });

    var textureCube = new THREE.CubeTexture( textures );
    textureCube.needsUpdate = true;

    var shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = textureCube;

    var material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
    skyboxScene.add( mesh );

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ) );
    scene.add( mesh );
  }

  function animate() {
    skyboxCamera.rotation.copy( camera.rotation );

    renderer.render( skyboxScene, skyboxCamera );
    renderer.render( scene, camera );

    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
