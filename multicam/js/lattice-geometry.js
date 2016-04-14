/* global THREE */
/* exported createLatticeGeometry */
var createLatticeGeometry = (function() {
  'use strict';

  /*
    +-------------+
    |      ____   |
    |  |\  \   |  |
    |  | \  \  |  |
    |  |  \  \ |  |
    |  |___\  \|  |
    |             |
    +-------------+
   */
  function drawLatticeGeometry( ctx, options ) {
    var width = options.width || 1;
    var height = options.height || 1;
    var depth = options.depth || 1;
    var thickness = options.thickness || 0.1;

    var innerWidth = width - 2 * thickness;
    var innerHeight = height - 2 * thickness;

    var angle = Math.atan2( innerHeight, innerWidth );

    var dx = thickness * ( 1 + 2 * Math.cos( angle ) );
    var dy = thickness * ( 1 + 2 * Math.sin( angle ) );

    ctx.moveTo( 0, 0 );
    ctx.lineTo( 0, height );
    ctx.lineTo( width, height );
    ctx.lineTo( width, 0 );
    ctx.lineTo( 0, 0 );

    ctx.moveTo( dx, thickness );
    ctx.lineTo( width - thickness, height - dy );
    ctx.lineTo( width - thickness, thickness );
    ctx.lineTo( dx, thickness );

    ctx.moveTo( thickness, dy );
    ctx.lineTo( width - dx, height - thickness );
    ctx.lineTo( thickness, height - thickness );
    ctx.lineTo( thickness, dy );
  }

  return function createLatticeGeometry( options ) {
    var width = options.width || 1;
    var height = options.height || 1;
    var depth = options.depth || 1;
    var thickness = options.thickness || 0.1;

    var innerWidth = width - 2 * thickness;
    var innerHeight = height - 2 * thickness;

    var horizontalGeometry = new THREE.BoxGeometry( width, thickness, depth );
    var verticalGeometry = new THREE.BoxGeometry( thickness, innerHeight, depth );

    var x = ( width - thickness ) / 2;
    var y = ( height - thickness ) / 2;

    var geometry = new THREE.Geometry();

    geometry.merge( verticalGeometry.clone().translate( -x, 0, 0 ) );
    geometry.merge( verticalGeometry.clone().translate( x, 0, 0 ) );
    geometry.merge( horizontalGeometry.clone().translate( 0, y, 0 ) );
    geometry.merge( horizontalGeometry.clone().translate( 0, -y, 0 ) );

    return geometry;
  };

})();
