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
      var geometry = new THREE.TorusGeometry( 1, 0.1, 16, 64 );
      var material = new THREE.MeshPhongMaterial();

      var group = new THREE.Group();
      var meshes = new THREE.Group();

      [
        { rotation: [ Math.PI / 2, 0, 0 ], scale: 1.4 },
        { rotation: [ 0, Math.PI / 2, 0 ], scale: 1.2 },
        { rotation: [ 0, 0, Math.PI / 2 ] }
      ].map(function( transform ) {
        var scale = transform.scale || 1;
        var transformedGeometry = geometry.clone()
          .scale( scale, scale, scale );

        transformedGeometry.computeFaceNormals();
        transformedGeometry.computeVertexNormals();

        var mesh = new THREE.Mesh( transformedGeometry, material );
        mesh.rotation.fromArray( transform.rotation );
        return mesh;
      }).reduce(function( parent, mesh ) {
        parent.add( mesh );
        return mesh;
      }, meshes );

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

            mesh.rotation.x += 2 * dt;
            mesh.rotation.y += 2 * dt;
          });
        }
      };
    })()
  };

  var spinner = spinners.loops;

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
