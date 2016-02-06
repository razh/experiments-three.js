/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var clock = new THREE.Clock();

  var dt = 1 / 60;
  var accumulatedTime = 0;

  var circles = (function() {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshPhongMaterial();

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = 2;

    var group = new THREE.Group();
    group.add( mesh );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 0, 16 );
    group.add( light );

    group.add( new THREE.AmbientLight( '#222' ) );

    return {
      group: group,
      update: function( dt ) {
        mesh.rotation.x += 5 * dt;
        mesh.rotation.y += 5 * dt;
        group.rotation.y += 5 * dt;
      }
    };
  })();

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

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    scene.add( circles.group );
  }

  function animate() {
    var delta = Math.min( clock.getDelta(), 0.1 );
    accumulatedTime += delta;

    while ( accumulatedTime >= dt ) {
      circles.update( dt );
      accumulatedTime -= dt;
    }

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
