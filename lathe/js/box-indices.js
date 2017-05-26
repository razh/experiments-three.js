const VertexIndices = (function() {
  'use strict';

  // Vertices.
  // pz-nz order is reversed for the nx side.
  const PX_PY_PZ = [ 0 ];
  const PX_PY_NZ = [ 1 ];
  const PX_NY_PZ = [ 2 ];
  const PX_NY_NZ = [ 3 ];
  const NX_PY_NZ = [ 4 ];
  const NX_PY_PZ = [ 5 ];
  const NX_NY_NZ = [ 6 ];
  const NX_NY_PZ = [ 7 ];

  // Edges.
  const PX_PY = [].concat( PX_PY_PZ, PX_PY_NZ );
  const PX_NY = [].concat( PX_NY_PZ, PX_NY_NZ );
  const NX_PY = [].concat( NX_PY_NZ, NX_PY_PZ );
  const NX_NY = [].concat( NX_NY_NZ, NX_NY_PZ );

  const PX_PZ = [].concat( PX_PY_PZ, PX_NY_PZ );
  const PX_NZ = [].concat( PX_PY_NZ, PX_NY_NZ );
  const NX_NZ = [].concat( NX_PY_NZ, NX_NY_NZ );
  const NX_PZ = [].concat( NX_PY_PZ, NX_NY_PZ );

  const PY_PZ = [].concat( PX_PY_PZ, NX_PY_PZ );
  const PY_NZ = [].concat( PX_PY_NZ, NX_PY_NZ );
  const NY_PZ = [].concat( PX_NY_PZ, NX_NY_PZ );
  const NY_NZ = [].concat( PX_NY_NZ, NX_NY_NZ );

  // Faces.
  const PX = [].concat( PX_PY, PX_NY );
  const NX = [].concat( NX_PY, NX_NY );
  const PY = [].concat( PX_PY, NX_PY );
  const NY = [].concat( PX_NY, NX_NY );
  const PZ = [].concat( PX_PZ, NX_PZ );
  const NZ = [].concat( PX_NZ, NX_NZ );

  // All vertices.
  const ALL = [].concat( PX, NX );

  // Vertices.
  // Front-back order is reversed for the left side.
  const RIGHT_TOP_FRONT    = [ 0 ];
  const RIGHT_TOP_BACK     = [ 1 ];
  const RIGHT_BOTTOM_FRONT = [ 2 ];
  const RIGHT_BOTTOM_BACK  = [ 3 ];
  const LEFT_TOP_BACK      = [ 4 ];
  const LEFT_TOP_FRONT     = [ 5 ];
  const LEFT_BOTTOM_BACK   = [ 6 ];
  const LEFT_BOTTOM_FRONT  = [ 7 ];

  // Edges.
  const RIGHT_TOP    = [].concat( RIGHT_TOP_FRONT, RIGHT_TOP_BACK );
  const RIGHT_BOTTOM = [].concat( RIGHT_BOTTOM_FRONT, RIGHT_BOTTOM_BACK );
  const LEFT_TOP     = [].concat( LEFT_TOP_BACK, LEFT_TOP_FRONT );
  const LEFT_BOTTOM  = [].concat( LEFT_BOTTOM_BACK, LEFT_BOTTOM_FRONT );

  const RIGHT_FRONT = [].concat( RIGHT_TOP_FRONT, RIGHT_BOTTOM_FRONT );
  const RIGHT_BACK  = [].concat( RIGHT_TOP_BACK, RIGHT_BOTTOM_BACK );
  const LEFT_FRONT  = [].concat( LEFT_TOP_FRONT, LEFT_BOTTOM_FRONT );
  const LEFT_BACK   = [].concat( LEFT_TOP_BACK, LEFT_BOTTOM_BACK );

  const TOP_FRONT    = [].concat( RIGHT_TOP_FRONT, LEFT_TOP_FRONT );
  const TOP_BACK     = [].concat( RIGHT_TOP_BACK, LEFT_TOP_BACK );
  const BOTTOM_FRONT = [].concat( RIGHT_BOTTOM_FRONT, LEFT_BOTTOM_FRONT );
  const BOTTOM_BACK  = [].concat( RIGHT_BOTTOM_BACK, LEFT_BOTTOM_BACK );

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

    // All vertices.
    ALL,

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
    BACK,
  };
}());

const FaceIndices = (function() {
  'use strict';

  const PX = [ 0, 1 ];
  const NX = [ 2, 3 ];
  const PY = [ 4, 5 ];
  const NY = [ 6, 7 ];
  const PZ = [ 8, 9 ];
  const NZ = [ 10, 11 ];

  const RIGHT = PX;
  const LEFT = NX;
  const TOP = PY;
  const BOTTOM = NY;
  const FRONT = PZ;
  const BACK = NZ;

  return {
    PX,
    NX,
    PY,
    NY,
    PZ,
    NZ,

    RIGHT,
    LEFT,
    TOP,
    BOTTOM,
    FRONT,
    BACK,
  };
}());

window.VertexIndices = VertexIndices;
window.FaceIndices = FaceIndices;
