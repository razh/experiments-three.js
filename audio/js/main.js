/*global THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var planeGeometry, planeMaterial, planeMesh;
  var sourceGeometry, sourceMaterial, sourceMesh;

  // Front direction vector used for AudioListener orientation.
  var front = new THREE.Vector3();

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx;

  var listener, panner;

  var osc, lfo, lfoGain, gain;
  var playing = false;

  var A4 = 69;
  var C3 = 48;

  function toFreq( note ) {
    return Math.pow( 2, ( note - A4 ) / 12 ) * 440;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 8, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI / 2 + Math.PI / 16;

    planeGeometry = new THREE.PlaneGeometry( 32, 32 );
    planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    // Sound source mesh.
    sourceGeometry = new THREE.SphereGeometry( 1 );
    sourceMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x555555 });
    sourceMesh = new THREE.Mesh( sourceGeometry, sourceMaterial );
    sourceMesh.position.y = 1;
    scene.add( sourceMesh );

    controls.target.copy( sourceMesh.position );

    // Initialize audio.
    audioCtx = new AudioContext();

    listener = audioCtx.listener;
    panner = audioCtx.createPanner();

    osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = toFreq( C3 );

    lfo = audioCtx.createOscillator();
    lfo.frequency.value = toFreq( 16 );
    lfo.type = 'sine';

    lfoGain = audioCtx.createGain();

    gain = audioCtx.createGain();
    gain.gain.value = 0;

    osc.connect( lfoGain );
    lfo.connect( lfoGain.gain );
    lfoGain.connect( panner );
    panner.connect( gain );
    gain.connect( audioCtx.destination );

    osc.start();
    lfo.start();
  }

  function animate() {
    listener.setPosition(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );

    front.subVectors( controls.target, camera.position )
      .normalize();

    listener.setOrientation(
      front.x,
      front.y,
      front.z,
      camera.up.x,
      camera.up.y,
      camera.up.z
    );

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

  document.addEventListener( 'keydown', function( event ) {
    // Spacebar.
    if ( event.which === 32 ) {
      playing = !playing;

      if ( playing ) {
        gain.gain.setTargetAtTime( 0.2, audioCtx.currentTime, 1 );
      } else {
        gain.gain.setTargetAtTime( 0, audioCtx.currentTime, 1 );
      }
    }
  });

}) ( window, document );
