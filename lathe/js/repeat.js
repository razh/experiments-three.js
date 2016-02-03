/* global THREE */
/* exported repeatGeometry */
function repeatGeometry( geometry, count, radius ) {
  var group = new THREE.Geometry();

  var angle = 2 * Math.PI / count;
  for ( var i = 0; i <= count; i++ ) {
    var child = new THREE.Geometry().copy( geometry )
      .translate( radius, 0, 0 )
      .rotateZ( i * angle );

    group.merge( child );
  }

  return group;
}
