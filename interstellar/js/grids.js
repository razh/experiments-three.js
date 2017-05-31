/* exported Grid */

const Grid = (() => {
  'use strict';

  function create( options = {}, callback ) {
    const {
      size = 512,
      width = size,
      height = size,

      segments = 2,
      widthSegments = segments,
      heightSegments = segments,

      canvas = document.createElement( 'canvas' ),
    } = options;

    const segmentWidth = width / widthSegments;
    const segmentHeight = height / heightSegments;

    const ctx = canvas.getContext( '2d' );

    canvas.width = width;
    canvas.height = height;

    for ( let y = 0; y < heightSegments; y++ ) {
      for ( let x = 0; x < widthSegments; x++ ) {
        ctx.fillStyle = callback( x, y );
        ctx.fillRect(
          x * segmentWidth,
          y * segmentHeight,
          segmentWidth,
          segmentHeight
        );
      }
    }

    return canvas;
  }

  function checkerboard( options = {} ) {
    const { colors = [] } = options;

    return create( options, ( x, y ) => {
      const index = ( x + y ) % colors.length;
      return colors[ index ];
    });
  }

  return {
    create,
    checkerboard,
  };
})();
