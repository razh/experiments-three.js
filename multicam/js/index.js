/* global THREE */

(function() {
  'use strict';

  let scene;

  let geometry, material, mesh;

  // Separate renderers is simpler than scissor testing.
  function createView( selector ) {
    const container = document.querySelector( selector );
    const rect = container.getBoundingClientRect();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( rect.width, rect.height );
    renderer.shadowMap.enabled = true;
    renderer.setClearColor( new THREE.Color().setHSL( 0.6, 0.6, 0.85 ) );
    container.appendChild( renderer.domElement );

    const camera = new THREE.PerspectiveCamera( 60, rect.width / rect.height );

    return {
      container,
      renderer,
      camera,
    };
  }

  const views = {
    main: createView( '#main' ),
    mounted: createView( '#mounted' ),
    follow: createView( '#follow' ),
  };

  const keys = {};

  function init() {
    scene = new THREE.Scene();

    const hemiLight = new THREE.HemisphereLight( '#fff', '#fff', 0.5 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.01, 0.2, 0.8 );
    hemiLight.position.set( 0, 512, 0 );
    scene.add( hemiLight );

    const light = new THREE.DirectionalLight();
    light.color.setHSL( 0.1, 0.1, 0.95 );
    light.castShadow = true;
    light.shadow.mapSize.set( 1024, 1024 );
    light.shadow.camera.top = 24;
    light.position.set( 8, 32, 32 );
    scene.add( light );

    const planeGeometry = new THREE.PlaneBufferGeometry( 2048, 2048 );
    const plane = new THREE.Mesh( planeGeometry, new THREE.MeshStandardMaterial({
      color: '#343',
      metalness: 0.2,
      roughness: 0.9,
    }));
    plane.rotateX( -Math.PI / 2 );
    plane.receiveShadow = true;
    scene.add( plane );

    // Tower.
    const towerGeometry = new THREE.BoxBufferGeometry( 0.2, 4, 0.2 );
    const tower = new THREE.Mesh( towerGeometry, new THREE.MeshStandardMaterial({
      roughness: 0.8,
    }));
    tower.position.set( 0, 2, -1.5 );
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add( tower );

    // Launchpad.
    const launchPadGeometry = new THREE.BoxBufferGeometry( 4, 0.1, 4 );
    const launchPad = new THREE.Mesh( launchPadGeometry, new THREE.MeshStandardMaterial({
      color: '#888',
      metalness: 0.1,
      roughness: 0.9,
    }));
    launchPad.castShadow = true;
    launchPad.receiveShadow = true;
    scene.add( launchPad );

    geometry = new THREE.LatheGeometry([
      [ 0, 0 ],
      [ 0.2, 0 ],
      [ 0.22, 0.1 ],
      [ 0.22, 0.9 ],
      [ 0.15, 1 ],
      [ 0.15, 3.5 ],
      [ 0.2, 3.6 ],
      [ 0.2, 4 ],
      [ 0, 4.2 ],
    ].reduce(( array, point ) => {
      const vector = new THREE.Vector2().fromArray( point );
      // Duplicate to allow for sharp edges (dedupe endpoints).
      array.push( vector, vector );
      return array;
    }, [] ), 32 );

    material = new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.6,
    });

    mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add( mesh );

    // Cameras.
    views.main.camera.position.set( 0, 4, 8 );
    new THREE.OrbitControls( views.main.camera, views.main.container );

    mesh.add( views.mounted.camera );
    views.mounted.camera.position.set( -0.3, 2, 0 );
    views.mounted.camera.rotateX( -Math.PI / 2 );

    const cameraHelper = new THREE.CameraHelper( views.mounted.camera );
    cameraHelper.visible = false;
    scene.add( cameraHelper );

    views.follow.camera.position.set( 8, 0.1, 0 );
  }

  const update = (() => {
    const clock = new THREE.Clock();
    const speed = 10;

    return () => {
      const delta = clock.getDelta();
      let dy = 0;

      // W. Up.
      if ( keys.KeyW ) { dy += speed; }
      // S. Down.
      if ( keys.KeyS ) { dy -= speed; }

      mesh.position.y = Math.max( mesh.position.y + dy * delta, 0 );
      views.follow.camera.lookAt( mesh.position );
    };
  })();

  function animate() {
    update();

    Object.keys( views ).forEach( key => {
      const view = views[ key ];
      view.renderer.render( scene, view.camera );
    });

    requestAnimationFrame( animate );
  }

  init();
  animate();

  document.addEventListener( 'keydown', event => keys[ event.code ] = true );
  document.addEventListener( 'keyup', event => keys[ event.code ] = false );

  window.addEventListener( 'resize', () => {
    Object.keys( views ).forEach( key => {
      const view = views[ key ];

      const rect = view.container.getBoundingClientRect();
      view.camera.aspect = rect.width / rect.height;
      view.camera.updateProjectionMatrix();

      view.renderer.setSize( rect.width, rect.height );
    });
  });
})();
