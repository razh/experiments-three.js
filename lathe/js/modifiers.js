/* global THREE */
/* exported modifiers */
function inverseLerp( a, b, x ) {
  return ( x - a ) / ( b - a );
}

var modifiers = {
  repeat: function( geometry, count, radius ) {
    var group = new THREE.Geometry();

    var angle = 2 * Math.PI / count;
    for ( var i = 0; i <= count; i++ ) {
      var child = new THREE.Geometry().copy( geometry )
        .translate( radius, 0, 0 )
        .rotateZ( i * angle );

      group.merge( child );
    }

    return group;
  },

  extrude: function( geometry, callback ) {
    var keys = [ 'a', 'b', 'c' ];

    for ( var i = 0; i < geometry.faces.length; i++ ) {
      var face = geometry.faces[i];

      for ( var j = 0; j < face.vertexNormals.length; j++ ) {
        var vertex = geometry.vertices[ face[ keys[ j ] ] ];
        var normal = face.vertexNormals[ j ];
        callback( vertex, normal );
      }
    }

    return geometry;
  },

  mirror: function( geometry ) {
    var mirroredGeometry = new THREE.Geometry().copy( geometry );
    mirroredGeometry.merge( mirroredGeometry.clone().scale( 1, 1, -1 ) );
    return mirroredGeometry;
  },

  parametric: function( geometry, callback ) {
    geometry.computeBoundingBox();

    var box = geometry.boundingBox;
    var max = box.max;
    var min = box.min;

    return function( vector ) {
      return callback(
        vector,
        2 * inverseLerp( min.x, max.x, vector.x ) - 1,
        2 * inverseLerp( min.y, max.y, vector.y ) - 1,
        2 * inverseLerp( min.z, max.z, vector.z ) - 1
      );
    };
  }
};
