/* global THREE */
(function() {
  'use strict';

  var scene;

  var geometry, material, mesh;

  // Separate renderers is simpler than scissor testing.
  function createView( selector ) {
    var container = document.querySelector( selector );
    var rect = container.getBoundingClientRect();

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( rect.width, rect.height );
    renderer.shadowMap.enabled = true;
    renderer.setClearColor( new THREE.Color().setHSL( 0.6, 0.6, 0.85 ) );
    container.appendChild( renderer.domElement );

    var camera = new THREE.PerspectiveCamera( 60, rect.width / rect.height );

    return {
      container: container,
      renderer: renderer,
      camera: camera
    };
  }

  var views = {
    main: createView( '#main' ),
    mounted: createView( '#mounted' ),
    follow: createView( '#follow' )
  };

  var keys = {};

  function init() {
    scene = new THREE.Scene();

    var hemiLight = new THREE.HemisphereLight( '#fff', '#fff', 0.5 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.01, 0.2, 0.8 );
    hemiLight.position.set( 0, 512, 0 );
    scene.add( hemiLight );

    var light = new THREE.DirectionalLight();
    light.color.setHSL( 0.1, 0.1, 0.95 );
    light.castShadow = true;
    light.shadow.mapSize.set( 1024, 1024 );
    light.position.set( 8, 32, 32 );

    var planeGeometry = new THREE.PlaneBufferGeometry( 2048, 2048 );
    var plane = new THREE.Mesh( planeGeometry, new THREE.MeshStandardMaterial({
      color: '#343',
      metalness: 0.2,
      roughness: 0.9
    }));
    plane.rotateX( -Math.PI / 2 );
    plane.receiveShadow = true;
    scene.add( plane );

    geometry = new THREE.LatheGeometry([
      [ 0, 0 ],
      [ 0.2, 0 ],
      [ 0.22, 0.1 ],
      [ 0.22, 0.9 ],
      [ 0.15, 1 ],
      [ 0.15, 3.5 ],
      [ 0.2, 3.6 ],
      [ 0.2, 4 ],
      [ 0, 4.2 ]
    ].reduce(function( array, point ) {
      var vector = new THREE.Vector2().fromArray( point );
      // Duplicate to allow for sharp edges (endpoints are deduped).
      array.push( vector, vector );
      return array;
    }, [] ), 32 );

    material = new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.6
    });

    mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add( mesh );

    // Track mesh with light.
    mesh.add( light );
    light.target = mesh;

    // Cameras.
    views.main.camera.position.set( 0, 4, 8 );
    new THREE.OrbitControls( views.main.camera, views.main.container );

    mesh.add( views.mounted.camera );
    views.mounted.camera.position.set( -0.3, 2, 0 );
    views.mounted.camera.rotateX( -Math.PI / 2 );

    var cameraHelper = new THREE.CameraHelper( views.mounted.camera );
    cameraHelper.visible = false;
    scene.add( cameraHelper );

    views.follow.camera.position.set( 8, 0.1, 0 );
  }

  var update = (function() {
    var clock = new THREE.Clock();
    var speed = 10;

    return function() {
      var delta = clock.getDelta();
      var dy = 0;

      // W. Up.
      if ( keys[ 87 ] ) { dy = speed; }
      // S. Down.
      if ( keys[ 83 ] ) { dy = -speed; }

      mesh.position.y = Math.max( mesh.position.y + dy * delta, 0 );
      views.follow.camera.lookAt( mesh.position );
    };
  })();

  function animate() {
    update();

    Object.keys( views ).forEach(function( key ) {
      var view = views[ key ];
      view.renderer.render( scene, view.camera );
    });

    requestAnimationFrame( animate );
  }

  init();
  animate();

  document.addEventListener( 'keydown', function( event ) {
    keys[ event.keyCode ] = true;
  });

  document.addEventListener( 'keyup', function( event ) {
    keys[ event.keyCode ] = false;
  });

  window.addEventListener( 'resize', function() {
    Object.keys( views ).forEach(function( key ) {
      var view = views[ key ];

      var rect = view.container.getBoundingClientRect();
      view.camera.aspect = rect.width / rect.height;
      view.camera.updateProjectionMatrix();

      view.renderer.setSize( rect.width, rect.height );
    });
  });

})();
