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
      var sunRadius = 2;
      var planetRadius = 1.5;
      var toothHeight = 0.2 * planetRadius;

      var sunTeethCount = 12;
      var planetTeethCount = 8;
      var annulusTeethCount = sunTeethCount + 2 * planetTeethCount;

      var bevelSize = 0.1;
      var planetPosition = planetRadius + sunRadius + toothHeight + 2 * bevelSize;
      var annulusRadius = planetPosition + planetRadius + toothHeight + 2 * bevelSize;

      var annulusGearShape = new THREE.Shape();
      annulusGearShape.absarc( 0, 0, annulusRadius + toothHeight, 0, 2 * Math.PI );

      var annulusHole = drawGear( new THREE.Shape(), annulusRadius, annulusTeethCount, [
        [ 0.2, annulusRadius ],
        [ 0.4, annulusRadius - toothHeight ],
        [ 0.6, annulusRadius - toothHeight ],
        [ 0.8, annulusRadius ]
      ]);

      annulusGearShape.holes.push( annulusHole );

      var hole = new THREE.Shape();
      hole.absarc( 0, 0, 0.4 * planetRadius, 0, 2 * Math.PI );

      var sunGearShape = drawGear( new THREE.Shape(), sunRadius, sunTeethCount, [
        [ 0.2, sunRadius ],
        [ 0.4, sunRadius + toothHeight ],
        [ 0.6, sunRadius + toothHeight ],
        [ 0.8, sunRadius ]
      ]);

      sunGearShape.holes.push( hole );

      var planetGearShape = drawGear( new THREE.Shape(), planetRadius, planetTeethCount, [
        [ 0.2, planetRadius ],
        [ 0.4, planetRadius + toothHeight ],
        [ 0.6, planetRadius + toothHeight ],
        [ 0.8, planetRadius ]
      ]);

      planetGearShape.holes.push( hole );

      var extrudeOptions = {
        amount: 0.5,
        curveSegments: 2 * annulusTeethCount,
        bevelEnabled: true,
        steps: 1,
        bevelSize: bevelSize,
        bevelThickness: 0.1,
        bevelSegments: 1
      };

      var annulusGearGeometry = new THREE.ExtrudeGeometry( annulusGearShape, extrudeOptions );
      var sunGearGeometry = new THREE.ExtrudeGeometry( sunGearShape, extrudeOptions );
      var planetGearGeometry = new THREE.ExtrudeGeometry( planetGearShape, extrudeOptions );

      var material = new THREE.MeshStandardMaterial();

      var annulusGear = new THREE.Mesh( annulusGearGeometry, material );
      var sunGear = new THREE.Mesh( sunGearGeometry, material );
      var topPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      var leftPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      var rightPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      var bottomPlanetGear = new THREE.Mesh( planetGearGeometry, material );

      topPlanetGear.position.y = planetPosition;
      leftPlanetGear.position.x = planetPosition;
      rightPlanetGear.position.x = -planetPosition;
      bottomPlanetGear.position.y = -planetPosition;

      // Shift by half a tooth width.
      annulusGear.rotation.z += Math.PI / annulusTeethCount;
      sunGear.rotation.z += Math.PI / sunTeethCount;

      var group = new THREE.Group();
      group.add( annulusGear );
      group.add( sunGear );
      group.add( topPlanetGear );
      group.add( leftPlanetGear );
      group.add( rightPlanetGear );
      group.add( bottomPlanetGear );
      lights.basic( group );

      return {
        group: group,
        update: function( dt ) {
          annulusGear.rotation.z -= planetTeethCount / annulusTeethCount * dt;
          sunGear.rotation.z += planetTeethCount / sunTeethCount * dt;
          topPlanetGear.rotation.z -= dt;
          leftPlanetGear.rotation.z -= dt;
          rightPlanetGear.rotation.z -= dt;
          bottomPlanetGear.rotation.z -= dt;
        }
      }
    })()
  };

  var query = window.location.search.substring(1);
  var spinner = spinners[ query ] || spinners.gears;

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

  function toggle() {
    running = !running;

    if ( running ) {
      clock.start();
      animate();
    }
  }

  // Scroll to control animation.
  function onWheel( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    running = false;

    spinner.update( event.deltaY * dt );
    render();
  }

  function toggleZoom() {
    controls.enableZoom = !controls.enableZoom;

    // Need to remove/add wheel event-listener for events to propagate to
    // OrbitControls.
    if ( controls.enableZoom ) {
      renderer.domElement.removeEventListener( 'wheel', onWheel );
    } else {
      renderer.domElement.addEventListener( 'wheel', onWheel );
    }
  }

  document.addEventListener( 'keydown', function( event ) {
    // Space.
    if ( event.keyCode === 32 ) {
      toggle();
    }

    if ( event.keyCode === 16 ) {
      toggleZoom();
    }
  });

  document.addEventListener( 'keyup', function( event ) {
    if ( event.keyCode === 16 ) {
      toggleZoom();
    }
  })

  // Double click to restart animation.
  document.addEventListener( 'dblclick', toggle );

  controls.enableZoom = false;
  renderer.domElement.addEventListener( 'wheel', onWheel );
})();
