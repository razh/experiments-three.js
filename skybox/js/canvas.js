/* global THREE */

(() => {
  'use strict';

  let container;

  let skyboxScene, skyboxCamera;
  let scene, camera, renderer;

  const canvases = {};
  const contexts = {};

  [
    'left',
    'right',
    'top',
    'bottom',
    'back',
    'front',
  ].forEach( key => {
    const canvas = canvases[ key ] = document.createElement( 'canvas' );
    contexts[ key ] = canvas.getContext( '2d' );
  });

  function setSkyboxTextureDimensions( width, height ) {
    Object.keys( canvases ).forEach( key => {
      const canvas = canvases[ key ];
      canvas.width = width;
      canvas.height = height;
    });
  }

  function drawSkyboxTextures( textureFns ) {
    Object.keys( textureFns ).forEach( key => {
      const ctx = contexts[ key ];
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
    const color = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random()
    );

    fillContext( ctx, color.getStyle() );
  }

  function createRandomSkyboxTextures() {
    return {
      left: fillRandomColor,
      right: fillRandomColor,
      top: fillRandomColor,
      bottom: fillRandomColor,
      back: fillRandomColor,
      front: fillRandomColor,
    };
  }

  const createGradientSkyboxTextures = (() => {
    const _canvas = document.createElement( 'canvas' );
    const _ctx = _canvas.getContext( '2d' );

    // From top to bottom.
    return ( height, colorStops ) => {
      const topColor = colorStops[0][1];
      const bottomColor = colorStops[ colorStops.length - 1 ][1];

      // Construct gradient from color stops.
      const gradient = _ctx.createLinearGradient( 0, height, 0, 0 );

      colorStops.forEach( colorStop => {
        const [ offset, color ] = colorStop;
        gradient.addColorStop( 1 - offset, color );
      });

      function fillGradient( ctx ) {
        fillContext( ctx, gradient );
      }

      return {
        left: fillGradient,
        right: fillGradient,
        top( ctx ) {
          fillContext( ctx, topColor );
        },
        bottom( ctx ) {
          fillContext( ctx, bottomColor );
        },
        back: fillGradient,
        front: fillGradient,
      };
    };
  })();

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

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    setSkyboxTextureDimensions( 512, 512 );
    drawSkyboxTextures( createRandomSkyboxTextures() );
    drawSkyboxTextures(
      createGradientSkyboxTextures( 512, [
        [ 0, '#ddd' ],
        [ 1, '#333' ],
      ])
    );

    const textures = Object.keys( canvases ).map( key => canvases[ key ] );

    const textureCube = new THREE.CubeTexture( textures );
    textureCube.needsUpdate = true;

    const shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = textureCube;

    const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
    skyboxScene.add( mesh );

    const envMaterial = new THREE.MeshStandardMaterial({
      color: '#ddd',
      envMap: textureCube,
    });

    const sphereMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 2, 64, 64 ), envMaterial );
    scene.add( sphereMesh );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 8, 8, 0 );
    scene.add( light );

    const ambientLight = new THREE.AmbientLight( 0x888888 );
    scene.add( ambientLight );
  }

  function render() {
    skyboxCamera.rotation.copy( camera.rotation );

    renderer.render( skyboxScene, skyboxCamera );
    renderer.render( scene, camera );
  }

  init();
  render();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
})();
