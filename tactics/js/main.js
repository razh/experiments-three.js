/* global THREE, createArrow */

(() => {
  'use strict';

  const clock = new THREE.Clock();

  let container;

  let scene, camera, controls, renderer;

  let ambientLight;
  let spotLight;

  let planeGeometry, planeMaterial, planeMesh;
  let geometry, material, mesh;

  let arrowShape, arrow;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 6, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI / 2;

    ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );

    spotLight = new THREE.SpotLight( 0xffffff, 1, 0 );
    spotLight.position.set( 0, 32, 0 );
    scene.add( spotLight );

    planeGeometry = new THREE.PlaneBufferGeometry( 8, 8 );
    planeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    geometry = new THREE.BoxGeometry( 8, 0.2, 8 );
    material = new THREE.MeshPhongMaterial({ color: 0xdddddd });
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = 1;
    scene.add( mesh );

    // Arrows.
    const arrowOptions = {
      color: 0xff0000,
      markerWidth: 0.1,
      markerLength: 0.2,
      linewidth: 1,
      divisions: 32,
    };

    arrowShape = new THREE.Shape();
    arrowShape.moveTo( 4, 4 );
    arrowShape.bezierCurveTo( 4, 1, 3, 0, 0, 0 );
    arrow = createArrow( arrowShape, arrowOptions );
    arrow.position.y = 1.5;
    scene.add( arrow );

    // Reverse direction.
    arrowShape = new THREE.Shape();
    arrowShape.moveTo( 0, 0 );
    arrowShape.bezierCurveTo( 3, 0, 4, 0, 4, 4 );
    arrow = createArrow( arrowShape, arrowOptions );
    arrow.position.set( -2, 1.5, 2 );
    scene.add( arrow );

    // Shear.
    arrowOptions.markerShear = Math.PI / 7;
    arrow = createArrow( arrowShape, arrowOptions );
    arrow.position.set( -3, 1.5, 3 );
    scene.add( arrow );

    camera.lookAt( mesh.position );
    controls.target.copy( mesh.position );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );

    const time = clock.getElapsedTime();
    const t = 0.5 * ( Math.sin( time ) + 1 );
    arrow.lerp( THREE.Math.smootherstep( t, 0, 1 ) );
  }

  init();
  animate();
})();
