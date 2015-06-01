/*exported interpolateCatmullRom*/
// From THREE.Animation.
var interpolateCatmullRom = (function() {
  'use strict';

  function interpolate( p0, p1, p2, p3, t, t2, t3 ) {
    var v0 = ( p2 - p0 ) * 0.5;
    var v1 = ( p3 - p1 ) * 0.5;

    return (
      ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 +
      ( -3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 +
      v0 * t +
      p1
    );
  }

  return function interpolateCatmullRom( points, scale ) {
    var c = [];
    var v3 = [];

    var point, intPoint;
    var weight, w2, w3;
    var pa, pb, pc, pd;

    point = ( points.length - 1 ) * scale;
    intPoint = Math.floor( point );
    weight = point - intPoint;

    c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
    c[ 1 ] = intPoint;
    c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
    c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

    pa = points[ c[ 0 ] ];
    pb = points[ c[ 1 ] ];
    pc = points[ c[ 2 ] ];
    pd = points[ c[ 3 ] ];

    w2 = weight * weight;
    w3 = weight * w2;

    v3[ 0 ] = interpolate( pa[ 0 ], pb[ 0 ], pc[ 0 ], pd[ 0 ], weight, w2, w3 );
    v3[ 1 ] = interpolate( pa[ 1 ], pb[ 1 ], pc[ 1 ], pd[ 1 ], weight, w2, w3 );
    v3[ 2 ] = interpolate( pa[ 2 ], pb[ 2 ], pc[ 2 ], pd[ 2 ], weight, w2, w3 );

    return v3;
  };

})();
