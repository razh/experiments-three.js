/*globals THREE, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var TAU = 2 * Math.PI;

  var container;

  var scene, camera, renderer;

  // Hyperbolic trigonometric functions.
  // Cached Math.exp(x) is significantly less accurate.
  var cosh = Math.cosh || function cosh( x ) {
    return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
  };

  var sinh = Math.sinh || function sinh( x ){
    return ( Math.exp( x ) - Math.exp( -x ) ) / 2;
  };

  // Trigonometric functions with complex arguments.
  function sini( real, imag ) {
    return {
      real: Math.sin( real ) * cosh( imag ),
      imag: Math.cos( real ) * sinh( imag )
    };
  }

  function cosi( real, imag ) {
    return {
      real:  Math.cos( real ) * cosh( imag ),
      imag: -Math.sin( real ) * sinh( imag )
    };
  }

  /**
   * The phase factor function s(k, n) is defined as:
   *
   *   s(k, n) = exp(2PIik / n)
   *
   * We use Euler's formula to calculate the complex exponential function:
   *
   *   e^ix = cos(x) + i * sin(x)
   *
   * This phase factor represents the nth root of unity for integers
   * 0 <= k <= n - 1.
   */
  function phaseFactor( k, n ) {
    var x = ( TAU * k ) / n;

    return {
      real: Math.cos( x ),
      imag: Math.sin( x )
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
