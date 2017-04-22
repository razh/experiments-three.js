/* global THREE */
/* exported createAnimatedSphereGeometry */

'use strict';

function createAnimatedSphereGeometry(
  radius = 50,
  widthSegments = 8,
  heightSegments = 6,
  phiStart = 0,
  phiLength = Math.PI * 2,
  thetaStart = 0,
  thetaLength = Math.PI
) {
  widthSegments = Math.max( 3, Math.floor( widthSegments ) );
  heightSegments = Math.max( 2, Math.floor( heightSegments ) );

  return ( wt, ht ) => {
    wt = THREE.Math.clamp( wt, 0, 1 );
    ht = THREE.Math.clamp( ht, 0, 1 );

    const geometry = new THREE.Geometry();
    geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

    const currentWidthSegments = Math.round( wt * widthSegments );
    const currentHeightSegments = Math.round( ht * heightSegments );

    const vertices = [];

    for ( let y = 0; y <= currentHeightSegments; y++ ) {
      const verticesRow = [];

      for ( let x = 0; x <= currentWidthSegments; x++ ) {
        const u = x / widthSegments;
        const v = y / heightSegments;

        const vertex = new THREE.Vector3();
        vertex.x = -radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
        vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
        vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

        geometry.vertices.push( vertex );

        verticesRow.push( geometry.vertices.length - 1 );
      }

      vertices.push( verticesRow );
    }

    for ( let y = 0; y < currentHeightSegments; y++ ) {
      for ( let x = 0; x < currentWidthSegments; x++ ) {
        const v1 = vertices[ y ][ x + 1 ];
        const v2 = vertices[ y ][ x ];
        const v3 = vertices[ y + 1 ][ x ];
        const v4 = vertices[ y + 1 ][ x + 1 ];

        const n1 = geometry.vertices[ v1 ].clone().normalize();
        const n2 = geometry.vertices[ v2 ].clone().normalize();
        const n3 = geometry.vertices[ v3 ].clone().normalize();
        const n4 = geometry.vertices[ v4 ].clone().normalize();

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
