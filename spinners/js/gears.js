/* global THREE */
/* exported drawGear */
var drawGear = (function() {
  'use strict';

  function lineTo( ctx, radius, angle ) {
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );
    ctx.lineTo( cos * radius, sin * radius );
  }

  /*
    segment
    ===

      startAngle   endAngle
          o-----------o
           \         /
            \       /  radius
             \     /
              \   /
                o
             (0, 0)

    tooth
    ===

             0.4   0.6
      r'       o---o
              /     \
      r  o---o       o---o
         0  0.2     0.8  1

    This can be represented as:

      [
        [ 0.0, r  ], // implicit start point
        [ 0.2, r  ],
        [ 0.4, r' ],
        [ 0.6, r' ],
        [ 0.8, r  ],
        [ 1.0, r  ] // implicit end point
      ]

    Note that the start and end points are implicitly defined at the
    baseline radius.
   */

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} radius
   * @param {number} segments
   * @param {Array<Array<number>>} tooth - Array of tuples: [ parameter, radius ].
   */
  function drawGear( ctx, radius, segments, tooth ) {
    radius = radius || 50;
    segments = segments !== undefined ? Math.max( 3, segments ) : 8;
    tooth = tooth || [];

    var segmentAngle = 2 * Math.PI / segments;

    ctx.moveTo( radius, 0 );

    var startAngle;
    var endAngle;
    for ( var i = 0; i < segments; i++ ) {
      startAngle = i * segmentAngle;
      endAngle = ( i + 1 ) * segmentAngle;

      tooth.forEach( function( point ) {
        var angle = THREE.Math.mapLinear( point[0], 0, 1, startAngle, endAngle );
        lineTo( ctx, point[1], angle );
      });

      // When closing a path, lineTo() will cause THREE.Shape.prototype.extractPoints()
      // to generate a duplicate of the initial point. Prefer closePath() instead.
      if ( i < segments - 1 ) {
        lineTo( ctx, radius, endAngle );
      }
    }

    ctx.closePath();

    return ctx;
  }

  return drawGear;

})();