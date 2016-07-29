/* eslint-env es6 */
/* global THREE */
(function() {
  'use strict';

  function createPoints( string ) {
    const lines = string.split( '\n' );

    const points = [];
    for ( let i = 0; i < lines.length; i++ ) {
      const line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      const point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      const [ x, y = x ] = point;
      points.push( new THREE.Vector2( x, y ) );
    }

    return points;
  }

  // SVG path operations.
  // [operation name, offset to point position].
  const ops = {
    // M x y
    M: [ 'moveTo' ],
    // L x y
    L: [ 'lineTo' ],
    // Q x1 y1 x y
    Q: [ 'quadraticCurveTo', 2 ],
    // C x1 y1 x2 y2 x y
    C: [ 'bezierCurveTo', 4 ],
  };

  const relativeOps = {
    // m dx dy
    m: [ 'moveTo' ],
    // l dx dy
    l: [ 'lineTo' ],
    // q dx1 dy2 dx dy
    q: [ 'quadraticCurveTo', 2 ],
    // c dx1 dt1 dx2 dt2 dx dt
    c: [ 'bezierCurveTo', 4 ],
  };

  function createPathPoints( string ) {
    const lines = string.split( '\n' );

    const path = new THREE.Path();
    for ( let i = 0; i < lines.length; i++ ) {
      let line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      let opcode;
      // Does this line start with an opcode?
      if ( /^[A-Za-z]/.test( line ) ) {
        opcode = line.slice( 0, 1 );
        line = line.slice( 1 ).trim();
      }

      const point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      // moveTo.
      if ( !i ) {
        path.moveTo( ...point );
      }

      // Absolute path commands.
      else if ( ops[ opcode ] ) {
        const op = ops[ opcode ];
        path[ op[0] ]( ...point );
      }

      // Relative path commands.
      else if ( relativeOps[ opcode ] ) {
        const op = relativeOps[ opcode ];

        // Convert each tuple to absolute coordinates.
        const absolutePoint = point.map( ( n, index ) => {
          return n + path.currentPoint.getComponent( index % 2 );
        });

        path[ op[0] ]( ...absolutePoint );
      }
    }

    return path.getPoints();
  }

  window.createPoints = createPoints;
  window.createPathPoints = createPathPoints;
}());
