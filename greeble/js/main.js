/*global THREE*/
(function( window, document, undefined ) {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  // Generic test greebling.
  function greeblerHelper( geometry ) {
    var greebles = greeble( geometry, {
      count: 300,
      fn: function() {
        return new THREE.BoxGeometry(
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 )
        );
      }
    });

    if ( greebles ) {
      geometry.merge( greebles );
    }

    return new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
      color: '#dde',
      specular: '#fff',
      shading: THREE.FlatShading
    }));
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000 );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    // Icosahedron greebled.
    var geometry = new THREE.IcosahedronGeometry( 2, 1 );
    scene.add( greeblerHelper( geometry ) );

    // Plane greebled.
    geometry = new THREE.PlaneGeometry( 16, 16 );
    var mesh = greeblerHelper( geometry );
    mesh.position.y = -3;
    mesh.rotation.x = -Math.PI / 2;
    scene.add( mesh );

    scene.fog = new THREE.FogExp2( '#000', 0.1 );

    var light = new THREE.DirectionalLight( '#e85', 0.5 );
    light.position.set( 1, 1, 0 );
    scene.add( light );

    scene.add( new THREE.AmbientLight( '#325' ) );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  var greeble = (function() {
    var matrix = new THREE.Matrix4();

    var origin = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    return function greeble( geometry, options ) {
      options = options || {};

      var count = options.count;
      var fn = options.fn;


      if ( !count || !fn ) {
        return;
      }

      var greebles = new THREE.Geometry();

      var data = randomPointsNormalsInGeometry( geometry, count );
      var points = data.points;
      var normals = data.normals;

      points.forEach(function( point, index ) {
        var normal = normals[ index ];

        // Get orientation and position.
        matrix.identity()
          .lookAt( origin, normal, up )
          .setPosition( point );

        var tempGeometry = fn();
        tempGeometry.applyMatrix( matrix );
        greebles.merge( tempGeometry );
      });

      return greebles;
    };
  }) ();

  /**
   * Copies of various utility functions from THREE.GeometryUtils.
   *
   * NOTE: THREE.GeometryUtils resides in the three.js extras folder and is not
   * included with the bower distribution.
   */
  var triangleArea = (function() {
    var ab = new THREE.Vector3();
    var ac = new THREE.Vector3();

    return function ( vA, vB, vC ) {
      ab.subVectors( vB, vA );
      ac.subVectors( vC, vA );
      ab.cross( ac );

      return 0.5 * ab.length();
    };
  }) ();

  var randomPointInTriangle = (function() {
    var vector = new THREE.Vector3();

    return function( vA, vB, vC ) {
      var point = new THREE.Vector3();

      var a = THREE.Math.random16();
      var b = THREE.Math.random16();

      if ( ( a + b ) > 1 ) {
        a = 1 - a;
        b = 1 - b;
      }

      var c = 1 - a - b;

      point.copy( vA )
        .multiplyScalar( a );

      vector.copy( vB )
        .multiplyScalar( b );

      point.add( vector );

      vector.copy( vC )
        .multiplyScalar( c );

      point.add( vector );

      return point;
    };
  }) ();

  function randomPointInFace( face, geometry ) {
    var vA, vB, vC;

    vA = geometry.vertices[ face.a ];
    vB = geometry.vertices[ face.b ];
    vC = geometry.vertices[ face.c ];

    return randomPointInTriangle( vA, vB, vC );
  }

  /**
   * Similar to THREE.GeometryUtils.randomPointsInGeometry().
   *
   * Returns an object containing an array of points and an array of
   * corresponding face normals.
   *
   * @param  {THREE.Geometry} geometry
   * @param  {Number} n
   * @return {Object}
   */
  function randomPointsNormalsInGeometry( geometry, n ) {
    var faces = geometry.faces;
    var vertices = geometry.vertices;

    var totalArea = 0;
    var cumulativeAreas = [];

    var vA, vB, vC;

    var face;
    var i, il;
    for ( i = 0, il = faces.length; i < il; i++ ) {
      face = faces[i];

      vA = vertices[ face.a ];
      vB = vertices[ face.b ];
      vC = vertices[ face.c ];

      face._area = triangleArea( vA, vB, vC );

      totalArea += face._area;
      cumulativeAreas[i] = totalArea;
    }

    function binarySearchIndices( value ) {
      function binarySearch( start, end ) {
        if ( end < start ) {
          return start;
        }

        var mid = start + Math.floor( ( end - start ) / 2 );

        if ( cumulativeAreas[ mid ] > value ) {
          return binarySearch( start, mid - 1 );
        } else if ( cumulativeAreas[ mid ] < value ) {
          return binarySearch( mid + 1, end );
        } else {
          return mid;
        }
      }

      var result = binarySearch( 0, cumulativeAreas.length - 1 );
      return result;
    }

    var points = [];
    var normals = [];
    var r, index;
    for ( i = 0; i < n; i++ ) {
      r = THREE.Math.random16() * totalArea;
      index = binarySearchIndices(r);

      face = faces[ index ];
      points[i] = randomPointInFace( face, geometry, true );
      normals[i] = face.normal;
    }

    return {
      points: points,
      normals: normals
    };
  }

  init();
  animate();

}) ( window, document );
