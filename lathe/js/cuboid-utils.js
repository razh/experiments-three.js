/* global THREE */
/*
exported
remove
round
createVertexHelper
updateGeometry
createTextLabel
*/
function remove( object ) {
  if ( object && object.parent ) {
    object.parent.remove( object );
  }
}

function round( precision ) {
  return function( number ) {
    return Number( number.toFixed( precision ) )
  };
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

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

function createTextLabel( text, size ) {
  size = size || 512;

  var canvas = document.createElement( 'canvas' );
  var ctx = canvas.getContext( '2d' );

  canvas.width = size;
  canvas.height = size;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#fff';
  ctx.font = canvas.width + 'px Menlo, Monaco, monospace';
  ctx.fillText( text, canvas.width / 2, canvas.height / 2 );

  var texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  return new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );
}
