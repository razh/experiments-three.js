/*globals THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, renderer;
  var projector;

  var planeGeometry, planeMaterial, plane;
  var sphereGeometry, sphereMaterial, sphere;

  var ikGeometry, ikMaterial, ik;
  var ikLengths = [ 80, 30, 50, 70, 40 ];

  var EPSILON = 1e-2;

  function ikGeometryFromArray( lengths ) {
    var geometry = new THREE.Geometry();

    // Creates a vertical line pointing up from its local origin.
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    lengths.reduce(function( z, length ) {
      z -= length;
      geometry.vertices.push( new THREE.Vector3( 0, 0, z ) );
      return z;
    }, 0 );

    return geometry;
  }

  function ikSet( point, line, lengths ) {
    point = new THREE.Vector3().copy( point );

    var geometry = line.geometry;
    var distance = line.position.distanceTo( point );

    var totalLength = lengths.reduce(function( sum, length ) {
      return sum + length;
    });

    // Enter line coordinate space.
    point.sub( line.position );

    var vertices = geometry.vertices;
    var count = vertices.length;
    var temp = new THREE.Vector3();
    var vi, vj, vf;
    var di, dj, df;
    var t;
    var i, il;
    // Not reachable.
    if ( distance > totalLength ) {
      for ( i = 0, il = count - 1; i < il; i++ ) {
        vi = vertices[i];
        vj = vertices[ i + 1 ];

        di = vi.distanceTo( point );
        t = lengths[i] / di;

        temp.copy( vi ).lerp( point, t );
        vj.copy( temp );
      }
    }
    // Reachable.
    else {
      vf = vertices[ count - 1 ];
      df = vf.distanceTo( point );

      while ( df > EPSILON ) {
        vf.copy( point );

        // Stage 1: Forward reaching.
        for ( i = count - 2; i >= 0; i-- ) {
          vi = vertices[i];
          vj = vertices[ i + 1 ];

          dj = vi.distanceTo( vj );
          t = lengths[i] / dj;

          temp.copy( vj ).lerp( vi, t );
          vi.copy( temp );
        }

        vi = vertices[0];
        vi.set( 0, 0, 0 );

        // Stage 2: Backward reaching.
        for ( i = 0; i < count - 1; i++ ) {
          vi = vertices[i];
          vj = vertices[ i + 1 ];

          dj = vi.distanceTo( vj );
          t = lengths[i] / dj;

          temp.copy( vi ).lerp( vj, t );
          vj.copy( temp );
        }

        df = vf.distanceTo( point );
      }
    }

    ik.geometry.verticesNeedUpdate = true;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.set( 0, -400, 200 );
    camera.rotation.x = THREE.Math.degToRad( 60 );

    scene.add( camera );

    // Projector.
    projector = new THREE.Projector();

    // Plane.
    planeGeometry = new THREE.PlaneGeometry( 500, 500, 20, 20 );
    planeMaterial = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    scene.add( plane );

    // Sphere.
    sphereGeometry = new THREE.SphereGeometry( 10 );
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
    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'mousemove', function( event ) {
    // Calculate intersection.
    var vector = new THREE.Vector3(
      ( event.pageX / window.innerWidth ) * 2 - 1,
      -( event.pageY / window.innerHeight ) * 2 + 1,
      0
    );

    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub( camera.position ).normalize()
    );

    var intersections = raycaster.intersectObject( plane );
    if ( intersections[0] ) {
      sphere.position.copy( intersections[0].point );
      ikSet( sphere.position, ik, ikLengths );
    }
  });

  window.addEventListener( 'wheel', function( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    plane.position.z += event.deltaY;
    sphere.position.z = plane.position.z;
    ikSet( sphere.position, ik, ikLengths );
  });

}) ( window, document );
