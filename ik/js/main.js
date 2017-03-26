/* global THREE */
(function() {
  'use strict';

  let container;

  let scene, camera, renderer;

  let planeGeometry, planeMaterial, plane;
  let sphereGeometry, sphereMaterial, sphere;

  let ikGeometry, ikMaterial, ik;
  let ikLengths = [ 80, 30, 50, 70, 40 ];
  const ikLengthsInput = document.querySelector( '#ik-lengths' );
  ikLengthsInput.value = ikLengths;

  const EPSILON = 1e-2;
  const MAX_ITERATIONS = 32;

  function ikGeometryFromArray( lengths ) {
    const geometry = new THREE.Geometry();

    // Creates a vertical line pointing up from its local origin.
    geometry.vertices.push( new THREE.Vector3() );
    lengths.reduce(( z, length ) => {
      z -= length;
      geometry.vertices.push( new THREE.Vector3( 0, 0, z ) );
      return z;
    }, 0 );

    return geometry;
  }

  function ikSet( target, line, lengths ) {
    const point = new THREE.Vector3().copy( point );

    const geometry = line.geometry;
    const distance = line.position.distanceTo( point );

    const totalLength = lengths.reduce(( sum, length ) => sum + length);

    // Enter line coordinate space.
    point.sub( line.position );

    const vertices = geometry.vertices;
    const count = vertices.length;
    let iterations = 0;
    // Not reachable.
    if ( distance > totalLength ) {
      for ( let i = 0; i < count - 1; i++ ) {
        const vi = vertices[i];
        const vj = vertices[ i + 1 ];

        const di = vi.distanceTo( point );
        const t = lengths[i] / di;

        vj.lerpVectors( vi, point, t );
      }
    }
    // Reachable.
    else {
      const vf = vertices[ count - 1 ];
      let df = vf.distanceTo( point );

      while ( df > EPSILON && iterations < MAX_ITERATIONS ) {
        iterations++;

        // Set end effector to target.
        vf.copy( point );

        // Stage 1: Forward reaching.
        for ( let i = count - 2; i >= 0; i-- ) {
          const vi = vertices[i];
          const vj = vertices[ i + 1 ];

          const dj = vi.distanceTo( vj );
          const t = lengths[i] / dj;

          vi.lerpVectors( vj, vi, t );
        }

        // Move first vertex back to origin.
        vertices[0].set( 0, 0, 0 );

        // Stage 2: Backward reaching.
        for ( let i = 0; i < count - 1; i++ ) {
          const vi = vertices[i];
          const vj = vertices[ i + 1 ];

          const dj = vi.distanceTo( vj );
          const t = lengths[i] / dj;

          vj.lerpVectors( vi, vj, t );
        }

        df = vf.distanceTo( point );
      }
    }

    line.geometry.verticesNeedUpdate = true;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.set( 0, -400, 200 );
    camera.rotation.x = THREE.Math.degToRad( 60 );

    scene.add( camera );

    // Fog.
    scene.fog = new THREE.Fog( 0x000000 );

    // Plane.
    planeGeometry = new THREE.PlaneBufferGeometry( 500, 500, 20, 20 );
    planeMaterial = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    scene.add( plane );

    // Sphere.
    sphereGeometry = new THREE.SphereBufferGeometry( 10 );
    sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    });
    sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    scene.add( sphere );

    // IK.
    ikGeometry = ikGeometryFromArray( ikLengths );
    ikMaterial = new THREE.LineBasicMaterial({
      color: '#f43',
      linewidth: 5
    });
    ik = new THREE.Line( ikGeometry, ikMaterial );
    ik.position.z = 100;
    scene.add( ik );
  }

  function animate() {
    renderer.render( scene, camera );
  }

  init();
  animate();


  function onMove( x, y ) {
    // Calculate intersection.
    const vector = new THREE.Vector3(
      ( x / window.innerWidth ) * 2 - 1,
      -( y / window.innerHeight ) * 2 + 1,
      0
    );

    vector.unproject( camera );

    const raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub( camera.position ).normalize()
    );

    const intersections = raycaster.intersectObject( plane );
    if ( intersections[0] ) {
      sphere.position.copy( intersections[0].point );
      ikSet( sphere.position, ik, ikLengths );
    }

    requestAnimationFrame( animate );
  }

  window.addEventListener( 'mousemove', event => {
    onMove( event.pageX, event.pageY );
  });

  window.addEventListener( 'touchmove', event => {
    event.preventDefault();
    onMove( event.touches[0].pageX, event.touches[0].pageY );
  });

  window.addEventListener( 'wheel', event => {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    plane.position.z += event.deltaY;
    sphere.position.z = plane.position.z;
    ikSet( sphere.position, ik, ikLengths );

    requestAnimationFrame( animate );
  });

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    requestAnimationFrame( animate );
  });

  ikLengthsInput.addEventListener( 'input', () => {
    const lengths = ikLengthsInput.value
      .split( ',' )
      .map( parseFloat )
      .filter( value => value && isFinite( value ) );

    if ( !lengths.length ) {
      return;
    }

    scene.remove( ik );

    ikLengths = lengths;
    ikGeometry = ikGeometryFromArray( lengths );
    ik = new THREE.Line( ikGeometry, ikMaterial );
    ik.position.z = 100;

    scene.add( ik );
    requestAnimationFrame( animate );
  });
}());
