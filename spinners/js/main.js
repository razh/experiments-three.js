/* global THREE, drawGear, drawLineCurveCircle */

(() => {
  'use strict';

  let container;

  let scene, camera, controls, renderer;

  const clock = new THREE.Clock();
  let running = true;

  const dt = 1 / 60;
  let accumulatedTime = 0;

  const lights = {
    basic( scene ) {
      const light = new THREE.DirectionalLight();
      light.position.set( 0, 8, 16 );
      scene.add( light );

      scene.add( new THREE.AmbientLight( '#222' ) );
    },
  };

  const spinners = {
    circles: (() => {
      const geometry = new THREE.BoxGeometry( 1, 1, 1 );
      const material = new THREE.MeshPhongMaterial();

      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = 2;

      const group = new THREE.Group();
      group.add( mesh );

      lights.basic( group );

      return {
        group,
        update( dt ) {
          mesh.rotation.x += 5 * dt;
          mesh.rotation.y += 5 * dt;
          group.rotation.y += 5 * dt;
        },
      };
    })(),

    loops: (() => {
      const radius = 0.1;
      const diameter = 2 * radius;

      const group = new THREE.Group();
      const meshes = new THREE.Group();

      let parent = meshes;
      const count = 8;
      let i = count;
      while ( i-- ) {
        const scale = i * diameter + 2;

        const geometry = new THREE.TorusGeometry( scale, radius, 16, 64 );
        const material = new THREE.MeshPhongMaterial({
          color: `hsl(${( i * 360 / count )}, 100%, 50%)`,
        });

        const mesh = new THREE.Mesh( geometry, material );
        parent.add( mesh );
        parent = mesh;
      }

      group.add( meshes );

      lights.basic( group );

      return {
        group,
        update( dt ) {
          meshes.traverse( mesh => {
            if (!mesh.geometry) {
              return;
            }

            mesh.rotation.x += dt;
            mesh.rotation.y += dt;
          });
        },
      };
    })(),

    particles: (() => {
      const PI2 = 2 * Math.PI;

      function randomPointOnSphere( vector, radius = 1 ) {
        const theta = PI2 * Math.random();
        const u = 2 * Math.random() - 1;
        const v = Math.sqrt( 1 - u * u );

        return vector.set(
          radius * v * Math.cos( theta ),
          radius * v * Math.sin( theta ),
          radius * u
        );
      }

      const size = 0.1;

      const geometry = new THREE.BufferGeometry()
        .fromGeometry( new THREE.BoxGeometry( size, size, size ) );

      const material = new THREE.MeshPhongMaterial();

      const scene = new THREE.Group();
      const group = new THREE.Group();
      scene.add( group );

      const particles = [];

      const count = 512;
      let i = count;
      while ( i-- ) {
        const particle = new THREE.Object3D();
        group.add( particle );

        const mesh = new THREE.Mesh( geometry, material );
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
          ),
        });
      }

      lights.basic( scene );

      const vector = new THREE.Vector3();

      return {
        group: scene,
        update( dt ) {
          group.rotation.x += 0.5 * dt;
          group.rotation.y += dt;

          particles.forEach( particle => {
            vector.copy( particle.object.rotation )
              .addScaledVector( particle.angularVelocity, dt );

            particle.object.rotation.setFromVector3( vector );
          });
        },
      };
    })(),

    gears: (() => {
      const sunRadius = 2;
      const planetRadius = 1.5;
      const toothHeight = 0.2 * planetRadius;

      const sunTeethCount = 12;
      const planetTeethCount = 8;
      const annulusTeethCount = sunTeethCount + 2 * planetTeethCount;

      const bevelSize = 0.1;
      const planetPosition = planetRadius + sunRadius + toothHeight + 2 * bevelSize;
      const annulusRadius = planetPosition + planetRadius + toothHeight + 2 * bevelSize;

      const annulusGearShape = drawLineCurveCircle(
        new THREE.Shape(),
        annulusRadius + toothHeight,
        2 * annulusTeethCount
      );

      const annulusHole = drawGear( new THREE.Shape(), annulusRadius, annulusTeethCount, [
        [ 0.2, annulusRadius ],
        [ 0.4, annulusRadius - toothHeight ],
        [ 0.6, annulusRadius - toothHeight ],
        [ 0.8, annulusRadius ],
      ]);

      annulusGearShape.holes.push( annulusHole );

      const hole = drawLineCurveCircle(
        new THREE.Shape(),
        0.4 * planetRadius,
        2 * annulusTeethCount
      );

      const sunGearShape = drawGear( new THREE.Shape(), sunRadius, sunTeethCount, [
        [ 0.2, sunRadius ],
        [ 0.4, sunRadius + toothHeight ],
        [ 0.6, sunRadius + toothHeight ],
        [ 0.8, sunRadius ],
      ]);

      sunGearShape.holes.push( hole );

      const planetGearShape = drawGear( new THREE.Shape(), planetRadius, planetTeethCount, [
        [ 0.2, planetRadius ],
        [ 0.4, planetRadius + toothHeight ],
        [ 0.6, planetRadius + toothHeight ],
        [ 0.8, planetRadius ],
      ]);

      planetGearShape.holes.push( hole );

      const extrudeOptions = {
        amount: 0.5,
        curveSegments: 2 * annulusTeethCount,
        bevelEnabled: true,
        steps: 1,
        bevelSize: bevelSize,
        bevelThickness: 0.1,
        bevelSegments: 1,
      };

      const annulusGearGeometry = new THREE.ExtrudeGeometry( annulusGearShape, extrudeOptions );
      const sunGearGeometry = new THREE.ExtrudeGeometry( sunGearShape, extrudeOptions );
      const planetGearGeometry = new THREE.ExtrudeGeometry( planetGearShape, extrudeOptions );

      const material = new THREE.MeshStandardMaterial();

      const annulusGear = new THREE.Mesh( annulusGearGeometry, material );
      const sunGear = new THREE.Mesh( sunGearGeometry, material );
      const topPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      const leftPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      const rightPlanetGear = new THREE.Mesh( planetGearGeometry, material );
      const bottomPlanetGear = new THREE.Mesh( planetGearGeometry, material );

      topPlanetGear.position.y = planetPosition;
      leftPlanetGear.position.x = planetPosition;
      rightPlanetGear.position.x = -planetPosition;
      bottomPlanetGear.position.y = -planetPosition;

      // Shift by half a tooth width.
      annulusGear.rotation.z += Math.PI / annulusTeethCount;
      sunGear.rotation.z += Math.PI / sunTeethCount;

      const group = new THREE.Group();
      group.add( annulusGear );
      group.add( sunGear );
      group.add( topPlanetGear );
      group.add( leftPlanetGear );
      group.add( rightPlanetGear );
      group.add( bottomPlanetGear );
      lights.basic( group );

      return {
        group,
        update( dt ) {
          annulusGear.rotation.z -= planetTeethCount / annulusTeethCount * dt;
          sunGear.rotation.z += planetTeethCount / sunTeethCount * dt;
          topPlanetGear.rotation.z -= dt;
          leftPlanetGear.rotation.z -= dt;
          rightPlanetGear.rotation.z -= dt;
          bottomPlanetGear.rotation.z -= dt;
        },
      };
    })(),
  };

  const query = window.location.search.substring(1);
  const spinner = spinners[ query ] || spinners.gears;

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

    controls.addEventListener( 'change', () => {
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

    const delta = Math.min( clock.getDelta(), 0.1 );
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

  window.addEventListener( 'resize', () => {
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

  document.addEventListener( 'keydown', event => {
    // Space.
    if ( event.keyCode === 32 ) {
      toggle();
    }

    if ( event.keyCode === 16 ) {
      toggleZoom();
    }
  });

  document.addEventListener( 'keyup', event => {
    if ( event.keyCode === 16 ) {
      toggleZoom();
    }
  });

  // Double click to restart animation.
  document.addEventListener( 'dblclick', toggle );

  controls.enableZoom = false;
  renderer.domElement.addEventListener( 'wheel', onWheel );
})();
