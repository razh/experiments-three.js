/* eslint-env es6 */
/* global THREE */

(function() {
  'use strict';

  let container;

  let scene, camera, renderer;

  function dispose( mesh ) {
    if ( mesh instanceof THREE.Mesh ) {
      mesh.geometry.dispose();
    }
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    let group = new THREE.Group();
    scene.add( group );

    function onInput( event ) {
      try {
        group.traverse( dispose );
        scene.remove( group );

        const fn = new Function( [ 'THREE' ], event.target.value );

        group = new THREE.Group();
        group.add( ...fn( THREE ) );
        scene.add( group );

        render();

        if ( !event.target.validity.valid ) {
          console.info( '' );
        }

        event.target.setCustomValidity( '' );
      } catch ( error ) {
        console.error( error );
        event.target.setCustomValidity( 'Invalid function' );
      }
    }

    const textarea = document.getElementById( 'textarea-commands' );
    textarea.addEventListener( 'input', onInput );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();
}());
