/* global THREE */

(() => {
  'use strict';

  let container;

  let scene, camera, controls, renderer;

  let mesh, material;
  let light;

  const shaders = {};

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

    // Create custom BRDF approximation shader.
    const { phong } = THREE.ShaderLib;
    const uniforms = THREE.UniformsUtils.clone( phong.uniforms );

    material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: phong.vertexShader,
      fragmentShader: phong.fragmentShader,
    });

    mesh = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 1, 1 ),
      new THREE.MeshBasicMaterial({ color: '#fff' })
    );

    scene.add( mesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  fetch( './shaders/envBRDFApprox.frag' )
    .then( response => {
      console.log( response );

      init();
      animate();
    });
})();
