/* global THREE */
/* exported interpolateCatmullRom */

// From THREE.Animation.
const interpolateCatmullRom = (() => {
  'use strict';

  return function interpolateCatmullRom( p0, p1, p2, p3, t, output ) {
    t *= 0.5;
    const t2 = t * t;
    const t3 = t * t2;

    output = output.set( 0, 0, 0 ) || new THREE.Vector3();

    // Matrix row 1.
    // 0.5 * t^3 * [ ( -1 * p0 ) + ( 3 * p1 ) + ( -3 * p2 ) + p3 ].
    output
      .addScaledVector( p0, -t3 )
      .addScaledVector( p1, 3 * t3 )
      .addScaledVector( p2, -3 * t3 )
      .addScaledVector( p3, t3 );

    // Matrix row 2.
    // 0.5 * t^2 * [ ( 2 * p0 ) + ( -5 * p1 ) + ( 4 * p2 ) - p3 ].
    output
      .addScaledVector( p0, 2 * t2 )
      .addScaledVector( p1, -5 * t2 )
      .addScaledVector( p2, 4 * t2 )
      .addScaledVector( p3, -t2 );

    // Matrix row 3.
    // 0.5 * t * [ ( -1 * p0 ) + p2 ].
    output
      .addScaledVector( p0, -t )
      .addScaledVector( p2, t );

    // Matrix row 4.
    // p1.
    return output.add( p1 );
  };
})();
