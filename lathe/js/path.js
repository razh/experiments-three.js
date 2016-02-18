/* global THREE */
(function() {
  'use strict';

  function createPoints( string ) {
    var lines = string.split( '\n' );
    var line;

    var points = [];
    var point;
    var x, y;
    for ( var i = 0; i < lines.length; i++ ) {
      line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      x = point[0];
      y = point[1];

      if ( point.length === 1 ) {
        y = x;
      }

      points.push( new THREE.Vector2( x, y ) );
    }

    return points;
  }

  // SVG path operations.
  // [operation name, offset to point position].
  var ops = {
    // M x y
    M: ['moveTo'],
    // L x y
    L: ['lineTo'],
    // Q x1 y1 x y
    Q: ['quadraticCurveTo', 2],
    // C x1 y1 x2 y2 x y
    C: ['bezierCurveTo', 4]
  };

  var relativeOps = {
    // m dx dy
    m: ['moveTo'],
    // l dx dy
    l: ['lineTo'],
    // q dx1 dy2 dx dy
    q: ['quadraticCurveTo', 2],
    // c dx1 dt1 dx2 dt2 dx dt
    c: ['bezierCurveTo', 4]
  };

  function createPathPoints( string ) {
    var lines = string.split( '\n' );
    var line;

    var path = new THREE.Path();
    var point;
    var previousPoint, absolutePoint;
    var op, opcode;
    for ( var i = 0; i < lines.length; i++ ) {
      line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      // Does this line start with an opcode?
      if ( /^[A-Za-z]/.test( line ) ) {
        opcode = line.slice( 0, 1 );
        line = line.slice( 1 ).trim();
      }

      point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      // moveTo.
      if ( !i ) {
        path.moveTo.apply( path, point );
        previousPoint = point;
      }

      // Absolute path commands.
      else if ( ops[ opcode ] ) {
        op = ops[ opcode ];
        path[ op[0] ].apply( path, point );
        previousPoint = point.slice( op[1] || 0 );
      }

      // Relative path commands.
      else if ( relativeOps[ opcode ] ) {
        op = relativeOps[ opcode ];
        if ( !previousPoint ) {
          continue;
        }

        // Convert to absolute coordinates.
        absolutePoint = point.map(function( n, index ) {
          return n + previousPoint[ index % 2 ];
        });

        path[ op[0] ].apply( path, absolutePoint );
        previousPoint = absolutePoint.slice( op[1] || 0 );
      }
    }

    return path.getPoints();
  }

  window.createPoints = createPoints;
  window.createPathPoints = createPathPoints;

})();
