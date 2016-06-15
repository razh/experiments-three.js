/* eslint-env es6 */
window.Indices = (function() {
  'use strict';

  // Vertices.
  // pz-nz order is reversed for the nx side.
  const PX_PY_PZ = 0;
  const PX_PY_NZ = 1;
  const PX_NY_PZ = 2;
  const PX_NY_NZ = 3;
  const NX_PY_NZ = 4;
  const NX_PY_PZ = 5;
  const NX_NY_NZ = 6;
  const NX_NY_PZ = 7;

  // Edges.
  const PX_PY = [ PX_PY_PZ, PX_PY_NZ ];
  const PX_NY = [ PX_NY_PZ, PX_NY_NZ ];
  const NX_PY = [ NX_PY_NZ, NX_PY_PZ ];
  const NX_NY = [ NX_NY_NZ, NX_NY_PZ ];

  const PX_PZ = [ PX_PY_PZ, PX_NY_PZ ];
  const PX_NZ = [ PX_PY_NZ, PX_NY_NZ ];
  const NX_NZ = [ NX_PY_NZ, NX_NY_NZ ];
  const NX_PZ = [ NX_PY_PZ, NX_NY_PZ ];

  const PY_PZ = [ PX_PY_PZ, NX_PY_PZ ];
  const PY_NZ = [ PX_PY_NZ, NX_PY_NZ ];
  const NY_PZ = [ PX_NY_PZ, NX_NY_PZ ];
  const NY_NZ = [ PX_NY_NZ, NX_NY_NZ ];

  // Faces.
  const PX = [].concat( PX_PY, PX_NY );
  const NX = [].concat( NX_PY, NX_NY );
  const PY = [].concat( PX_PY, NX_PY );
  const NY = [].concat( PX_NY, NX_NY );
  const PZ = [].concat( PX_PZ, NX_PZ );
  const NZ = [].concat( PX_NZ, NX_NZ );

  // Vertices.
  // Front-back order is reversed for the left side.
  const RIGHT_TOP_FRONT    = 0;
  const RIGHT_TOP_BACK     = 1;
  const RIGHT_BOTTOM_FRONT = 2;
  const RIGHT_BOTTOM_BACK  = 3;
  const LEFT_TOP_BACK      = 4;
  const LEFT_TOP_FRONT     = 5;
  const LEFT_BOTTOM_BACK   = 6;
  const LEFT_BOTTOM_FRONT  = 7;

  // Edges.
  const RIGHT_TOP    = [ RIGHT_TOP_FRONT, RIGHT_TOP_BACK ];
  const RIGHT_BOTTOM = [ RIGHT_BOTTOM_FRONT, RIGHT_BOTTOM_BACK ];
  const LEFT_TOP     = [ LEFT_TOP_BACK, LEFT_TOP_FRONT ];
  const LEFT_BOTTOM  = [ LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT ];

  const RIGHT_FRONT = [ RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT ];
  const RIGHT_BACK  = [ RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK ];
  const LEFT_FRONT  = [ LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT ];
  const LEFT_BACK   = [ LEFT_TOP_BACK, LEFT_BOTTOM_BACK ];

  const TOP_FRONT    = [ RIGHT_TOP_FRONT, LEFT_TOP_FRONT ];
  const TOP_BACK     = [ RIGHT_TOP_BACK, LEFT_TOP_BACK ];
  const BOTTOM_FRONT = [ RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT ];
  const BOTTOM_BACK  = [ RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK ];

  // Faces.
  const RIGHT  = [].concat( RIGHT_TOP, RIGHT_BOTTOM );
  const LEFT   = [].concat( LEFT_TOP, LEFT_BOTTOM );
  const TOP    = [].concat( RIGHT_TOP, LEFT_TOP );
  const BOTTOM = [].concat( RIGHT_BOTTOM, LEFT_BOTTOM );
  const FRONT  = [].concat( RIGHT_FRONT, LEFT_FRONT );
  const BACK   = [].concat( RIGHT_BACK, LEFT_BACK );

  return {
    // Vertices.
    PX_PY_PZ,
    PX_PY_NZ,
    PX_NY_PZ,
    PX_NY_NZ,
    NX_PY_NZ,
    NX_PY_PZ,
    NX_NY_NZ,
    NX_NY_PZ,

    // Edges.
    PX_PY,
    PX_NY,
    NX_PY,
    NX_NY,

    PX_PZ,
    PX_NZ,
    NX_NZ,
    NX_PZ,

    PY_PZ,
    PY_NZ,
    NY_PZ,
    NY_NZ,

    // Faces.
    PX,
    NX,
    PY,
    NY,
    PZ,
    NZ,

    // Vertices.
    RIGHT_TOP_FRONT,
    RIGHT_TOP_BACK,
    RIGHT_BOTTOM_FRONT,
    RIGHT_BOTTOM_BACK,
    LEFT_TOP_BACK,
    LEFT_TOP_FRONT,
    LEFT_BOTTOM_BACK,
    LEFT_BOTTOM_FRONT,

    // Edges.
    RIGHT_TOP,
    RIGHT_BOTTOM,
    LEFT_TOP,
    LEFT_BOTTOM,

    RIGHT_FRONT,
    RIGHT_BACK,
    LEFT_BACK,
    LEFT_FRONT,

    TOP_FRONT,
    TOP_BACK,
    BOTTOM_FRONT,
    BOTTOM_BACK,

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
    RIGHT,
    LEFT,
    TOP,
    BOTTOM,
    FRONT,
    BACK
  };
}());