/* global THREE */
window.createViewports = (function() {
  'use strict';

  const zero = new THREE.Vector3();

  return function viewports( element, {
    width = 128,
    height = 128,
    distance = 2,
  } = {} ) {
    return [ 'x', 'y', 'z' ].reduce( ( views, axis ) => {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( width, height );
      element.appendChild( renderer.domElement );

      const size = 1;
      const camera = new THREE.OrthographicCamera( -size, size, size, -size );
      camera.position[ axis ] = distance;
      camera.lookAt( zero );

      views[ axis ] = {
        renderer,
        camera
      };

      return views;
    }, {} );
  };
}());
