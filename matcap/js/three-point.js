/* global THREE, dat */

(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var mesh;
  var keyLight, fillLight, backLight;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLDeferredRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 2 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    var materialConfig = {
      ambient: '#fdf',
      color: '#fdf',
      specular: '#444',
      shininess: 200,
    };

    mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry( 1, 4 ),
      new THREE.MeshPhongMaterial( materialConfig )
    );

    scene.add( mesh );

    var gui = new dat.GUI({ width: 320 });

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

    function createAreaLightFolder( name, light ) {
      var folder = gui.addFolder( name );

      var config = {
        color: light.color.getStyle(),
      };

      folder.addColor( config, 'color' )
        .onChange(function( newValue ) {
          light.color.set( newValue );
        });

      function updateNormal() {
        light.normal.subVectors( mesh.position, light.position );
      }

      folder.add( light.position, 'x', -4, 4 ).onChange( updateNormal );
      folder.add( light.position, 'y', -4, 4 ).onChange( updateNormal );
      folder.add( light.position, 'z', -4, 4 ).onChange( updateNormal );

      folder.add( light, 'width', 1, 8 );
      folder.add( light, 'height', 1, 8 );
      folder.add( light, 'intensity', 0.5, 4 );
      folder.add( light, 'constantAttenuation', 0, 2 );
      folder.add( light, 'linearAttenuation', 0, 2 );
      folder.add( light, 'quadraticAttenuation', 0, 2 );

      return folder;
    }

    keyLight = new THREE.AreaLight( 0x77bbdd, 1 );
    keyLight.position.set( -2, -2, 2 );
    keyLight.normal.subVectors( mesh.position, keyLight.position );
    keyLight.width = 2;
    keyLight.height = 2;
    scene.add( keyLight );

    fillLight = new THREE.AreaLight( 0x77bbdd, 1 );
    fillLight.position.set( -2, -2, 2 );
    fillLight.normal.subVectors( mesh.position, fillLight.position );
    fillLight.width = 2;
    fillLight.height = 2;
    scene.add( fillLight );

    backLight = new THREE.AreaLight( 0xcc4433, 0.5 );
    backLight.position.set( 1, 0, 2 );
    backLight.normal.subVectors( mesh.position, backLight.position );
    backLight.width = 1;
    backLight.height = 1;
    scene.add( backLight );

    var keyLightFolder = createAreaLightFolder( 'Key Light', keyLight );
    var fillLightFolder = createAreaLightFolder( 'Fill Light', fillLight );
    var backLightFolder = createAreaLightFolder( 'Back Light', backLight );

    keyLightFolder.open();
    fillLightFolder.open();
    backLightFolder.open();
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
