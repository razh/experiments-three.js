/* global THREE */

(function() {
  'use strict';

  let container;

  let scene, camera, controls, renderer;
  let raycaster;
  let mouse;

  let planeGeometry, planeMaterial, planeMesh;
  let lineGeometry, lineMaterial, lineMesh;

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 16, 32 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enabled = false;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create plane.
    planeGeometry = new THREE.PlaneBufferGeometry( 64, 64 );
    planeGeometry.rotateX( -Math.PI / 2 );

    planeMaterial = new THREE.MeshBasicMaterial({ color: '#333' });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    scene.add( planeMesh );

    // Create line.
    lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( new THREE.Vector3() );
    lineGeometry.vertices.push( new THREE.Vector3() );

    lineMaterial = new THREE.LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
    });
    lineMesh = new THREE.Line( lineGeometry, lineMaterial );
    lineMesh.visible = false;
    scene.add( lineMesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  function onMouse( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObject( planeMesh );
    if ( !intersections.length ) {
      return;
    }

    return intersections[0].point;
  }

  document.addEventListener( 'mousedown', event => {
    if ( controls.enabled ) {
      return;
    }

    const start = onMouse( event );
    if ( start ) {
      lineGeometry.vertices[0].copy( start );
      lineGeometry.vertices[1].copy( start );
      lineGeometry.verticesNeedUpdate = true;
      lineMesh.visible = true;
    }
  });

  document.addEventListener( 'mousemove', event => {
    if ( controls.enabled ) {
      return;
    }

    if ( !lineMesh.visible ) {
      return;
    }

    const end = onMouse( event );
    if ( end ) {
      lineGeometry.vertices[1].copy( end );
      lineGeometry.verticesNeedUpdate = true;
    }
  });

  document.addEventListener( 'mouseup', () => {
    lineMesh.visible = false;
  });

  // Shift toggle OrbitControls.
  document.addEventListener( 'keydown', event => {
    if ( event.keyCode === 16 ) {
      controls.enabled = true;
    }
  });

  document.addEventListener( 'keyup', event => {
    if ( event.keyCode === 16 ) {
      controls.enabled = false;
    }
  });
}());
