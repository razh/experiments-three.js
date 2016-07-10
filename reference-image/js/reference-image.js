/* eslint-env es6 */
/* global THREE */
/* exported ReferenceImage */
'use strict';

class ReferenceImage extends THREE.Mesh {
  constructor( ...args ) {
    const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
    super( geometry, ...args );

    this.domElement = document.createElement( 'div' );
    this.domElement.innerHTML = ReferenceImage.template;
  }
}

ReferenceImage.template = `
  <form>
    ${[ 'x', 'y', 'z', 'width', 'height' ].map(key => `
      <label for="${key}">${key}</label>
      <input id="${key}" name="${key}" type="number">
    `).join('')}
  </form>
`;
