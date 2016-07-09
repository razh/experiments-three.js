/* eslint-env es6 */
/* global THREE */
/* exported ReferenceImage */
'use strict';

class ReferenceImage extends THREE.Mesh {
  constructor( ...args ) {
    const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
    super( geometry, ...args );
  }
}
