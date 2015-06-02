/*global THREE*/
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

  return function interpolateCatmullRom( points, scale, out ) {
    var point, intPoint;
    var weight, w2, w3;
    var pa, pb, pc, pd;

    point = ( points.length - 1 ) * scale;
    intPoint = Math.floor( point );
    weight = point - intPoint;

    pa = points[ intPoint === 0 ? intPoint : intPoint - 1 ];
    pb = points[ intPoint ];
    pc = points[ intPoint > points.length - 2 ? intPoint : intPoint + 1 ];
    pd = points[ intPoint > points.length - 3 ? intPoint : intPoint + 2 ];

    w2 = weight * weight;
    w3 = weight * w2;

    out = out || new THREE.Vector3();

    return out.set(
      interpolate( pa.x, pb.x, pc.x, pd.x, weight, w2, w3 ),
      interpolate( pa.y, pb.y, pc.y, pd.y, weight, w2, w3 ),
      interpolate( pa.z, pb.z, pc.z, pd.z, weight, w2, w3 )
    );
  };

})();
