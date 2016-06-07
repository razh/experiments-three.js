/* global THREE */
/* exported createBoxTextures */
function createBoxTextures( keys, size ) {
  keys = keys || [ 'right', 'left', 'top', 'bottom', 'back', 'front' ];
  size = size || 512;

  return keys.map(function( key )  {
    var canvas = document.createElement( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#000'
    ctx.fillRect( 0, 0, size, size );

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#fff';
    ctx.font = ( canvas.width / 4 ) + 'px Menlo, Monaco, monospace';
    ctx.fillText( key, canvas.width / 2, canvas.height / 2 );

    var texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;
    return texture;
  });
}
