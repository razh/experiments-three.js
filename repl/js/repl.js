/* eslint-env es6 */
/* global THREE, createNumericInput */

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

    const axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 4, 20 );
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

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

        const params = new URLSearchParams( window.location.search );
        params.set( 'commands', event.target.value.trim() );
        window.history.replaceState( '', '', `?${ params }` );

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
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls while textarea is focused.
    textarea.addEventListener( 'keydown', event => event.stopPropagation() );

    const params = new URLSearchParams( window.location.search );
    textarea.value = params.get( 'commands' );
    textarea.dispatchEvent( new Event( 'input' ) );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();
}());
