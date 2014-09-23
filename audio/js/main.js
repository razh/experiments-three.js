/*global THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var planeGeometry, planeMaterial, planeMesh;

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx;

  var osc, lfo, lfoGain, gain;
  var playing = true;

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
    controls.maxPolarAngle = Math.PI / 2 - Math.PI / 16;

    planeGeometry = new THREE.PlaneGeometry( 32, 32 );
    planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    controls.target.copy( planeMesh.position );

    // Initialize audio.
    audioCtx = new AudioContext();

    osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = toFreq( C3 );

    lfo = audioCtx.createOscillator();
    lfo.frequency.value = toFreq( 16 );
    lfo.type = 'sine';

    lfoGain = audioCtx.createGain();

    gain = audioCtx.createGain();
    gain.gain.value = 0.05;

    osc.connect( lfoGain );
    lfo.connect( lfoGain.gain );
    lfoGain.connect( gain );
    gain.connect( audioCtx.destination );

    osc.start();
    lfo.start();
  }

  function animate() {
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
        gain.gain.setTargetAtTime( 0.05, audioCtx.currentTime, 1 );
      } else {
        gain.gain.setTargetAtTime( 0, audioCtx.currentTime, 1 );

      }
    }
  });

}) ( window, document );
