/* global THREE, defaultVertexColors */

(function() {
  'use strict';

  function applyTransforms( geometry, ...transforms ) {
    transforms.forEach( transform => transform( geometry ) );
    return geometry;
  }

  function createGeometryWrapper( value, ...transforms ) {
    let geometry;

    if ( value instanceof THREE.Geometry ) {
      geometry = value;
    } else if ( Array.isArray( value ) ) {
      geometry = new THREE.BoxGeometry( ...value );
    } else {
      return new THREE.Geometry();
    }

    return applyTransforms( geometry, ...transforms );
  }

  function mergeGeometries( geometries, ...transforms ) {
    if ( !Array.isArray( geometries ) ) {
      return applyTransforms( geometries, ...transforms );
    }

    return geometries
      .map( geometry => applyTransforms( geometry, ...transforms ) )
      .reduce( ( a, b ) => {
        a.merge( b );
        return a;
      });
  }

  function applyDefaultVertexColors( geometries ) {
    if ( !Array.isArray( geometries ) ) {
      return defaultVertexColors( geometries );
    }

    return geometries.map( geometry => defaultVertexColors( geometry ) );
  }

  window.createGeometryWrapper = createGeometryWrapper;
  window.mergeGeometries = mergeGeometries;
  window.applyDefaultVertexColors = applyDefaultVertexColors;
}());
