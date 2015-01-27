/*global THREE*/
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
    });
  }

  function drawSkyboxTextures( textureFns ) {
    Object.keys( textureFns ).forEach(function( key ) {
      var ctx = contexts[ key ];
      if ( !ctx ) {
        return;
      }

      textureFns[ key ]( ctx );
    });
  }

  function fillContext( ctx, style ) {
    ctx.fillStyle = style;
    ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
  }

  function fillRandomColor( ctx ) {
    var color = 'rgb(' +
      Math.round( Math.random() * 255 ) + ',' +
      Math.round( Math.random() * 255 ) + ',' +
      Math.round( Math.random() * 255 ) +
    ')';

    fillContext( ctx, color );
  }

  function createRandomSkyboxTextures() {
    return {
      left: fillRandomColor,
      right: fillRandomColor,
      top: fillRandomColor,
      bottom: fillRandomColor,
      back: fillRandomColor,
      front: fillRandomColor
    };
  }

  var createGradientSkyboxTextures = (function() {
    var _canvas = document.createElement( 'canvas' );
    var _ctx = _canvas.getContext( '2d' );

    // From top to bottom.
    return function( height, colorStops ) {
      var topColor = colorStops[0][1];
      var bottomColor = colorStops[ colorStops.length - 1 ][1];

      // Construct gradient from color stops.
      var gradient = _ctx.createLinearGradient( 0, height, 0, 0 );

      colorStops.forEach(function( colorStop ) {
        var offset = colorStop[0];
        var color = colorStop[1];

        gradient.addColorStop( offset, color );
      });

      function fillGradient( ctx ) {
        fillContext( ctx, gradient );
      }

      return {
        left: fillGradient,
        right: fillGradient,
        top: function( ctx ) {
          fillContext( ctx, topColor );
        },
        bottom: function( ctx ) {
          fillContext( ctx, bottomColor );
        },
        back: fillGradient,
        front: fillGradient
      };
    };
  }) ();

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
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
    drawSkyboxTextures( createRandomSkyboxTextures() );
    drawSkyboxTextures(
      createGradientSkyboxTextures( 512, [
        [ 0, '#ddd' ],
        [ 1, '#333' ]
      ])
    );

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

    var envMaterial = new THREE.MeshPhongMaterial({
      color: '#ddd',
      envMap: textureCube
    });

    mesh = new THREE.Mesh( new THREE.SphereGeometry( 2, 32, 32 ), envMaterial );
    scene.add( mesh );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 8, 8, 0 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x888888 );
    scene.add( light );
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
