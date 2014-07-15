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

  /**
   * Multiply two complex numbers together (by components).
   *
   *   (a + bi)(c + di) = (ac - bd) + (ad + bc)i
   *
   * This is a 2D rotation in the complex plane:
   *
   *   x * cos - y * sin
   *   x * sin + y * cos
   */
  function muli( r0, i0, r1, i1 ) {
    return {
      real: r0 * r1 - i0 * i1,
      imag: r0 * i1 + i0 * r1
    };
  }

  function polari( real, imag ) {
    return {
      radius: Math.sqrt( real * real + imag * imag ),
      angle: Math.atan2( imag, real )
    };
  }

  /**
   * Roots of complex numbers (fractional exponents):
   *
   * Let z be the complex number a + bi, which has the polar form,
   * r(cos(t) + i * sin(t)). To determine the roots, we use:
   *
   *   z^(1/n) = r^(1/n) * [cos((t + 2PIk) / n) + i * sin((t + 2PIk) / n)]
   *
   * For k in [0, n - 1].
   */
  function powi( real, imag, n, k ) {
    k = k || 0;

    var polar = polari( real, imag );

    var radius = Math.pow( polar.radius, n );
    var angle = ( polar.angle + TAU * k ) * n;

    return  {
      real: radius * Math.cos( angle ),
      imag: radius * Math.sin( angle )
    };
  }

  function expi( real, imag ) {
    var exp = Math.exp( real );

    return {
      real: exp * Math.cos( imag ),
      imag: exp * Math.sin( imag )
    };
  }

  function u0( real, imag ) {
    var a = expi( real, imag ),
        b = expi( -real, -imag );

    a.real = 0.5 * ( a.real + b.real );
    a.imag = 0.5 * ( a.imag + b.imag );

    return a;
  }

  function u1( real, imag ) {
    var a = expi( real, imag ),
        b = expi( -real, -imag );

    a.real = 0.5 * ( a.real - b.real );
    a.imag = 0.5 * ( a.imag - b.imag );

    return a;
  }

  /**
   * Calculate values where:
   *
   *   z0^n + z1^n = 1
   *
   * And:
   *
   *   z0k(a, b, n, k) = exp(2PIik / n) * cosh(a, b)^(2 / n)
   *   z1k(a, b, n, k) = exp(2PIik / n) * sinh(a, b)^(2 / n)
   */
  function z0k( r, i, n, k ) {
    var phase = phaseFactor( k, n );
    var amplitude = Math.pow( cosh( r, i ), 2 / n );

    phase.real *= amplitude;
    phase.imag *= amplitude;

    return phase;
  }

  function z1k( r, i, n, k ) {
    var phase = phaseFactor( k, n );
    var amplitude = Math.pow( sinh( r, i ), 2 / n );

    phase.real *= amplitude;
    phase.imag *= amplitude;

    return phase;
  }

  function calabi( n, alpha, count, rmin, rmax ) {
    var cos = Math.cos( alpha ),
        sin = Math.sin( alpha );

    var dr = ( rmax - rmin ) / ( count - 1 ),
        di = ( 0.5 * Math.PI ) / ( count - 1 );

    var data = new Float32Array( 3 * n * n * count * count );
    var k0, k1;
    var r, i;
    var ir, ii;
    var z0, z1;
    var index = 0;
    for ( k0 = 0; k0 < n; k0++ ) {
      for ( k1 = 0; k1 < n; k1++ ) {
        for ( ir = 0; ir < count; ir++ ) {
          r = rmin + ir * dr;

          for ( ii = 0; ii < count; ii++ ) {
            i = ii * di;

            z0 = z0k( r, i, n, k0 );
            z1 = z1k( r, i, n, k1 );

            data[ index++ ] = z0.real;
            data[ index++ ] = z1.real;
            data[ index++ ] = cos * z0.imag + sin * z1.imag;
          }
        }
      }
    }

    return data;
  }

  function calabiGeometry() {
    var data = calabi( 5, Math.PI / 2, 15, -1, 1 );
    var geometry = new THREE.Geometry();

    for ( var i = 0, il = data.length / 3; i < il; i++ ) {
      geometry.vertices.push(
        new THREE.Vector3( data[i], data[ i + 1 ], data[ i + 2 ] )
      );
    }

    return geometry;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0x222222 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    var geometry = calabiGeometry();
    geometry.computeBoundingSphere();
    camera.position.set( 0, 0, -2 * geometry.boundingSphere.radius );
    camera.lookAt( geometry.boundingSphere.center );

    scene.add( camera );

    var material = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.2
    });

    var mesh = new THREE.Line( geometry, material );
    scene.add( mesh );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();

}) ( window, document );
