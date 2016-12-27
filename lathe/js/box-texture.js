/* eslint-env es6 */
/* global THREE */

const createBoxTextures = (function() {
  'use strict';

  return function textures(
    keys = [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ],
    size = 512
  ) {
    return keys.map( key => {
      const canvas = document.createElement( 'canvas' );
      const ctx = canvas.getContext( '2d' );

      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#000';
      ctx.fillRect( 0, 0, size, size );

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#fff';
      ctx.font = ( canvas.width / 4 ) + 'px Menlo, Monaco, monospace';
      ctx.fillText( key, canvas.width / 2, canvas.height / 2 );

      const texture = new THREE.Texture( canvas );
      texture.needsUpdate = true;
      return texture;
    });
  };
}());

window.createBoxTextures = createBoxTextures;
