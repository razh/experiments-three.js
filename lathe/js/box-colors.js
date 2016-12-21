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

  function baseVertexColors( geometry, key, color ) {
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

    return geometry;
  }

  return function vertexColors( geometry, colors, ...args ) {
    if ( typeof colors === 'string' ) {
      return baseVertexColors( geometry, colors, ...args );
    } else if ( typeof colors === 'object' ) {
      Object.keys( colors ).forEach( key => {
        const color = new THREE.Color( colors[ key ] );
        baseVertexColors( geometry, key, color );
      });
    }

    return geometry;
  };
}());

// Like _.defaults, but with THREE.Face vertexColors.
window.defaultVertexColors = (function() {
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

  function baseFaceColors( geometry, key, color ) {
    const indices = FaceIndices[ key.toUpperCase() ];
    indices.forEach( index => geometry.faces[ index ].color.set( color ) );
    return geometry;
  }

  return function faceColors( geometry, colors, ...args ) {
    if ( typeof colors === 'string' ) {
      return baseFaceColors( geometry, colors, ...args );
    } else {
      Object.keys( colors ).forEach( key => {
        const color = colors[ key ];
        baseFaceColors( geometry, key, color );
      });
    }

    return geometry;
  };
}());

window.applyBoxFaceVertexColors = (function() {
  'use strict';

  function baseFaceVertexColors( geometry, key, color ) {
    const indices = FaceIndices[ key.toUpperCase() ];

    indices.forEach( index => {
      const face = geometry.faces[ index ];
      for ( let i = 0; i < 3; i++ ) {
        face.vertexColors[ i ] = color;
      }
    });

    return geometry;
  }

  return function faceVertexColors( geometry, colors, ...args ) {
    if ( typeof colors === 'string' ) {
      return baseFaceVertexColors( geometry, colors, ...args );
    } else {
      Object.keys( colors ).forEach( key => {
        const color = new THREE.Color( colors[ key ] );
        baseFaceVertexColors( geometry, key, color );
      });
    }

    return geometry;
  };
}());
