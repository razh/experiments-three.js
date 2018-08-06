/* global THREE */
/* exported greeble */

const greeble = (() => {
  'use strict';

  const triangle = new THREE.Triangle();

  /**
   * Copies of various utility functions from THREE.GeometryUtils.
   *
   * NOTE: THREE.GeometryUtils resides in the three.js extras folder.
   */
  function randomPointInTriangle( vA, vB, vC ) {
    let a = Math.random();
    let b = Math.random();

    if ( ( a + b ) > 1 ) {
      a = 1 - a;
      b = 1 - b;
    }

    const c = 1 - a - b;

    return new THREE.Vector3()
      .addScaledVector( vA, a )
      .addScaledVector( vB, b )
      .addScaledVector( vC, c );
  }

  function randomPointInFace( face, geometry ) {
    const vA = geometry.vertices[ face.a ];
    const vB = geometry.vertices[ face.b ];
    const vC = geometry.vertices[ face.c ];

    return randomPointInTriangle( vA, vB, vC );
  }

  /**
   * Similar to THREE.GeometryUtils.randomPointsInGeometry().
   *
   * Returns an object containing an array of points and an array of
   * corresponding face normals.
   *
   * @param  {THREE.Geometry} geometry
   * @param  {Number} count
   * @return {Object}
   */
  function randomPointsNormalsInGeometry( geometry, count ) {
    const { faces, vertices } = geometry;

    let totalArea = 0;
    const cumulativeAreas = [];

    for ( let i = 0, il = faces.length; i < il; i++ ) {
      const face = faces[i];

      totalArea += triangle
        .setFromPointsAndIndices( vertices, face.a, face.b, face.c )
        .getArea();

      cumulativeAreas[i] = totalArea;
    }

    function binarySearchIndices( value ) {
      function binarySearch( start, end ) {
        if ( end < start ) {
          return start;
        }

        const mid = start + Math.floor( ( end - start ) / 2 );

        if ( cumulativeAreas[ mid ] > value ) {
          return binarySearch( start, mid - 1 );
        } else if ( cumulativeAreas[ mid ] < value ) {
          return binarySearch( mid + 1, end );
        } else {
          return mid;
        }
      }

      return binarySearch( 0, cumulativeAreas.length - 1 );
    }

    const points = [];
    const normals = [];

    for ( let i = 0; i < count; i++ ) {
      const r = Math.random() * totalArea;
      const index = binarySearchIndices(r);

      const face = faces[ index ];
      points[i] = randomPointInFace( face, geometry );
      normals[i] = face.normal;
    }

    return { points, normals };
  }

  const matrix = new THREE.Matrix4();
  const origin = new THREE.Vector3();
  const up = new THREE.Vector3( 0, 1, 0 );

  const emptyGeometry = new THREE.Geometry();

  return function greeble( geometry, {
    count = 0,
    fn = () => emptyGeometry,
  } = {} ) {
    const greebles = new THREE.Geometry();

    const { points, normals } = randomPointsNormalsInGeometry( geometry, count );

    points.forEach(( point, index ) => {
      const normal = normals[ index ];

      // Get orientation and position.
      matrix.identity()
        .lookAt( origin, normal, up )
        .setPosition( point );

      greebles.merge( fn(), matrix );
    });

    return greebles;
  };
})();
