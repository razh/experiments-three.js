/* global THREE, dat, modifiers */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;
  var views;

  var baseGeometry;
  var geometry, material, mesh;
  var wireframe;

  var textareas = {
    x: document.getElementById( 'textarea-x' ),
    y: document.getElementById( 'textarea-y' ),
    z: document.getElementById( 'textarea-z' )
  };

  var viewports = document.getElementById( 'viewports' );

  var config = {
    widthSegments: 8,
    heightSegments: 8,
    depthSegments: 8
  };

  var transformVertex = function() {};

  // Set from window.location.hash.
  window.location.hash
    .slice( 1 )
    .split( '&' )
    .forEach(function( pair ) {
      pair = pair.split( '=' );

      var key = pair[0];
      if ( textareas[ key ] ) {
        textareas[ key ].value = decodeURIComponent( pair[1] );
      }
    });

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
    var x = textareas.x.value.trim() || 'x';
    var y = textareas.y.value.trim() || 'y';
    var z = textareas.z.value.trim() || 'z';

    try {
      var fns = [ x, y, z ].map(function( body ) {
        // HACK: Check for no explicit return.
        if ( !/return/.test( body ) ) {
          body = 'return ' + body + ';';
        }

        return new Function(
          [ 'x', 'y', 'z', 'xt', 'yt', 'zt' ],
          body
        );
      });

      transformVertex = modifiers.parametric( baseGeometry, function( vector, xt, yt, zt ) {
        vector.fromArray(fns.map(function( fn ) {
          return fn( vector.x, vector.y, vector.z, xt, yt, zt );
        }));
      });

      transformGeometry();
    } catch ( error ) {
      console.error( error );
      return;
    }

    var query = Object.keys( textareas )
      .map(function( key ) {
        var value = textareas[ key ].value.trim();
        if ( value ) {
          return key + '=' + encodeURIComponent( value );
        }
      })
      .filter( Boolean )
      .join( '&' );

    // Update location.
    var hash = (
      window.location.origin +
      window.location.pathname +
      '#' + query
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

    var axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    scene.add( new THREE.AmbientLight( '#333' ) );

    Object.keys( textareas ).forEach(function( key ) {
      var textarea = textareas[ key ];

      textarea.addEventListener( 'input', onInput );

      // Prevent input from toggling dat.gui via hide shortcut ('h').
      textarea.addEventListener( 'keydown', function( event ) {
        event.stopPropagation();
      });
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
  onInput();
  render();

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

})();
