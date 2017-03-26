/* global THREE */
/* exported ReferenceImage */
'use strict';

class ReferenceImage extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
    const texture = new THREE.Texture();

    super( geometry, new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    }));

    this.texture = texture;

    this.domElement = document.createElement( 'div' );
    this.domElement.innerHTML = ReferenceImage.template;

    // Initialize values.
    [ 'x', 'y', 'z', 'width', 'height' ].forEach( key => {
      this.domElement.querySelector( `[name="${key}"]` ).value = this[ key ];
    });

    this.dispatcher = new THREE.EventDispatcher();

    this.addEventListeners();
  }

  get x() { return this.position.x; }
  get y() { return this.position.y; }
  get z() { return this.position.z; }
  get width() { return this.scale.x; }
  get height() { return this.scale.y; }

  set x( x ) { return this.position.x = x; }
  set y( y ) { return this.position.y = y; }
  set z( z ) { return this.position.z = z; }
  set width( width ) { return this.scale.x = width; }
  set height( height ) { return this.scale.y = height; }

  setImage( src ) {
    const image = new Image();
    image.crossOrigin = '';
    image.src = src;

    image.onload = () => {
      this.texture.image = image;
      this.texture.needsUpdate = true;
      this.dispatcher.dispatchEvent({ type: 'change' });
    };
  }

  addEventListeners() {
    this.domElement.addEventListener( 'input', event => {
      const { name, value } = event.target;
      this[ name ] = value;
      this.dispatcher.dispatchEvent({ type: 'change' });
    });

    this.domElement.addEventListener( 'dragover', event => {
      event.stopPropagation();
      event.preventDefault();
    });

    this.domElement.addEventListener( 'drop', event => {
      event.stopPropagation();
      event.preventDefault();

      let file = event.dataTransfer.files[0];
      if ( file ) {
        this.setImage( URL.createObjectURL( file ) );
      }
    });
  }
}

ReferenceImage.template = `
  <form>
    ${[ 'x', 'y', 'z', 'width', 'height' ].map( key => `
      <label for="${key}">${key}</label>
      <input id="${key}" name="${key}" type="number">
    `).join( '' )}
  </form>
`;
