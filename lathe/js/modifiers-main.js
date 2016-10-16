/* global THREE, dat, modifiers, createNumericInput, createViewports */
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
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 8,
    heightSegments: 8,
    depthSegments: 8
  };

  var transformVertex = function() {};

  // Set from window.location.search.
  window.location.search
    .slice( 1 )
    .split( '&' )
    .forEach(function( pair ) {
      pair = pair.split( '=' );

      var key = pair[0];
      if ( textareas[ key ] ) {
        textareas[ key ].value = decodeURIComponent( pair[1] );
      }
    });

  function createBaseGeometry( options ) {
    return new THREE.BoxGeometry(
      options.width, options.height, options.depth,
      options.widthSegments, options.heightSegments, options.depthSegments
    );
  }

  function createWireframe() {
    if ( wireframe && wireframe.parent ) {
      wireframe.parent.remove( wireframe );
    }

    wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry( mesh.geometry ),
      new THREE.LineBasicMaterial()
    );

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

  function onInput( event ) {
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
      if ( event ) {
        event.target.setCustomValidity( 'Invalid function' );
      }

      console.error( error );
      return;
    }

    if ( event ) {
      // Set valid.
      event.target.setCustomValidity( '' );
    }

    var query = Object.keys( textareas )
      .map(function( key ) {
        var value = textareas[ key ].value.trim();
        if ( value ) {
          return [ key, value ].map( encodeURIComponent ).join( '=' );
        }
      })
      .filter( Boolean )
      .join( '&' );

    // Update location.
    var hash = window.location.pathname + '?' + query;

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

    views = createViewports( viewports );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 8, 8, 0 );
    scene.add( light );

    var axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    var gridHelper = new THREE.GridHelper( 2, 20 );
    gridHelper.position.y = -1;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    baseGeometry = createBaseGeometry( config );
    geometry = baseGeometry;
    material = new THREE.MeshStandardMaterial({ shading: THREE.FlatShading });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );

    Object.keys( textareas ).forEach(function( key ) {
      var textarea = textareas[ key ];

      createNumericInput( textarea );
      textarea.addEventListener( 'input', onInput );

      // Prevent input from toggling dat.gui via hide shortcut ('h').
      textarea.addEventListener( 'keydown', function( event ) {
        event.stopPropagation();
      });
    });

    var gui = new dat.GUI();

    [ 'width', 'height', 'depth' ].forEach(function( dimension ) {
      gui.add( config, dimension, 0.1, 4 )
        .listen()
        .onChange(function( value ) {
          config[ dimension ] = value;
          baseGeometry = createBaseGeometry( config );
          transformGeometry();
        });
    });

    [ 'widthSegments', 'heightSegments', 'depthSegments' ].forEach(function( segmentCount ) {
      gui.add( config, segmentCount, 1, 16 )
        .step( 1 )
        .listen()
        .onChange(function( count ) {
          config[ segmentCount ] = count;
          baseGeometry = createBaseGeometry( config );
          transformGeometry();
        });
    });
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
