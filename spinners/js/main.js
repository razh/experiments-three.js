/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var clock = new THREE.Clock();
  var running = true;

  var dt = 1 / 60;
  var accumulatedTime = 0;

  var spinners = {
    circles: (function() {
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
    })(),

    loops: (function() {
      var radius = 0.1;
      var diameter = 2 * radius;

      var group = new THREE.Group();
      var meshes = new THREE.Group();

      var parent = meshes;
      var count = 8;
      var i = count;
      while ( i-- ) {
        var scale = i * diameter + 2;

        var geometry = new THREE.TorusGeometry( scale, radius, 16, 64 );
        var material = new THREE.MeshPhongMaterial({
          color: 'hsl(' + ( i * 360 / count ) + ', 100%, 50%)'
        });

        var mesh = new THREE.Mesh( geometry, material );
        parent.add( mesh );
        parent = mesh;
      }

      group.add( meshes );

      var light = new THREE.DirectionalLight();
      light.position.set( 0, 0, 16 );
      group.add( light );

      group.add( new THREE.AmbientLight( '#222' ) );

      return {
        group: group,
        update: function( dt ) {
          meshes.traverse(function( mesh ) {
            if (!mesh.geometry) {
              return;
            }

            mesh.rotation.x += dt;
            mesh.rotation.y += dt;
          });
        }
      };
    })(),

    particles: (function() {
      var PI2 = 2 * Math.PI;

      function randomPointOnSphere( vector, radius ) {
        radius = radius || 1;

        var theta = PI2 * Math.random();
        var u = 2 * Math.random() - 1;
        var v = Math.sqrt( 1 - u * u );

        return vector.set(
          radius * v * Math.cos( theta ),
          radius * v * Math.sin( theta ),
          radius * u
        );
      }

      var size = 0.1;

      var geometry = new THREE.BufferGeometry()
        .fromGeometry( new THREE.BoxGeometry( size, size, size ) );

      var material = new THREE.MeshPhongMaterial();

      var group = new THREE.Group();
      var particles = [];

      var count = 512;
      var i = count;
      while ( i-- ) {
        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );

        randomPointOnSphere( mesh.position, 3 * Math.random() );
        mesh.rotation.set(
          PI2 * Math.random(),
          PI2 * Math.random(),
          PI2 * Math.random()
        );
        mesh.scale.setLength( THREE.Math.randFloat( 0.5, 1.5 ) );

        particles.push({
          mesh: mesh
        });
      }

      var light = new THREE.DirectionalLight();
      light.position.set( 0, 0, 16 );
      group.add( light );

      group.add( new THREE.AmbientLight( '#222' ) );

      return {
        group: group,
        update: function( dt ) {
          group.rotation.x += dt;
          group.rotation.y += dt;
        }
      }
    })()
  };

  var spinner = spinners.particles;

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

    controls.addEventListener( 'change', function() {
      if ( !running ) {
        render();
      }
    });

    scene.add( spinner.group );
  }

  function render() {
    renderer.render( scene, camera );
  }

  function animate() {
    if ( !running ) {
      return;
    }

    var delta = Math.min( clock.getDelta(), 0.1 );
    accumulatedTime += delta;

    while ( accumulatedTime >= dt ) {
      spinner.update( dt );
      accumulatedTime -= dt;
    }

    render();
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });

  // Double click to restart animation.
  document.addEventListener( 'dblclick', function() {
    running = !running;

    if ( running ) {
      clock.start();
      animate();
    }
  });

  // Scroll to control animation.
  renderer.domElement.addEventListener( 'wheel', function( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    running = false;

    spinner.update( event.deltaY * dt );
    render();
  });
})();
