/* global THREE, Collision, BODY_STATIC, BODY_DYNAMIC */

(() => {
  'use strict';

  let container;

  let scene, camera, renderer;
  let boxes = [];

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 16 );

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#777' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    for ( let i = 0; i < 100; i++ ) {
      const geometry = new THREE.BoxGeometry(
        THREE.Math.randFloat( 1, 4 ),
        THREE.Math.randFloat( 1, 4 ),
        THREE.Math.randFloat( 1, 4 )
      );

      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh( geometry, material );
      mesh.boundingBox = new THREE.Box3().setFromObject( mesh );

      mesh.position.set(
        THREE.Math.randFloat( -6, 6 ),
        THREE.Math.randFloat( -6, 6 ),
        THREE.Math.randFloat( -6, 6 )
      );

      mesh.physics = Math.random() < 0.5 ? BODY_STATIC : BODY_DYNAMIC;
      if ( mesh.physics === BODY_STATIC ) {
        mesh.material.emissive.setHex( 0xffffff );
      }

      scene.add( mesh );
      boxes.push( mesh );
    }

    const userBoxMesh = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 1, 1 ),
      new THREE.MeshStandardMaterial({
        emissive: 'green',
      })
    );

    userBoxMesh.boundingBox = new THREE.Box3().setFromObject( userBoxMesh );
    userBoxMesh.position.set( 8, 0, 0 );
    userBoxMesh.physics = BODY_DYNAMIC;

    scene.add( userBoxMesh );
    boxes.push( userBoxMesh );

    const transformControls = new THREE.TransformControls( camera, renderer.domElement );
    transformControls.addEventListener( 'change', render );
    transformControls.attach( userBoxMesh );
    scene.add( transformControls );
  }

  function render() {
    Collision.update( boxes );
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
