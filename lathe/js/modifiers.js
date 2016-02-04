/* global THREE */
/* exported modifiers */
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
  }
};
