/* global THREE */
/* exported translateBoxVertices */
window.translateBoxVertices = (function() {
  'use strict';

  // Vertices.
  // pz-nz order is reversed for the nx side.
  var PX_PY_PZ = 0;
  var PX_PY_NZ = 1;
  var PX_NY_PZ = 2;
  var PX_NY_NZ = 3;
  var NX_PY_NZ = 4;
  var NX_PY_PZ = 5;
  var NX_NY_NZ = 6;
  var NX_NY_PZ = 7;

  // Edges.
  var PX_PY = [ PX_PY_PZ, PX_PY_NZ ];
  var PX_NY = [ PX_NY_PZ, PX_NY_NZ ];
  var NX_PY = [ NX_PY_NZ, NX_PY_PZ ];
  var NX_NY = [ NX_NY_NZ, NX_NY_PZ ];

  var PX_PZ = [ PX_PY_PZ, PX_NY_PZ ];
  var PX_NZ = [ PX_PY_NZ, PX_NY_NZ ];
  var NX_NZ = [ NX_PY_NZ, NX_NY_NZ ];
  var NX_PZ = [ NX_PY_PZ, NX_NY_PZ ];

  var PY_PZ = [ PX_PY_PZ, NX_PY_PZ ];
  var PY_NZ = [ PX_PY_NZ, NX_PY_NZ ];
  var NY_PZ = [ PX_NY_PZ, NX_NY_PZ ];
  var NY_NZ = [ PX_NY_NZ, NX_NY_NZ ];

  // Faces.
  var PX = [].concat( PX_PY, PX_NY );
  var NX = [].concat( NX_PY, NX_NY );
  var PY = [].concat( PX_PY, NX_PY );
  var NY = [].concat( PX_NY, NX_NY );
  var PZ = [].concat( PX_PZ, NX_PZ );
  var NZ = [].concat( PX_NZ, NX_NZ );

  // Vertices.
  // Front-back order is reversed for the left side.
  var RIGHT_TOP_FRONT    = 0;
  var RIGHT_TOP_BACK     = 1;
  var RIGHT_BOTTOM_FRONT = 2;
  var RIGHT_BOTTOM_BACK  = 3;
  var LEFT_TOP_BACK      = 4;
  var LEFT_TOP_FRONT     = 5;
  var LEFT_BOTTOM_BACK   = 6;
  var LEFT_BOTTOM_FRONT  = 7;

  // Edges.
  var RIGHT_TOP    = [ RIGHT_TOP_FRONT, RIGHT_TOP_BACK ];
  var RIGHT_BOTTOM = [ RIGHT_BOTTOM_FRONT, RIGHT_BOTTOM_BACK ];
  var LEFT_TOP     = [ LEFT_TOP_BACK, LEFT_TOP_FRONT ];
  var LEFT_BOTTOM  = [ LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT ];

  var RIGHT_FRONT = [ RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT ];
  var RIGHT_BACK  = [ RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK ];
  var LEFT_FRONT  = [ LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT ];
  var LEFT_BACK   = [ LEFT_TOP_BACK, LEFT_BOTTOM_BACK ];

  var TOP_FRONT    = [ RIGHT_TOP_FRONT, LEFT_TOP_FRONT ];
  var TOP_BACK     = [ RIGHT_TOP_BACK, LEFT_TOP_BACK ];
  var BOTTOM_FRONT = [ RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT ];
  var BOTTOM_BACK  = [ RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK ];

  // Faces.
  var RIGHT  = [].concat( RIGHT_TOP, RIGHT_BOTTOM );
  var LEFT   = [].concat( LEFT_TOP, LEFT_BOTTOM );
  var TOP    = [].concat( RIGHT_TOP, LEFT_TOP );
  var BOTTOM = [].concat( RIGHT_BOTTOM, LEFT_BOTTOM );
  var FRONT  = [].concat( RIGHT_FRONT, LEFT_FRONT );
  var BACK   = [].concat( RIGHT_BACK, LEFT_BACK );

  var Indices = {
    // Vertices.
    PX_PY_PZ: PX_PY_PZ,
    PX_PY_NZ: PX_PY_NZ,
    PX_NY_PZ: PX_NY_PZ,
    PX_NY_NZ: PX_NY_NZ,
    NX_PY_NZ: NX_PY_NZ,
    NX_PY_PZ: NX_PY_PZ,
    NX_NY_NZ: NX_NY_NZ,
    NX_NY_PZ: NX_NY_PZ,

    // Edges.
    PX_PY: PX_PY,
    PX_NY: PX_NY,
    NX_PY: NX_PY,
    NX_NY: NX_NY,

    PX_PZ: PX_PZ,
    PX_NZ: PX_NZ,
    NX_NZ: NX_NZ,
    NX_PZ: NX_PZ,

    PY_PZ: PY_PZ,
    PY_NZ: PY_NZ,
    NY_PZ: NY_PZ,
    NY_NZ: NY_NZ,

    // Faces.
    PX: PX,
    NX: NX,
    PY: PY,
    NY: NY,
    PZ: PZ,
    NZ: NZ,

    // Vertices.
    RIGHT_TOP_FRONT: RIGHT_TOP_FRONT,
    RIGHT_TOP_BACK: RIGHT_TOP_BACK,
    RIGHT_BOTTOM_FRONT: RIGHT_BOTTOM_FRONT,
    RIGHT_BOTTOM_BACK: RIGHT_BOTTOM_BACK,
    LEFT_TOP_BACK: LEFT_TOP_BACK,
    LEFT_TOP_FRONT: LEFT_TOP_FRONT,
    LEFT_BOTTOM_BACK: LEFT_BOTTOM_BACK,
    LEFT_BOTTOM_FRONT: LEFT_BOTTOM_FRONT,

    // Edges.
    RIGHT_TOP: RIGHT_TOP,
    RIGHT_BOTTOM: RIGHT_BOTTOM,
    LEFT_TOP: LEFT_TOP,
    LEFT_BOTTOM: LEFT_BOTTOM,

    RIGHT_FRONT: RIGHT_FRONT,
    RIGHT_BACK: RIGHT_BACK,
    LEFT_BACK: LEFT_BACK,
    LEFT_FRONT: LEFT_FRONT,

    TOP_FRONT: TOP_FRONT,
    TOP_BACK: TOP_BACK,
    BOTTOM_FRONT: BOTTOM_FRONT,
    BOTTOM_BACK: BOTTOM_BACK,

    // Edge aliases.
    TOP_RIGHT: RIGHT_TOP,
    BOTTOM_RIGHT: RIGHT_BOTTOM,
    TOP_LEFT: LEFT_TOP,
    BOTTOM_LEFT: LEFT_BOTTOM,

    FRONT_RIGHT: RIGHT_FRONT,
    BACK_RIGHT: RIGHT_BACK,
    BACK_LEFT: LEFT_BACK,
    FRONT_LEFT: LEFT_FRONT,

    // Faces.
    RIGHT: RIGHT,
    LEFT: LEFT,
    TOP: TOP,
    BOTTOM: BOTTOM,
    FRONT: FRONT,
    BACK: BACK
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
