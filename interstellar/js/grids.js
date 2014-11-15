/*exported Grid*/
var Grid = (function() {
  'use strict';

  function create( options, callback ) {
    options = options || {};

    var size = options.size || 512;
    var width = options.width || size;
    var height = options.height || size;

    var segments = options.segments || 2;
    var widthSegments = options.widthSegments || segments;
    var heightSegments = options.heightSegments || segments;

    var segmentWidth = width / widthSegments;
    var segmentHeight = height / heightSegments;

    var canvas = options.canvas || document.createElement( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    canvas.width = width;
    canvas.height = height;

    var x, y;
    for ( y = 0; y < widthSegments; y++ ) {
      for ( x = 0; x < heightSegments; x++ ) {
        ctx.fillStyle = callback( x, y );
        ctx.fillRect(
          x * segmentWidth, y * segmentHeight,
          segmentWidth, segmentHeight
        );
      }
    }

    return canvas;
  }

  function checkerboard( options ) {
    var colors = options.colors || [];
    return create( options, function( x, y ) {
      var index = ( x + y ) % colors.length;
      return colors[ index ];
    });
  }

  return {
    create: create,
    checkerboard: checkerboard
  };

}) ();
