/* global THREE, dat, createAnimatedSphereGeometry */

(function() {
  'use strict';

  let container;

  let scene, camera, renderer;

  let animateGeometry, geometry, mesh;
  let light;

  let clock;

  const types = [ 'point', 'wireframe', 'mesh' ];

  const constructors = {
    point: THREE.Points,
    wireframe: THREE.Mesh,
    mesh: THREE.Mesh,
  };

  const materials = {
    point: new THREE.PointsMaterial({
      size: 0.01,
    }),

    wireframe: new THREE.MeshPhongMaterial({
      wireframe: true,
    }),

    mesh: new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      side: THREE.DoubleSide,
    }),
  };

  const config = {
    count: 24,
    type: 'point',
  };

  function createMesh() {
    scene.remove( mesh );
    mesh = new constructors[ config.type ]( geometry, materials[ config.type ] );
    scene.add( mesh );
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

    new THREE.OrbitControls( camera, renderer.domElement );

    light = new THREE.HemisphereLight( '#fff', '#111' );
    light.position.set( 8, 8, 0 );
    scene.add( light );

    clock = new THREE.Clock();

    animateGeometry = createAnimatedSphereGeometry( 1, config.count, config.count );
    geometry = animateGeometry( 1, 1 );

    createMesh();

    const gui = new dat.GUI();

    gui.add( config, 'count', 3, 48 )
      .step( 1 )
      .listen()
      .onChange(() => {
        animateGeometry = createAnimatedSphereGeometry( 1, config.count, config.count );
      });

    gui.add( config, 'type', types )
      .listen()
      .onChange( createMesh );
  }

  function animate() {
    const time = clock.getElapsedTime();
    const min = 1 / config.count;

    const duration = 4;
    const halfDuration = duration / 2;

    const t = time % duration;
    geometry = animateGeometry(
      Math.max( t / halfDuration, min ),
      Math.max( t / halfDuration, 1 ) - 1 + min
    );

    createMesh();

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });
}());
