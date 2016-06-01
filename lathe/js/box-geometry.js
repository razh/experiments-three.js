/* global THREE */
/* exported translateBoxVertices */
window.translateBoxVertices = (function() {
  'use strict';

  // Vertices.
  // Back-front order is reversed for the left side.
  var RIGHT_TOP_BACK     = 0;
  var RIGHT_TOP_FRONT    = 1;
  var RIGHT_BOTTOM_BACK  = 2;
  var RIGHT_BOTTOM_FRONT = 3;
  var LEFT_TOP_FRONT     = 4;
  var LEFT_TOP_BACK      = 5;
  var LEFT_BOTTOM_FRONT  = 6;
  var LEFT_BOTTOM_BACK   = 7;

  // Edges.
  var RIGHT_TOP    = [ RIGHT_TOP_BACK, RIGHT_TOP_FRONT ];
  var RIGHT_BOTTOM = [ RIGHT_BOTTOM_BACK, RIGHT_BOTTOM_FRONT ];
  var LEFT_TOP     = [ LEFT_TOP_BACK, LEFT_TOP_FRONT ];
  var LEFT_BOTTOM  = [ LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT ];

  var RIGHT_BACK  = [ RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK ];
  var RIGHT_FRONT = [ RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT ];
  var LEFT_FRONT  = [ LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT ];
  var LEFT_BACK   = [ LEFT_TOP_BACK, LEFT_BOTTOM_BACK ];

  var TOP_BACK     = [ RIGHT_TOP_BACK, LEFT_TOP_BACK ];
  var TOP_FRONT    = [ RIGHT_TOP_FRONT, LEFT_TOP_FRONT ];
  var BOTTOM_BACK  = [ RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK ];
  var BOTTOM_FRONT = [ RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT ];

  // Aliases for more idiomatic orderings.
  var TOP_RIGHT = RIGHT_TOP;
  var BOTTOM_RIGHT = RIGHT_BOTTOM;
  var TOP_LEFT = LEFT_TOP;
  var BOTTOM_LEFT = LEFT_BOTTOM;

  var BACK_RIGHT = RIGHT_BACK;
  var FRONT_RIGHT = RIGHT_FRONT;
  var FRONT_LEFT = LEFT_FRONT;
  var BACK_LEFT = LEFT_BACK;

  // Faces.
  var RIGHT  = [].concat( RIGHT_TOP, RIGHT_BOTTOM );
  var LEFT   = [].concat( LEFT_TOP, LEFT_BOTTOM );
  var TOP    = [].concat( RIGHT_TOP, LEFT_TOP );
  var BOTTOM = [].concat( RIGHT_BOTTOM, LEFT_BOTTOM );
  var BACK   = [].concat( RIGHT_BACK, LEFT_BACK );
  var FRONT  = [].concat( RIGHT_FRONT, LEFT_FRONT );

  var Indices = {
    // Vertices.
    RIGHT_TOP_BACK: RIGHT_TOP_BACK,
    RIGHT_TOP_FRONT: RIGHT_TOP_FRONT,
    RIGHT_BOTTOM_BACK: RIGHT_BOTTOM_BACK,
    RIGHT_BOTTOM_FRONT: RIGHT_BOTTOM_FRONT,
    LEFT_TOP_FRONT: LEFT_TOP_FRONT,
    LEFT_TOP_BACK: LEFT_TOP_BACK,
    LEFT_BOTTOM_FRONT: LEFT_BOTTOM_FRONT,
    LEFT_BOTTOM_BACK: LEFT_BOTTOM_BACK,

    // Edges.
    RIGHT_TOP: RIGHT_TOP,
    RIGHT_BOTTOM: RIGHT_BOTTOM,
    LEFT_TOP: LEFT_TOP,
    LEFT_BOTTOM: LEFT_BOTTOM,
    RIGHT_BACK: RIGHT_BACK,
    RIGHT_FRONT: RIGHT_FRONT,
    LEFT_FRONT: LEFT_FRONT,
    LEFT_BACK: LEFT_BACK,
    TOP_BACK: TOP_BACK,
    TOP_FRONT: TOP_FRONT,
    BOTTOM_BACK: BOTTOM_BACK,
    BOTTOM_FRONT: BOTTOM_FRONT,

    TOP_RIGHT: TOP_RIGHT,
    BOTTOM_RIGHT: BOTTOM_RIGHT,
    TOP_LEFT: TOP_LEFT,
    BOTTOM_LEFT: BOTTOM_LEFT,
    BACK_RIGHT: BACK_RIGHT,
    FRONT_RIGHT: FRONT_RIGHT,
    FRONT_LEFT: FRONT_LEFT,
    BACK_LEFT: BACK_LEFT,

    // Faces.
    RIGHT: RIGHT,
    LEFT: LEFT,
    TOP: TOP,
    BOTTOM: BOTTOM,
    BACK: BACK,
    FRONT: FRONT
  };

  var vector = new THREE.Vector3();
  var zero = new THREE.Vector3();

  return function translate( geometry, vectors ) {
    Object.keys( vectors ).forEach(function( key ) {
      var delta = vectors[ key ];
      var indices = Indices[ key.toUpperCase() ];

      if ( Array.isArray( delta ) ) {
        vector.fromArray( delta );
      } else if ( typeof delta === 'object' ) {
        Object.assign( vector, zero, delta );
      } else if ( typeof delta === 'number' ) {
        vector.setScalar( delta );
      } else {
        return;
      }

      if ( Array.isArray( indices ) ) {
        indices.forEach(function( index ) {
          geometry.vertices[ index ].add( vector );
        });
      } else {
        geometry.vertices[ indices ].add( vector );
      }
    });

    return geometry;
  }
}());
