/* global THREE, Box */
/* exported createSkeletonGeometry */

/**
 * Format:
 *
 *   [
 *     width: number,
 *     height: number,
 *     depth: number,
 *     attrs: ?Object,
 *     children: ?Array,
 *   ]
 *
 * Example:
 *
 *   // Root
 *   [
 *     2, 4, 2,
 *     // Children
 *     [
 *       // Child
 *       [
 *         1, 3, 1, { pos: [ 0, 3, 0 ], rotq: [ 0, 0, 1, 1 ] },
 *         // Grandchildren
 *         [
 *           // Grandchild
 *           [ 1, 1, 1 ],
 *         ]
 *       ],
 *       // Child
 *       [ 1, 2, 3 ],
 *     ],
 *   ]
 */
const createSkeletonGeometry = (() => {
  'use strict';

  function traverse( node, parent ) {
    if ( !Array.isArray( node ) ) {
      return;
    }

    const box = new Box( node[0], node[1], node[2] );
    if ( parent ) {
      parent.add( box );
    }

    let attrs;
    let children;
    if ( Array.isArray( node[3] ) ) {
      children = node[3];
    } else {
      if ( typeof node[3] === 'object' ) {
        attrs = node[3];
      }

      if ( Array.isArray( node[4] ) ) {
        children = node[4];
      }
    }

    if ( attrs ) {
      if ( Array.isArray( attrs.pos ) ) {
        box.position.fromArray( attrs.pos );
      }

      if ( Array.isArray( attrs.rotq ) ) {
        box.quaternion.fromArray( attrs.rotq );
      }
    }

    if ( children ) {
      children.forEach( child => {
        if ( Array.isArray( child ) ) {
          traverse( child, box );
        }
      });
    }

    return box;
  }

  function createSkeletonGeometry( root ) {
    const geometry = new THREE.Geometry();

    geometry.bones = [
      {
        parent: -1,
        name: 'root',
        pos: [ 0, 0, 0 ],
        rotq: [ 0, 0, 0, 1 ],
      },
    ];

    const tree = traverse( root );

    tree.traverse( node => {
      geometry.merge( node.createGeometry() );
      node.createBone( geometry );
    });

    return geometry;
  }

  return createSkeletonGeometry;
})();
