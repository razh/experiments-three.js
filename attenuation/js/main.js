/*global THREE, dat*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLDeferredRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 6 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var materialConfig = {
      ambient: '#777',
      color: '#777',
      specular: '#fff',
      shininess: 30
    };

    var mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry( 2, 4 ),
      new THREE.MeshPhongMaterial( materialConfig )
    );

    scene.add( mesh );

    var areaLight = new THREE.AreaLight( 0xffffff );
    areaLight.position.set( 0, 0, 6 );
    areaLight.normal.subVectors( mesh.position, areaLight.position );
    scene.add( areaLight );

    var lightConfig = {
      color: areaLight.color.getStyle()
    };

    function updateColor( object, property ) {
      return function( newValue ) {
        object[ property ].set( newValue );
      };
    }

    var gui = new dat.GUI({ width: 320 });

    var lightFolder = gui.addFolder( 'Area Light' );
    lightFolder.addColor( lightConfig, 'color' )
      .onChange( updateColor( areaLight, 'color' ) );
    lightFolder.add( areaLight, 'width', 1, 8 );
    lightFolder.add( areaLight, 'height', 1, 8 );
    lightFolder.add( areaLight, 'intensity', 1, 4 );
    lightFolder.add( areaLight, 'constantAttenuation', 0, 2 );
    lightFolder.add( areaLight, 'linearAttenuation', 0, 2 );
    lightFolder.add( areaLight, 'quadraticAttenuation', 0, 2 );
    lightFolder.open();

    function updateMaterial() {
      mesh.material = new THREE.MeshPhongMaterial( materialConfig );
      // HACK: This forces a reinitialization of the material within the
      // deferred context.
      mesh.userData.deferredInitialized = false;
    }

    var materialFolder = gui.addFolder( 'Material' );
    materialFolder.addColor( materialConfig, 'ambient' ).onChange( updateMaterial );
    materialFolder.addColor( materialConfig, 'color' ).onChange( updateMaterial );
    materialFolder.addColor( materialConfig, 'specular' ).onChange( updateMaterial );
    materialFolder.add( materialConfig, 'shininess', 1, 1000 ).onChange( updateMaterial );
    materialFolder.open();
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });

}) ();
