/* global THREE, dat, modifiers */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;
  var views;

  var baseGeometry;
  var geometry, material, mesh;
  var wireframe;

  var textarea = document.getElementById( 'textarea' );
  var viewports = document.getElementById( 'viewports' );

  var config = {
    widthSegments: 8,
    heightSegments: 8,
    depthSegments: 8
  };

  var transformVertex = function() {};

  // Set from window.location.hash.
  var hash = decodeURIComponent( window.location.hash ).slice( 1 );
  textarea.value = hash || '';
  onInput();

  function createWireframe() {
    if ( wireframe && wireframe.parent ) {
      wireframe.parent.remove( wireframe );
    }

    wireframe = new THREE.WireframeHelper( mesh );
    scene.add( wireframe );
  }

  function transformGeometry() {
    var _geometry = new THREE.Geometry().copy( baseGeometry );
    _geometry.vertices.forEach( transformVertex );
    _geometry.computeFaceNormals();
    _geometry.computeVertexNormals();

    geometry = _geometry;
    mesh.geometry = geometry;
    mesh.needsUpdate = true;

    createWireframe( mesh );

    render();
  }

  function onInput() {
    var lines = textarea.value.split( '\n' );

    var x = lines[0] || 'x';
    var y = lines[1] || 'y';
    var z = lines[2] || 'z';

    try {
      var fn = new Function(
        [ 'x', 'y', 'z', 'xt', 'yt', 'zt' ],
        'return [' + x + ', ' + y + ', ' + z + '];'
      );

      transformVertex = modifiers.parametric( baseGeometry, function( vector, xt, yt, zt ) {
        vector.fromArray( fn( vector.x, vector.y, vector.z, xt, yt, zt ) );
      });

      transformGeometry();
    } catch ( error ) {
      console.error( error );
      return;
    }

    // Update location.
    var hash = (
      window.location.origin +
      window.location.pathname +
      '#' + encodeURIComponent( textarea.value )
    );

    window.history.replaceState( '', '', hash );
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
    camera.position.set( 0, 1, 2 );

    views = [ 'x', 'y', 'z' ].reduce(function( views, axis ) {
      var _renderer = new THREE.WebGLRenderer({ antialias: true });
      _renderer.setPixelRatio( window.devicePixelRatio );
      _renderer.setSize( 128, 128 );
      viewports.appendChild( _renderer.domElement );

      var size = 1;
      var _camera = new THREE.OrthographicCamera( -size, size, size, -size );
      _camera.position[ axis ] = 2;
      _camera.lookAt( new THREE.Vector3() );

      views[ axis ] = {
        renderer: _renderer,
        camera: _camera
      };

      return views;
    }, {} );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    baseGeometry = new THREE.BoxGeometry(
      1, 1, 1,
      config.widthSegments, config.heightSegments, config.depthSegments
    );

    geometry = baseGeometry;
    material = new THREE.MeshStandardMaterial({ shading: THREE.FlatShading });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    createWireframe( mesh );

    var light = new THREE.DirectionalLight();
    light.position.set( 8, 8, 0 );
    scene.add( light );

    scene.add( new THREE.AmbientLight( '#333' ) );

    textarea.addEventListener( 'input', onInput );

    // Prevent input from toggling dat.gui via hide shortcut ('h').
    textarea.addEventListener( 'keydown', function( event ) {
      event.stopPropagation();
    });

    var gui = new dat.GUI();

    [ 'widthSegments', 'heightSegments', 'depthSegments' ].forEach(function( segmentCount ) {
      gui.add( config, segmentCount, 1, 16 )
        .step( 1 )
        .listen()
        .onChange(function( count ) {
          config[ segmentCount ] = count;

          baseGeometry = new THREE.BoxGeometry(
            1, 1, 1,
            config.widthSegments, config.heightSegments, config.depthSegments
          );

          transformGeometry();
        });
    })
  }

  function render() {
    renderer.render( scene, camera );

    Object.keys( views ).forEach(function( key ) {
      var view = views[ key ];
      view.renderer.render( scene, view.camera );
    });
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
