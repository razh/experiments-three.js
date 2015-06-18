/*global THREE*/
/*exported createAnimatedSphereGeometry*/
function createAnimatedSphereGeometry(
  radius,
  widthSegments,
  heightSegments,
  phiStart,
  phiLength,
  thetaStart,
  thetaLength
) {
  'use strict';

  radius = radius || 50;

  widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
  heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

  phiStart = phiStart !== undefined ? phiStart : 0;
  phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

  thetaStart = thetaStart !== undefined ? thetaStart : 0;
  thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

  return function( wt, ht ) {
    wt = THREE.Math.clamp( wt, 0, 1 );
    ht = THREE.Math.clamp( ht, 0, 1 );

    var geometry = new THREE.Geometry();
    geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

    var currentWidthSegments = Math.round( wt * widthSegments );
    var currentHeightSegments = Math.round( ht * heightSegments );

    var x, y;
    var vertices = [];

    for ( y = 0; y <= currentHeightSegments; y++ ) {
      var verticesRow = [];

      for ( x = 0; x <= currentWidthSegments; x++ ) {
        var u = x / widthSegments;
        var v = y / heightSegments;

        var vertex = new THREE.Vector3();
        vertex.x = -radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
        vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
        vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

        geometry.vertices.push( vertex );

        verticesRow.push( geometry.vertices.length - 1 );
      }

      vertices.push( verticesRow );
    }

    for ( y = 0; y < currentHeightSegments; y++ ) {
      for ( x = 0; x < currentWidthSegments; x++ ) {
        var v1 = vertices[ y ][ x + 1 ];
        var v2 = vertices[ y ][ x ];
        var v3 = vertices[ y + 1 ][ x ];
        var v4 = vertices[ y + 1 ][ x + 1 ];

        var n1 = geometry.vertices[ v1 ].clone().normalize();
        var n2 = geometry.vertices[ v2 ].clone().normalize();
        var n3 = geometry.vertices[ v3 ].clone().normalize();
        var n4 = geometry.vertices[ v4 ].clone().normalize();

        if ( Math.abs( geometry.vertices[ v1 ].y ) === radius ) {
          geometry.faces.push( new THREE.Face3( v1, v3, v4, [ n1, n3, n4 ] ) );

        } else if ( Math.abs( geometry.vertices[ v3 ].y ) === radius ) {
          geometry.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );

        } else {
          geometry.faces.push( new THREE.Face3( v1, v2, v4, [ n1, n2, n4 ] ) );
          geometry.faces.push( new THREE.Face3( v2, v3, v4, [ n2.clone(), n3, n4.clone() ] ) );
        }
      }
    }

    return geometry;
  };
}
