/* eslint-env es6 */
/* global THREE */
/* exported createArrow */
const createArrow = (function() {
  'use strict';

  function createrLerper(path, divisions) {
    const geometry = path.createSpacedPointsGeometry( divisions );

    return {
      geometry,

      lerp( t ) {
        for ( let i = 0; i <= divisions; i++ ) {
          const point = path.getPoint( t * i / divisions );
          geometry.vertices[i].set( point.x, point.y, point.z || 0 );
        }

        geometry.verticesNeedUpdate = true;
        return geometry;
      },

      getTangent( t ) {
        return path.getTangent( t );
      }
    };
  }

  return function createArrow( path, options = {} ) {
    const {
      markerWidth = 1,
      markerLength = 1,
      markerShear = 0,

      color = 0,
      linewidth = 1,
      divisions = 8,
    } = options;

    if ( divisions < 1 ) {
      throw new Error( 'Arrows require at least one division.' );
    }

    const arrow = new THREE.Group();

    // Create path.
    const lerper = createrLerper( path, divisions );
    const lineGeometry = lerper.geometry;

    // Cache endpoint vertex.
    const endpoint = lineGeometry.vertices[ lineGeometry.vertices.length - 1 ];

    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      linewidth,
    });

    const line = new THREE.Line( lineGeometry, lineMaterial );
    arrow.add( line );

    // Create marker.
    // Marker shape.
    const markerShape = new THREE.Shape();
    const halfWidth = markerWidth / 2;

    markerShape.moveTo( 0, markerLength );

    if ( !markerShear ) {
      // Simple triangle.
      markerShape.lineTo( -halfWidth, 0 );
      markerShape.lineTo(  halfWidth, 0 );
    } else {
      // Sheared triangle.
      const shear = -Math.tan( markerShear ) * markerWidth;
      markerShape.lineTo( -halfWidth, shear );
      markerShape.lineTo( 0, 0 );
      markerShape.lineTo( halfWidth, shear );
    }

    markerShape.lineTo( 0, markerLength );

    const markerGeometry = new THREE.ShapeGeometry( markerShape );
    // Rotate to XZ plane.
    markerGeometry.rotateX( -Math.PI / 2 );

    const markerMaterial = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    });

    const markerMesh = new THREE.Mesh( markerGeometry, markerMaterial );

    function setMarkerTransform( t = 1 ) {
      // Translate to endpoint.
      markerMesh.position.copy( endpoint );

      // Rotate to tangent.
      const tangent = lerper.getTangent( t );
      markerMesh.rotation.y = -Math.atan2( tangent.x, tangent.y );
    }

    arrow.add( markerMesh );

    arrow.lerp = function( t = 0 ) {
      t = THREE.Math.clamp( t, 0, 1 );
      // Resample line geometry.
      lerper.lerp( t );
      lineGeometry.rotateX( -Math.PI / 2 );
      // Translate and rotate marker.
      setMarkerTransform( t );
    };

    // Initial lerp.
    arrow.lerp( 1 );
    return arrow;
  };
}());
