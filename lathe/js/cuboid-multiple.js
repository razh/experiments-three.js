/* global THREE, createNumericInput, updateGeometry, translateBoxVertices */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;

  function setGeometry( _geometry ) {
    geometry = _geometry;
    mesh.geometry = geometry;
    mesh.needsUpdate = true;
  }

  function createBoxGeometry( dimensions, transformFn, vectors ) {
    var geometry = new THREE.BoxGeometry( dimensions[0], dimensions[1], dimensions[2] );

    if ( typeof vectors === 'object' ) {
      translateBoxVertices( geometry, vectors );
    }

    if ( typeof transformFn === 'function' ) {
      transformFn( geometry );
    } else if ( Array.isArray( transformFn ) ) {
      transformFn.forEach(function( transformFn ) {
        transformFn( geometry );
      });
    }

    return geometry;
  }

  function mergeGeometries( geometries ) {
    return geometries.reduce(function( a, b ) {
      a.merge( b );
      return a;
    })
  }

  function getQueryParam( key ) {
    var params = window.location.search
      .slice( 1 )
      .split( '&' )
      .reduce(function( object, pair ) {
        pair = pair.split( '=' ).map( decodeURIComponent );
        object[ pair[0] ] = pair[1];
        return object;
      }, {} );

      return params[ key ];
  }

  function setQueryString( key, value ) {
    var hash = (
      window.location.origin +
      window.location.pathname +
      '?' + encodeURIComponent( key ) + '=' + encodeURIComponent( value )
    );

    window.history.replaceState( '', '', hash );
  }

  function onInput( event ) {
    try {
      var fn = new Function( [ 'b' ], event.target.value );

      var _geometries = fn( createBoxGeometry );
      var _geometry = mergeGeometries( _geometries );
      updateGeometry( _geometry );

      setGeometry( _geometry );
      render();

      setQueryString( 'commands', event.target.value.trim() );

      event.target.setCustomValidity( '' );
    } catch ( error ) {
      event.target.setCustomValidity( 'Invalid function' );
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

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.95
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    var textarea = document.getElementById( 'textarea-commands' );
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls while textarea is focused.
    textarea.addEventListener( 'keydown', function( event ) {
      event.stopPropagation();
    });

    textarea.value = getQueryParam( 'commands' ) || '';
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

})();
