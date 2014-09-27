/*global THREE*/
/*exported createArrow*/
var createArrow = (function() {
  'use strict';

  var matrix = new THREE.Matrix4();

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

    var markerMaterial = new THREE.MeshBasicMaterial({ color: color });
    var markerMesh = new THREE.Mesh( markerGeometry, markerMaterial );

    arrow.add( markerMesh );

    return arrow;
  }

  return createArrow;

}) ();
