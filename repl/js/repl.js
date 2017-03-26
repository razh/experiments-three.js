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
        event.target.setCustomValidity( error );
      }

      event.target.form.querySelector('.js-validation-message').textContent = event.target.validationMessage;
    }

    const textarea = document.getElementById( 'textarea-commands' );
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls when focused on textarea.
    textarea.addEventListener( 'keydown', event => event.stopPropagation() );

    const params = new URLSearchParams( window.location.search );

    // Get default value.
    (function() {
      // Fetch from file-path if it exists.
      const path = params.get( 'path' );
      if ( path ) {
        // Save path before replaceState.
        window.history.pushState( '', '', window.location.search );
        return fetch( path ).then( res => res.text() );
      }

      return Promise.resolve( params.get( 'commands' ) );
    }())
      .then( value => {
        textarea.value = value;
        textarea.dispatchEvent( new Event( 'input' ) );

        // Go back if fetched from file-path.
        if ( params.get( 'path' ) ) {
          window.history.back();
        }
      });
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
}());
