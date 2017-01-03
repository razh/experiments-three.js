/* eslint-env es6 */
/* global THREE, VertexIndices */

function transformBoxVertices( method ) {
  'use strict';

  const vector = new THREE.Vector3();
  const zero = new THREE.Vector3();

  function baseTransform( geometry, key, delta, ...args ) {
    const indices = VertexIndices[ key.toUpperCase() ];

    if ( Array.isArray( delta ) ) {
      vector.fromArray( delta );
    } else if ( typeof delta === 'object' ) {
      Object.assign( vector, zero, delta );
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
}

window.translateBoxVertices = transformBoxVertices( 'add' );
window.scaleBoxVertices = transformBoxVertices( 'multiply' );
window.lerpBoxVertices = transformBoxVertices( 'lerp' );

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
        baseCall( geometry, key, ...args );
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
