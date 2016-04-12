/* global THREE */
/* exported createLatticeGeometry */
var createLatticeGeometry = (function() {
  'use strict';

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
