/* eslint-env es6 */
/* global THREE, VertexIndices */


const transformBoxVertices = (function() {
  'use strict';

  const vector = new THREE.Vector3();

  return ( method, identity = new THREE.Vector3() ) => {
    function baseTransform( geometry, key, delta, ...args ) {
      const indices = VertexIndices[ key.toUpperCase() ];

      if ( Array.isArray( delta ) ) {
        vector.fromArray( delta );
      } else if ( typeof delta === 'object' ) {
        Object.assign( vector, identity, delta );
      } else if ( typeof delta === 'number' ) {
        vector.setScalar( delta );
      } else {
        return geometry;
      }

      if ( Array.isArray( indices ) ) {
        indices.forEach( index =>
          geometry.vertices[ index ][ method ]( vector, ...args )
        );
      }

      return geometry;
    }

    return function transform( geometry, vectors, ...args ) {
      if ( typeof vectors === 'string' ) {
        return baseTransform( geometry, vectors, ...args );
      } else if ( typeof vectors === 'object' ) {
        Object.keys( vectors ).forEach( key => {
          const delta = vectors[ key ];
          baseTransform( geometry, key, delta, ...args );
        });
      }

      return geometry;
    };
  };
}());

window.translateBoxVertices = transformBoxVertices( 'add' );
window.scaleBoxVertices = transformBoxVertices( 'multiply', new THREE.Vector3( 1, 1, 1 ) );
window.lerpBoxVertices = transformBoxVertices( 'lerp' );

// Per-axis THREE.BoxGeometry methods.
const transformAxisBoxVertices = (function() {
  'use strict';

  const vector = new THREE.Vector3();

  return ( method, identity = new THREE.Vector3() ) => {
    return axis => {
      function baseTransformAxis(
        geometry,
        key,
        delta = identity.getComponent( axis ),
        ...args
      ) {
        const indices = VertexIndices[ key.toUpperCase() ];

        if ( Array.isArray( indices ) ) {
          vector
            .copy( identity )
            .setComponent( axis, delta );

          indices.forEach( index =>
            geometry.vertices[ index ][ method ]( vector, ...args )
          );
        }

        return geometry;
      }

      return function transformAxis( geometry, vectors, ...args ) {
        if ( typeof vectors === 'string' ) {
          const delta = args.shift();
          return baseTransformAxis( geometry, vectors, delta, ...args );
        } else if ( typeof vectors === 'object' ) {
          Object.keys( vectors ).forEach( key => {
            const delta = vectors[ key ];
            baseTransformAxis( geometry, key, delta, ...args );
          });
        }

        return geometry;
      };
    };
  };
}());

const translateAxisBoxVertices = transformAxisBoxVertices( 'add' );

window.translateXBoxVertices = translateAxisBoxVertices( 0 );
window.translateYBoxVertices = translateAxisBoxVertices( 1 );
window.translateZBoxVertices = translateAxisBoxVertices( 2 );

const scaleAxisBoxVertices = transformAxisBoxVertices( 'multiply', new THREE.Vector3( 1, 1, 1 ) );

window.scaleXBoxVertices = scaleAxisBoxVertices( 0 );
window.scaleYBoxVertices = scaleAxisBoxVertices( 1 );
window.scaleZBoxVertices = scaleAxisBoxVertices( 2 );

// Call THREE.BoxGeometry methods directly.
function callBoxVertices( method ) {
  'use strict';

  function baseCall( geometry, key, ...args ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      indices.forEach( index =>
        geometry.vertices[ index ][ method ]( ...args )
      );
    }

    return geometry;
  }

  return function call( geometry, vectors, ...args ) {
    if ( typeof vectors === 'string' ) {
      return baseCall( geometry, vectors, ...args );
    } else if ( typeof vectors === 'object' ) {
      Object.keys( vectors ).forEach( key => {
        const value = vectors[ key ];
        baseCall( geometry, key, value, ...args );
      });
    }

    return geometry;
  };
}

window.setBoxVertices = callBoxVertices( 'set' );
window.setXBoxVertices = callBoxVertices( 'setX' );
window.setYBoxVertices = callBoxVertices( 'setY' );
window.setZBoxVertices = callBoxVertices( 'setZ' );
window.copyBoxVertices = callBoxVertices( 'copy' );

//  Get the first matching THREE.BoxGeometry vertex.
function getBoxVertex( geometry, key ) {
  'use strict';

  if ( key ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    if ( Array.isArray( indices ) ) {
      return geometry.vertices[ indices[ 0 ] ];
    }
  }

  return geometry.vertices[ 0 ];
}

window.getBoxVertex = getBoxVertex;
