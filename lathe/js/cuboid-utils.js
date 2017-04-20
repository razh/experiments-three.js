/* global THREE */
/*
exported
remove
round
createVertexHelper
updateGeometry
createTextLabel
*/
'use strict';

function remove( object ) {
  if ( object && object.parent ) {
    object.parent.remove( object );
  }
}

function round( precision ) {
  return number => Number( number.toFixed( precision ) );
}

function createVertexHelper( vertex, size ) {
  const vertexHelper = new THREE.Mesh(
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

function createTextLabel( text, size = 512 ) {
  const canvas = document.createElement( 'canvas' );
  const ctx = canvas.getContext( '2d' );

  canvas.width = size;
  canvas.height = size;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#fff';
  ctx.font = `${ canvas.width }px Menlo, Monaco, monospace`;
  ctx.fillText( text, canvas.width / 2, canvas.height / 2 );

  const texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  return new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );
}
