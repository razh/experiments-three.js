/* global THREE */
/* exported remove, createVertexHelper, updateGeometry */
function remove( object ) {
  if ( object && object.parent ) {
    object.parent.remove( object );
  }
}


function createVertexHelper( vertex, size ) {
  var vertexHelper = new THREE.Mesh(
    new THREE.BoxBufferGeometry( size, size, size ),
    new THREE.MeshBasicMaterial()
  );

  vertexHelper.position.copy( vertex );
  return vertexHelper;
}

function updateGeometry( geometry ) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  geometry.normalsNeedUpdate = true;
  geometry.verticesNeedUpdate = true;
}
