/* global THREE */
(function() {
  'use strict';

  function createPoints( string ) {
    var lines = string.split( '\n' );
    var line;

    var points = [];
    var point;
    var x, y, z;
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

      if ( point.length === 1 ) {
        y = 0;
        z = x;
      } else if ( point.length === 2 ) {
        y = 0;
        z = point[1];
      } else {
        y = point[1];
        z = point[2];
      }

      points.push( new THREE.Vector3( x, y, z ) );
    }

    return points;
  }

  // SVG path operations.
  var ops = {
    M: 'moveTo',
    L: 'lineTo',
    Q: 'quadraticCurveTo',
    B: 'bezierCurveTo'
  };

  function createPathPoints( string ) {
    var lines = string.split( '\n' );
    var line;

    var path = new THREE.Path();
    var point;
    var op, opcode;
    for ( var i = 0; i < lines.length; i++ ) {
      line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      if ( /^[A-Za-z]/.test( line ) ) {
        opcode = line.slice( 0, 1 );
        line = line.slice( 1 ).trim();
      }

      point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      if ( !i ) {
        path.moveTo.apply( path, point );
      } else {
        op = path[ops[opcode]];
        if (op) {
          op.apply( path, point );
        }
      }
    }

    return path
      .getPoints()
      .map( function( v ) { return new THREE.Vector3( v.x, 0, v.y ) } );
  }

  window.createPoints = createPoints;
  window.createPathPoints = createPathPoints;

})();
