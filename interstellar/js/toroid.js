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
class Toroid extends THREE.Geometry {
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

    const center = new THREE.Vector3();
    const uvs = [];
    const normals = [];

    for ( let j = 0; j <= radialSegments; j++ ) {
      for ( let i = 0; i <= tubularSegments; i++ ) {
        const u = i / tubularSegments * arc;
        const v = j / radialSegments * Math.PI + ( 1 / 2 * Math.PI );

        center.x = innerRadius * Math.cos( u );
        center.y = innerRadius * Math.sin( u );

        const vertex = new THREE.Vector3();
        vertex.x = ( innerRadius + tube * Math.cos( v ) ) * Math.cos( u );
        vertex.y = ( innerRadius + tube * Math.cos( v ) ) * Math.sin( u );
        vertex.z = tube * Math.sin( v );

        if ( !j ) {
          vertex.x = ( outerRadius + tube * Math.cos( v ) ) * Math.cos( u );
          vertex.y = ( outerRadius + tube * Math.cos( v ) ) * Math.sin( u );
        }

        this.vertices.push( vertex );

        uvs.push( new THREE.Vector2( i / tubularSegments, j / radialSegments ) );

        if ( !j ) {
          normals.push( new THREE.Vector3( 0, 0, 1 ) );
        } else {
          normals.push( vertex.clone().sub( center ).normalize() );
        }
      }
    }

    for ( let j = 1; j <= radialSegments; j++ ) {
      for ( let i = 1; i <= tubularSegments; i++ ) {
        const a = ( tubularSegments + 1 ) * j + i - 1;
        const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
        const c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
        const d = ( tubularSegments + 1 ) * j + i;

        let face = new THREE.Face3( a, b, d, [ normals[ a ].clone(), normals[ b ].clone(), normals[ d ].clone() ] );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ d ].clone() ] );

        face = new THREE.Face3( b, c, d, [ normals[ b ].clone(), normals[ c ].clone(), normals[ d ].clone() ] );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
      }
    }

    this.computeFaceNormals();
  }
}
