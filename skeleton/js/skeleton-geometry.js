/* global THREE, Box */
/* exported createSkeletonGeometry */

/**
 * Format:
 *
 *   [
 *     width: number,
 *     height: number,
 *     depth: number,
 *     children: ?Array
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
 *         1, 3, 1,
 *         // Grandchild
 *         [ 1, 1, 1 ]
 *       ],
 *       // Child
 *       [ 1, 2, 3 ]
 *     ]
 *   ]
 */
var createSkeletonGeometry = (function() {

  function traverse( node, parent ) {
    if ( !Array.isArray( node ) ) {
      return;
    }

    var box = new Box( node[0], node[1], node[2] );
    if ( parent ) {
      parent.add( box );
    }

    if ( Array.isArray( node[3] ) ) {
      node[3].forEach(function( child ) {
        traverse( child, box );
      });
    }

    return box;
  }

  function createSkeletonGeometry( root ) {
    var geometry = new THREE.Geometry();

    geometry.bones = [
      {
        parent: -1,
        name: 'root',
        pos: [ 0, 0, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      }
    ];

    var tree = traverse( root );

    tree.traverse(function( node ) {
      geometry.merge( node.createGeometry() );
      node.createBone( geometry );
    });

    return geometry;
  }

  return createSkeletonGeometry;
})();
