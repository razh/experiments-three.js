/*globals THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, renderer;

  // Hyperbolic trigonometric functions.
  // Cached Math.exp(x) is significantly less accurate.
  function cosh( x ) {
    return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
  }

  function sinh( x ){
    return ( Math.exp( x ) - Math.exp( -x ) ) / 2;
  }

  // Trigonometric functions with complex arguments.
  function sini( real, imag ) {
    return {
      real: Math.sin( real ) * cosh( imag ),
      imag: Math.cos( real ) * sinh( imag )
    };
  }

  function sini( real, imag ) {
    return {
      real:  Math.cos( real ) * cosh( imag ),
      imag: -Math.sin( real ) * sinh( imag )
    };
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
