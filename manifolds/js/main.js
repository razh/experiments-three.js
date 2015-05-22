/*globals THREE, dat*/
(function( window, document, undefined ) {
  'use strict';

  /**
   * Adapted from:
   *
   * A.J. Hanson. A construction for computer visualization of certain complex
   * curves. Notices of the Amer. Math. Soc., 41(9):1156-1163,
   * November/December 1994.
   */
  var TAU = 2 * Math.PI;

  var RAD_TO_DEG = 180 / Math.PI;
  var DEG_TO_RAD = Math.PI / 180;

  var container;

  var scene, camera, controls, renderer;

  var geometry, mesh;
  var axisHelper;

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

    return {
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
   *   z0k(a, b, n, k) = exp(2PIik / n) * cosi(a, b)^(2 / n)
   *   z1k(a, b, n, k) = exp(2PIik / n) * sini(a, b)^(2 / n)
   */
  function z0k( r, i, n, k ) {
    var phase = phaseFactor( k, n );

    var cos = u0( r, i );
    var powcos = powi( cos.real, cos.imag, 2 / n );

    return muli( phase.real, phase.imag, powcos.real, powcos.imag );
  }

  function z1k( r, i, n, k ) {
    var phase = phaseFactor( k, n );

    var sin = u1( r, i );
    var powsin = powi( sin.real, sin.imag, 2 / n );

    return muli( phase.real, phase.imag, powsin.real, powsin.imag );
  }

  function calabi( n, alpha, count, rmin, rmax ) {
    var cos = Math.cos( alpha ),
        sin = Math.sin( alpha );

    var dr = ( rmax - rmin ) / ( count - 1 ),
        di = ( 0.5 * Math.PI ) / ( count - 1 );

    var data = new Float32Array( 3 * n * n * count * count );
    var k0, k1;
    // Real and imaginary values.
    var r, i;
    // Real and imaginary indices.
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

  function calabiGeometry( n, angle, vertexCount ) {
    console.time( 'calabi' );
    var vertices = calabi( n, angle, vertexCount, -1, 1 );
    console.timeEnd( 'calabi' );

    var geometry = new THREE.Geometry();
    for ( var i = 0, il = vertices.length; i < il; i += 3 ) {
      geometry.vertices.push(
        new THREE.Vector3( vertices[i], vertices[ i + 1 ], vertices[ i + 2 ] )
      );
    }

    return geometry;
  }

  function calabiFaces( geometry, n, vertexCount ) {
    // The geometry is composed of n^2 patches, each with m^2 vertices.
    // m is represented by vertexCount. subdivs represents the number of
    // subdivisions along an axis in a patch.
    var patchVertexCount = vertexCount * vertexCount;
    var subdivs = vertexCount - 1;
    var offset;
    var x, y;
    var v0, v1, v2, v3;
    for ( var i = 0, il = n * n; i < il; i++ ) {
      offset = i * patchVertexCount;

      for ( y = 0; y < subdivs; y++ ) {
        for ( x = 0; x < subdivs; x++ ) {
          v0 = y * vertexCount + x;
          v1 = y * vertexCount + ( x + 1 );
          v2 = ( y + 1 ) * vertexCount + x;
          v3 = ( y + 1 ) * vertexCount + ( x + 1 );

          v0 += offset;
          v1 += offset;
          v2 += offset;
          v3 += offset;

          /**
           *   0     1
           *    o---o
           *    | \ |
           *    o---o
           *   2     3
           */
          geometry.faces.push( new THREE.Face3( v0, v2, v3 ) );
          geometry.faces.push( new THREE.Face3( v0, v3, v1 ) );
        }
      }
    }

    return geometry;
  }

  var types = [ 'line', 'point', 'mesh' ];

  var config = {
    n: 5,
    vertexCount: 11,
    angle: Math.PI / 4,
    animateAngle: false,
    type: 'mesh'
  };

  function updateCalabiVertices() {
    var vertices = calabi( config.n, config.angle, config.vertexCount, -1, 1 );

    for ( var i = 0, il = vertices.length / 3; i < il; i++ ) {
      geometry.vertices[i].set(
        vertices[ 3 * i ],
        vertices[ 3 * i + 1 ],
        vertices[ 3 * i + 2 ]
      );
    }

    geometry.verticesNeedUpdate = true;
  }

  function createCalabiGeometry() {
    var geometry = calabiGeometry( config.n, config.angle, config.vertexCount );
    return calabiFaces( geometry, config.n, config.vertexCount );
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0x222222 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    geometry = createCalabiGeometry();
    geometry.computeBoundingSphere();
    camera.position.set( 0, 0, -2 * geometry.boundingSphere.radius );
    camera.lookAt( geometry.boundingSphere.center );
    controls.target.copy( geometry.boundingSphere.center );

    scene.add( camera );

    var constructors = {
      line: THREE.Line,
      point: THREE.PointCloud,
      mesh: THREE.Mesh
    };

    var materials = {
      line: new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.1
      }),

      point: new THREE.PointCloudMaterial({
        fog: true,
        size: 0.02,
        transparent: true,
        opacity: 0.2
      }),

      mesh: new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.2
      })
    };

    mesh = new constructors[ config.type ]( geometry, materials[ config.type ] );
    scene.add( mesh );

    axisHelper = new THREE.AxisHelper( 2 );
    scene.add( axisHelper );

    function createMesh() {
      scene.remove( mesh );
      geometry = createCalabiGeometry();
      mesh = new constructors[ config.type ]( geometry, materials[ config.type ] );
      scene.add( mesh );
    }

    var gui = new dat.GUI();

    gui.add( config, 'angle', 0, TAU )
      .step( Math.PI / 180 )
      .listen()
      .onChange( updateCalabiVertices );

    gui.add( config, 'animateAngle' );

    gui.add( config, 'n', 1, 8 )
      .step( 1 )
      .listen()
      .onChange( createMesh );

    gui.add( config, 'vertexCount', 2, 25 )
      .step( 1 )
      .listen()
      .onChange( createMesh );

    gui.add( config, 'type', types )
      .listen()
      .onChange( createMesh );
  }

  var prevTime = Date.now(),
      currTime;

  function animate() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    renderer.render( scene, camera );
    requestAnimationFrame( animate );

    axisHelper.rotation.copy( mesh.rotation );

    if ( config.animateAngle ) {
      config.angle = ( config.angle + 90 * DEG_TO_RAD * dt ) % TAU;
      updateCalabiVertices();
    }
  }

  init();
  animate();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  });

}) ( window, document );
