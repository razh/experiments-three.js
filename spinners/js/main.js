/* global THREE, drawGear */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var clock = new THREE.Clock();
  var running = true;

  var dt = 1 / 60;
  var accumulatedTime = 0;

  var lights = {
    basic: function( scene ) {
      var light = new THREE.DirectionalLight();
      light.position.set( 0, 8, 16 );
      scene.add( light );

      scene.add( new THREE.AmbientLight( '#222' ) );
    }
  };

  var spinners = {
    circles: (function() {
      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      var material = new THREE.MeshPhongMaterial();

      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = 2;

      var group = new THREE.Group();
      group.add( mesh );

      lights.basic( group );

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

      lights.basic( group );

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

      var scene = new THREE.Group();
      var group = new THREE.Group();
      scene.add( group );

      var particles = [];

      var count = 512;
      var i = count;
      while ( i-- ) {
        var particle = new THREE.Object3D();
        group.add( particle );

        var mesh = new THREE.Mesh( geometry, material );
        particle.add( mesh );

        randomPointOnSphere( mesh.position, 4 * Math.random() );
        mesh.rotation.set(
          PI2 * Math.random(),
          PI2 * Math.random(),
          PI2 * Math.random()
        );
        mesh.scale.setLength( THREE.Math.randFloat( 0.5, 1.5 ) );

        particles.push({
          object: particle,
          angularVelocity: new THREE.Vector3(
            THREE.Math.randFloatSpread( 1 ),
            THREE.Math.randFloatSpread( 1 ),
            THREE.Math.randFloatSpread( 1 )
          )
        });
      }

      lights.basic( scene );

      var vector = new THREE.Vector3();

      return {
        group: scene,
        update: function( dt ) {
          group.rotation.x += 0.5 * dt;
          group.rotation.y += dt;

          particles.forEach(function( particle ) {
            vector.copy( particle.object.rotation )
              .addScaledVector( particle.angularVelocity, dt );

            particle.object.rotation.setFromVector3( vector );
          });
        }
      }
    })(),

    gears: (function() {
      var radius = 1.5;

      var gearShape = drawGear( new THREE.Shape(), radius, 8, [
        [ 0.2, radius ],
        [ 0.4, 1.2 * radius ],
        [ 0.6, 1.2 * radius ],
        [ 0.8, radius ]
      ]);

      var hole = new THREE.Shape();
      hole.absarc( 0, 0, 0.5, 0, 2 * Math.PI );
      gearShape.holes.push( hole );

      var gearGeometry = new THREE.ExtrudeGeometry( gearShape, {
        amount: 0.5,
        bevelEnabled: true,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.1,
        bevelSegments: 1
      });

      var gear = new THREE.Mesh( gearGeometry, new THREE.MeshStandardMaterial() );

      var group = new THREE.Group();
      group.add( gear );
      lights.basic( group );

      return {
        group: group,
        update: function( dt ) {
          gear.rotation.z -= dt;
        }
      }
    })()
  };

  var spinner = spinners.gears;

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
