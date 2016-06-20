/* eslint-env es6 */
/* global THREE, VertexIndices, FaceIndices */
window.applyBoxVertexColors = (function() {
  'use strict';

  function setFaceVertexColor( face, index, color ) {
    if ( face.a === index ) {
      face.vertexColors[ 0 ] = color;
    }

    if ( face.b === index ) {
      face.vertexColors[ 1 ] = color;
    }

    if ( face.c === index ) {
      face.vertexColors[ 2 ] = color;
    }
  }

  return function vertexColors( geometry, colors ) {
    Object.keys( colors ).forEach( key => {
      const color = new THREE.Color( colors[ key ] );
      const indices = VertexIndices[ key.toUpperCase() ];

      geometry.faces.forEach( face => {
        if ( Array.isArray( indices ) ) {
          indices.forEach( index =>
            setFaceVertexColor( face, index, color )
          );
        } else {
          setFaceVertexColor( face, indices, color );
        }
      });
    });

    return geometry;
  };
}());

// Like _.defaults, but with THREE.Face vertexColors.
window.defaultsVertexColor = (function() {
  'use strict';

  return function defaults( geometry, defaultColor ) {
    defaultColor = new THREE.Color( defaultColor );

    geometry.faces.forEach( face => {
      for ( let i = 0; i < 3; i++ ) {
        if ( face.vertexColors[ i ] === undefined ) {
          face.vertexColors[ i ] = defaultColor;
        }
      }
    });

    return geometry;
  };
}());

window.applyBoxFaceColors = (function() {
  'use strict';

  return function faceColors( geometry, colors ) {
    Object.keys( colors ).forEach( key => {
      const color = colors[ key ];
      const indices = FaceIndices[ key.toUpperCase() ];

      indices.forEach( index => geometry.faces[ index ].color.set( color ) );
    });

    return geometry;
  };
}());
