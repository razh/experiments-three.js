/*global THREE*/
/*exported interpolateCatmullRom*/
// From THREE.Animation.
var interpolateCatmullRom = (function() {
  'use strict';

  var a = new THREE.Vector3();
  var b = new THREE.Vector3();
  var c = new THREE.Vector3();
  var d = new THREE.Vector3();

  return function interpolateCatmullRom( p0, p1, p2, p3, t, output ) {
    var t2 = t * t * 0.5;
    var t3 = t * t2;
    t *= 0.5;

    output = output.set( 0, 0, 0 ) || new THREE.Vector3();

    // Matrix row 1.
    // 0.5 * t^3 * [ ( -1 * p0 ) + ( 3 * p1 ) + ( -3 * p2 ) + p3 ].
    output
      .add( a.copy( p0 ).multiplyScalar( -t3 ) )
      .add( b.copy( p1 ).multiplyScalar( 3 * t3 ) )
      .add( c.copy( p2 ).multiplyScalar( -3 * t3 ) )
      .add( d.copy( p3 ).multiplyScalar( t3 ) );

    // Matrix row 2.
    // 0.5 * t^2 * [ ( 2 * p0 ) + ( -5 * p1 ) + ( 4 * p2 ) - p3 ].
    output
      .add( a.copy( p0 ).multiplyScalar( 2 * t2 ) )
      .add( b.copy( p1 ).multiplyScalar( -5 * t2 ) )
      .add( c.copy( p2 ).multiplyScalar( 4 * t2 ) )
      .add( d.copy( p3 ).multiplyScalar( -t2 ) );

    // Matrix row 3.
    // 0.5 * t * [ ( -1 * p0 ) + p2 ].
    output
      .add( a.copy( p0 ).multiplyScalar( -t ) )
      .add( b.copy( p2 ).multiplyScalar( t ) );

    // Matrix row 4.
    // p1.
    return output.add( p1 );
  };

})();
