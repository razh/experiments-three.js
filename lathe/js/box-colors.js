/* eslint-env es6 */
/* global THREE */
window.applyBoxVertexColors = (function() {
  'use strict';

  return function vertexColors( geometry ) {
    const red = new THREE.Color( '#f00');
    const green = new THREE.Color( '#0f0' );
    const blue = new THREE.Color( '#00f' );

    geometry.faces.forEach( face => {
      face.vertexColors = [ red, green, blue ];
    });

    return geometry;
  };
}());
