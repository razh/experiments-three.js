/* global THREE, dat, Toroid */

(() => {
  'use strict';

  let container;
  let scene, camera, controls, renderer;
  let mesh, texture, material;
  let toroidMesh;
  const shaders = {};

  const image = new Image();

  const config = {
    toroid: false,
  };

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    texture = new THREE.Texture( image );
    texture.anisotropy = renderer.getMaxAnisotropy();
    image.addEventListener( 'load', () => {
      texture.needsUpdate = true;
      render();
    });

    material = new THREE.ShaderMaterial({
      uniforms: { tMatCap: { type: 't', value: texture } },
      vertexShader: shaders.vertex,
      fragmentShader: shaders.fragment,
    });

    mesh = new THREE.Mesh(
      new THREE.TorusBufferGeometry( 1, 0.4, 64, 48 ),
      material
    );

    toroidMesh = new THREE.Mesh(
      new Toroid( 4, 1, 0.4, 64, 256 ),
      material
    );

    toroidMesh.visible = false;

    scene.add( mesh );
    scene.add( toroidMesh );

    // Add GUI to toggle between torus and toroid meshes.
    const gui = new dat.GUI();

    gui.add( config, 'toroid' )
      .onChange( toroidVisible => {
        mesh.visible = !toroidVisible;
        toroidMesh.visible = toroidVisible;
        render();
      });
  }

  function render() {
    renderer.render( scene, camera );
  }

  Promise.all([
    './shaders/matcap-phong.vert',
    './shaders/matcap-phong.frag',
  ].map( url => {
    return fetch( url ).then( response => response.text() );
  })).then( responses => {
    [ shaders.vertex, shaders.fragment ] = responses;

    // Use default texture.
    image.src = createDefaultTexture().toDataURL();

    init();
    render();
  });

  function getURL( event ) {
    const { files } = event.dataTransfer;
    const [ file ] = files;
    if ( file ) {
      return URL.createObjectURL( file );
    }

    const url = event.dataTransfer.getData( 'url' );
    if ( url ) {
      return url;
    }

    return;
  }

  document.addEventListener( 'drop', event => {
    event.stopPropagation();
    event.preventDefault();

    const url = getURL( event );
    if ( url ) {
      image.crossOrigin = '';
      image.src = url;
    }
  });

  document.addEventListener( 'dragover', event => {
    event.stopPropagation();
    event.preventDefault();
  });

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

  function createDefaultTexture() {
    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    const size = 256;
    const radius = size / 2;

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, size, size );

    ctx.beginPath();
    ctx.arc( radius, radius, radius, 0, 2 * Math.PI );
    ctx.fillStyle = '#222';
    ctx.fill();

    const gradient = ctx.createRadialGradient(
      radius, 0.5 * radius, 0.25 * radius,
      radius, radius, radius
    );

    gradient.addColorStop( 0, '#fff' );
    gradient.addColorStop( 1, 'transparent' );

    ctx.fillStyle = gradient;
    ctx.fill();

    return canvas;
  }
})();
