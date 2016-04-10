/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;

  var cameras = {
    mounted: new THREE.PerspectiveCamera( 60 )
  };

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 4, 8 );

    new THREE.OrbitControls( camera, renderer.domElement );

    var ambientLight = new THREE.AmbientLight( '#333' );
    scene.add( ambientLight );

    var light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.position.set( 4, 4, 4 );
    scene.add( light );

    var circleGeometry = new THREE.CircleBufferGeometry( 8, 64 );
    var circle = new THREE.Mesh( circleGeometry, new THREE.MeshStandardMaterial() );
    circle.rotateX( -Math.PI / 2 );
    circle.receiveShadow = true;
    scene.add( circle );

    geometry = new THREE.LatheGeometry([
      [ 0, 0 ],
      [ 0.2, 0 ],
      [ 0.2, 4 ],
      [ 0, 4.2 ]
    ].map(function( array ) {
      return new THREE.Vector2().fromArray( array );
    }), 16);

    material = new THREE.MeshStandardMaterial();
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = 0.1;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add( mesh );

    mesh.add( cameras.mounted );
    cameras.mounted.lookAt( 0, -1, 0 );
    cameras.mounted.position.set( 0, 2, 0.2 );
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

})();
