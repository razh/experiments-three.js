/*global THREE*/
/*exported createArrow*/
var createArrow = (function() {
  'use strict';

  var matrix = new THREE.Matrix4();

  function inverseLerp( a, b, x ) {
    return ( x - a ) / ( b - a );
  }

  function lerpGeometryFn( geometry ) {
    var clone = geometry.clone();

    var vertices = geometry.vertices;
    var cloneVertices = clone.vertices;

    var vector3 = new THREE.Vector3();

    var sum = 0;
    var length;
    var lengths = [];
    var subtotals = [0];
    var i, il;
    for ( i = 1, il = vertices.length; i < il; i++ ) {
      length = vector3.copy( vertices[i] )
        .distanceTo( vertices[ i - 1 ] );

      lengths.push( length );
      sum += length;
      subtotals.push( sum );
    }

    return {
      geometry: clone,

      lerp: function lerp( t ) {
        var td = t * sum;
        var ti;
        var next;
        var subtotal;
        var found = false;
        var position;
        for ( i = 0, il = subtotals.length - 1; i < il; i++ ) {
          if ( !found ) {
            subtotal = subtotals[i];
            next = subtotals[ i + 1 ];
            if ( !next || ( next && td <= next ) ) {
              found = true;

              next = next || sum;
              ti = inverseLerp( subtotal, next, td );

              position = vector3.copy( vertices[i] )
                .lerp( vertices[ i + 1 ], ti );
            }
          }

          // Move vertices.
          if ( found ) {
            cloneVertices[i].copy( position );
          } else {
            cloneVertices[i].copy( vertices[i] );
          }
        }

        cloneVertices[ cloneVertices.length - 1 ]
          .copy( position || vertices[ vertices.length - 1 ] );

        clone.verticesNeedUpdate = true;
      }
    };
  }

  function createArrow( path, options ) {
    options = options || {};

    var markerWidth = options.markerWidth || 1;
    var markerLength = options.markerLength || 1;
    var markerShear = options.markerShear || 0;

    var color = options.color || 0;
    var linewidth = options.linewidth || 1;
    var divisions = options.divisions || 8;

    if ( divisions < 1 ) {
      throw new Error( 'Arrows require at least one division.' );
    }

    var arrow = new THREE.Object3D();

    var lineGeometry = path.createSpacedPointsGeometry( divisions );
    matrix.makeRotationX( -Math.PI / 2 );
    lineGeometry.applyMatrix( matrix );

    var lerper = lerpGeometryFn( lineGeometry );
    lineGeometry = lerper.geometry;

    var lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: linewidth
    });

    var line = new THREE.Line( lineGeometry, lineMaterial );
    arrow.add( line );

    // Continue arrow marker along direction of last subdivision.
    var lastIndex = lineGeometry.vertices.length - 1;
    var endpoint = lineGeometry.vertices[ lastIndex ];
    var prev = lineGeometry.vertices[ lastIndex - 1 ];

    var direction = endpoint.clone().sub( prev );

    // Marker shape.
    var markerShape = new THREE.Shape();
    var halfWidth = markerWidth / 2;

    markerShape.moveTo( 0, markerLength );

    if ( !markerShear ) {
      // Simple triangle.
      markerShape.lineTo( -halfWidth, 0 );
      markerShape.lineTo(  halfWidth, 0 );
    } else {
      // Sheared triangle.
      var shear = -Math.tan( markerShear ) * markerWidth;
      markerShape.lineTo( -halfWidth, shear );
      markerShape.lineTo( 0, 0 );
      markerShape.lineTo( halfWidth, shear );
    }

    markerShape.lineTo( 0, markerLength );

    var markerGeometry = new THREE.ShapeGeometry( markerShape );

    // Rotate to XZ plane.
    matrix.makeRotationX( -Math.PI / 2 );
    markerGeometry.applyMatrix( matrix );

    // Rotate to point in direction.
    matrix.makeRotationY( Math.atan2( direction.x, direction.z ) + Math.PI );
    markerGeometry.applyMatrix( matrix );

    // Translate to endpoint.
    matrix.makeTranslation( endpoint.x, endpoint.y, endpoint.z );
    markerGeometry.applyMatrix( matrix );

    var markerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });

    var markerMesh = new THREE.Mesh( markerGeometry, markerMaterial );
    arrow.add( markerMesh );

    arrow.lerp = lerper.lerp;
    return arrow;
  }

  return createArrow;

}) ();
