/* global THREE */
/* exported modifiers */
'use strict';

function inverseLerp( a, b, x ) {
  return ( x - a ) / ( b - a );
}

const modifiers = {
  repeat( geometry, count, radius ) {
    const group = new THREE.Geometry();

    const angle = 2 * Math.PI / count;
    for ( let i = 0; i <= count; i++ ) {
      const child = new THREE.Geometry().copy( geometry )
        .translate( radius, 0, 0 )
        .rotateZ( i * angle );

      group.merge( child );
    }

    return group;
  },

  extrude( geometry, callback ) {
    const keys = [ 'a', 'b', 'c' ];

    for ( let i = 0; i < geometry.faces.length; i++ ) {
      const face = geometry.faces[ i ];

      for ( let j = 0; j < face.vertexNormals.length; j++ ) {
        const vertex = geometry.vertices[ face[ keys[ j ] ] ];
        const normal = face.vertexNormals[ j ];
        callback( vertex, normal );
      }
    }

    return geometry;
  },

  mirror( geometry ) {
    const mirroredGeometry = new THREE.Geometry().copy( geometry );
    mirroredGeometry.merge( mirroredGeometry.clone().scale( 1, 1, -1 ) );
    return mirroredGeometry;
  },

  parametric( geometry, callback ) {
    geometry.computeBoundingBox();

    const { max, min } = geometry.boundingBox;

    return vector => {
      return callback(
        vector,
        2 * inverseLerp( min.x, max.x, vector.x ) - 1,
        2 * inverseLerp( min.y, max.y, vector.y ) - 1,
        2 * inverseLerp( min.z, max.z, vector.z ) - 1
      );
    };
  },
};
