/* eslint comma-dangle: ["error", "always-multiline"] */
/* global THREE */
/* exported Toroid */

/**
 * This geometry is akin to the inner half of a regular torus with the top
 * half extended to a circle.
 *
 * Cross-section example:
 *
 *    --------.        .--------
 *             \      /
 *              |    |
 *             /      \
 *          --'        '--
 *
 * Note the missing outer-half.
 */
class Toroid extends THREE.BufferGeometry {
  constructor(
    outerRadius = 160,
    innerRadius = 100,
    tube = 40,
    radialSegments = 8,
    tubularSegments = 6,
    arc = Math.PI * 2
  ) {
    super();

    this.parameters = {
      outerRadius,
      innerRadius,
      tube,
      radialSegments,
      tubularSegments,
      arc,
    };

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    const vertex = new THREE.Vector3();
    const center = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for ( let j = 0; j <= radialSegments; j++ ) {
      for ( let i = 0; i <= tubularSegments; i++ ) {
        const u = i / tubularSegments * arc;
        const v = j / radialSegments * Math.PI + ( 1 / 2 * Math.PI );

        // Vertex.
        vertex.x = ( innerRadius + tube * Math.cos( v ) ) * Math.cos( u );
        vertex.y = ( innerRadius + tube * Math.cos( v ) ) * Math.sin( u );
        vertex.z = tube * Math.sin( v );

        if ( !j ) {
          vertex.x = ( outerRadius + tube * Math.cos( v ) ) * Math.cos( u );
          vertex.y = ( outerRadius + tube * Math.cos( v ) ) * Math.sin( u );
        }

        vertices.push( vertex.x, vertex.y, vertex.z );

        // Normal.
        if ( !j ) {
          normals.push( 0, 0, 1 );
        } else {
          center.x = innerRadius * Math.cos( u );
          center.y = innerRadius * Math.sin( u );

          normal.subVectors( vertex, center ).normalize();
          normals.push( normal.x, normal.y, normal.z );
        }

        uvs.push( i / tubularSegments, j / radialSegments );
      }
    }

    for ( let j = 1; j <= radialSegments; j++ ) {
      for ( let i = 1; i <= tubularSegments; i++ ) {
        const a = ( tubularSegments + 1 ) * j + i - 1;
        const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
        const c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
        const d = ( tubularSegments + 1 ) * j + i;

        indices.push( a, b, d );
        indices.push( b, c, d );
      }
    }

    this.setIndex( indices );
    this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    this.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    this.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
  }
}
