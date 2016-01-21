/*global THREE*/
/*exported createArrow*/
var createArrow = (function() {
  'use strict';

  function lerpPathFn( path, divisions ) {
    var geometry = path.createSpacedPointsGeometry( divisions );

    return {
      geometry: geometry,

      lerp: function lerp( t ) {
        var point;
        for ( var i = 0; i < divisions; i++ ) {
          point = path.getPoint( t * i / divisions );
          geometry.vertices[i].set( point.x, point.y, point.z || 0 );
        }

        geometry.verticesNeedUpdate = true;
        return geometry;
      },

      getTangent: function getTangent( t ) {
        return path.getTangent( t );
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

    // Create path.
    var lerper = lerpPathFn( path, divisions );
    var lineGeometry = lerper.geometry;

    // Cache endpoint vertex.
    var endpoint = lineGeometry.vertices[ lineGeometry.vertices.length - 1 ];

    var lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: linewidth
    });

    var line = new THREE.Line( lineGeometry, lineMaterial );
    arrow.add( line );

    // Create marker.
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
    markerGeometry.rotateX( -Math.PI / 2 );

    var markerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });

    var markerMesh = new THREE.Mesh( markerGeometry, markerMaterial );

    function setMarkerTransform( t ) {
      t = t !== undefined ? t : 1;

      // Translate to endpoint.
      markerMesh.position.copy( endpoint );

      // Rotate to tangent.
      var tangent = lerper.getTangent( t );
      markerMesh.rotation.y = -Math.atan2( tangent.x, tangent.y );
    }

    arrow.add( markerMesh );

    arrow.lerp = function( t ) {
      t = t || 0;
      // Resample line geometry.
      lerper.lerp( t );
      lineGeometry.rotateX( -Math.PI / 2 );
      // Translate and rotate marker.
      setMarkerTransform( t );
    };

    // Initial lerp.
    arrow.lerp( 1 );
    return arrow;
  }

  return createArrow;

}) ();
