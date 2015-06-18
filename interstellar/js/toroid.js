/*global THREE*/
/*exported Toroid*/
var Toroid = (function() {
  'use strict';

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
  function Toroid( outerRadius, innerRadius, tube, radialSegments, tubularSegments, arc ) {
    THREE.Geometry.call( this );

    this.parameters = {
      outerRadius: outerRadius,
      innerRadius: innerRadius,
      tube: tube,
      radialSegments: radialSegments,
      tubularSegments: tubularSegments,
      arc: arc
    };

    outerRadius = outerRadius || 160;
    innerRadius = innerRadius || 100;
    tube = tube || 40;
    radialSegments = radialSegments || 8;
    tubularSegments = tubularSegments || 6;
    arc = arc || Math.PI * 2;

    var center = new THREE.Vector3();
    var uvs = [];
    var normals = [];

    var i, j;
    for ( j = 0; j <= radialSegments; j++ ) {
      for ( i = 0; i <= tubularSegments; i++ ) {
        var u = i / tubularSegments * arc;
        var v = j / radialSegments * Math.PI + ( 1 / 2 * Math.PI );

        center.x = innerRadius * Math.cos( u );
        center.y = innerRadius * Math.sin( u );

        var vertex = new THREE.Vector3();
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

    for ( j = 1; j <= radialSegments; j++ ) {
      for ( i = 1; i <= tubularSegments; i++ ) {
        var a = ( tubularSegments + 1 ) * j + i - 1;
        var b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
        var c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
        var d = ( tubularSegments + 1 ) * j + i;

        var face = new THREE.Face3( a, b, d, [ normals[ a ].clone(), normals[ b ].clone(), normals[ d ].clone() ] );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ d ].clone() ] );

        face = new THREE.Face3( b, c, d, [ normals[ b ].clone(), normals[ c ].clone(), normals[ d ].clone() ] );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
      }
    }

    this.computeFaceNormals();
  }

  Toroid.prototype = Object.create( THREE.Geometry.prototype );

  return Toroid;

}) ();
