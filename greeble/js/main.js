/*global THREE, greeble*/
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  // Generic test greebling.
  function greeblerHelper( geometry ) {
    var greebles = greeble( geometry, {
      count: 300,
      fn: function() {
        return new THREE.BoxGeometry(
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 )
        );
      }
    });

    if ( greebles ) {
      geometry.merge( greebles );
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
      color: '#dde',
      specular: '#fff',
      shading: THREE.FlatShading
    }));

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000 );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    // Icosahedron greebled.
    var geometry = new THREE.IcosahedronGeometry( 2, 1 );
    var icosahedronMesh = greeblerHelper( geometry );
    scene.add( icosahedronMesh );

    // Plane greebled.
    geometry = new THREE.PlaneGeometry( 16, 16 );
    var planeMesh = greeblerHelper( geometry );
    planeMesh.position.y = -3;
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    scene.fog = new THREE.FogExp2( '#000', 0.1 );

    var light = new THREE.SpotLight( '#e85', 0.5 );
    light.position.set( 32, 128, 0 );
    light.castShadow = true;
    scene.add( light );

    scene.add( new THREE.AmbientLight( '#325' ) );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

})();
