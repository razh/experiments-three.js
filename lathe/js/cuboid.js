/*
global
THREE
dat
createNumericInput
remove
round
createVertexHelper
updateGeometry
createTextLabel
translateBoxVertices
*/
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;
  var baseGeometry;
  var wireframe;
  var vertexHelpers;
  var vertexLabels;

  var transformControls;
  var vertexObject;

  var dispatcher = new THREE.EventDispatcher();

  var config = {
    width: 1,
    height: 1,
    depth: 1
  };

  var state = {
    selectedVertices: [],
    selectedVertex: null,
    transform: function( vertices ) { return vertices; }
  };

  var textareas = {
    commands: document.getElementById( 'textarea-commands' ),
    delta: document.getElementById( 'textarea-delta' ),
    xyz: document.getElementById( 'textarea-xyz' ),
    xy: document.getElementById( 'textarea-xy' ),
    yz: document.getElementById( 'textarea-yz' ),
    xz: document.getElementById( 'textarea-xz' )
  };

  //  0.001
  var PRECISION = 3;

  function createBaseGeometry( options ) {
    return new THREE.BoxGeometry(
      options.width,
      options.height,
      options.depth
    );
  }

  function createWireframe() {
    remove( wireframe );

    wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry( mesh.geometry ),
      new THREE.LineBasicMaterial()
    );

    scene.add( wireframe );
  }

  function setSelectedVertex( vertex ) {
    if ( vertex === state.selectedVertex ) {
      return;
    }

    state.selectedVertex = vertex;

    if ( state.selectedVertex ) {
      transformControls.attach( vertexObject )
    } else {
      transformControls.detach();
    }
  }

  function setSelectedVertices( vertices ) {
    vertices = vertices || [];
    state.selectedVertices = vertices;
    createVertexHelpers( vertices );
    setSelectedVertex( vertices[0] );
  }

  function createVertexHelpers( vertices ) {
    if ( vertexHelpers ) {
      vertexHelpers.forEach( remove );
    }

    vertexHelpers = vertices.map(function( vertex ) {
      var vertexHelper = createVertexHelper( vertex, 0.15 );
      scene.add( vertexHelper );
      return vertexHelper;
    });
  }

  function updateVertexHelpers( vertices ) {
    vertices.map(function( vertex, index ) {
      vertexHelpers[ index ].position.copy( vertex );
    });
  }

  function createVertexLabels( vertices ) {
    vertexLabels = vertices.map(function( vertex, index ) {
      var sprite = createTextLabel( index );
      sprite.scale.multiplyScalar( 0.5 );
      scene.add( sprite );
      return sprite;
    });
  }

  function updateVertexLabels( vertices ) {
    vertices.map(function( vertex, index ) {
      vertexLabels[ index ].position.copy( vertex );
    });
  }

  function setGeometry( _geometry ) {
    geometry = _geometry;
    mesh.geometry = geometry;
    mesh.needsUpdate = true;
  }

  function forceGeometryUpdate() {
    updateGeometry( geometry );
    createWireframe( mesh );

    render();

    dispatcher.dispatchEvent({ type: 'change' });
  }

  function fromInput( lines ) {
    return lines.split( '\n' ).map(function( line ) {
      return line.split( ' ' ).map( parseFloat );
    });
  }

  function toInput( vertices ) {
    return vertices.map(function( vertex ) {
      return vertex.toArray().map( round( PRECISION ) ).join( ' ' );
    }).join( '\n' );
  }

  function onInput( event ) {
    var arrays = fromInput( event.target.value );

    arrays.forEach(function( array, index ) {
      geometry.vertices[ index ].fromArray( array );
    });

    forceGeometryUpdate();
  }

  function createVertexMap( vertices, componentKeys ) {
    var vertexMap = {};

    var precisionPoints = 4;
    var precision = Math.pow( 10, precisionPoints );

    vertices.forEach(function( vertex ) {
      var key = componentKeys.map(function( componentKey ) {
        return Math.round( vertex[ componentKey ] * precision );
      }).join( '_' );

      if ( !vertexMap[ key ] ) {
        vertexMap[ key ] = [];
      }

      vertexMap[ key ].push( vertex );
    });

    return vertexMap;
  }

  // Events that might affect cursor position.
  var cursorEventTypes = [ 'click', 'focus', 'keydown', 'select' ];

  function getSelectionLineRange( event ) {
    var target = event.target;

    return [
      target.value.substr( 0, target.selectionStart ).split( '\n' ).length - 1,
      target.value.substr( 0, target.selectionEnd ).split( '\n' ).length - 1
    ];
  }

  function createComponentInput( textarea, components ) {
    var keys = components.split( '' );

    var vertexMap;
    var vertexKeys;

    function toComponentInput( vertices ) {
      vertexMap = createVertexMap( vertices, keys );
      vertexKeys = Object.keys( vertexMap );

      return vertexKeys.map(function( vertexKey ) {
        var vertex = vertexMap[ vertexKey ][0];

        return keys
          .map(function( key ) {
            return vertex[ key ];
          })
          .map( round( PRECISION ) )
          .join( ' ' );
      }).join( '\n' );
    }

    function onComponentInput( event ) {
      var arrays = fromInput( event.target.value );

      arrays.forEach(function( array, index ) {
        var vertexKey = vertexKeys[ index ];
        var vertices = vertexMap[ vertexKey ];

        keys.forEach(function( key, keyIndex ) {
          vertices.forEach(function( vertex ) {
            vertex[ key ] = array[ keyIndex ];
          });
        });
      });

      forceGeometryUpdate();
    }

    function setValue() {
      textarea.value = toComponentInput( geometry.vertices );
    }

    setValue();
    textarea.addEventListener( 'input', onComponentInput );
    dispatcher.addEventListener( 'change', function() {
      if ( textarea !== document.activeElement ) {
        setValue();
      }
    });

    function onComponentSelectionChange( event ) {
      var selectionLineRange = getSelectionLineRange( event );
      var selectedVertices = [];

      for ( var i = selectionLineRange[0]; i <= selectionLineRange[1]; i++ ) {
        var vertexKey = vertexKeys[i];
        var vertices = vertexMap[ vertexKey ];

        if ( vertices ) {
          vertices.forEach(function( vertex ) {
            selectedVertices.push( vertex )
          });
        }
      }

      setSelectedVertices( selectedVertices );
      render();
    }

    cursorEventTypes.forEach(function( eventType ) {
      textarea.addEventListener( eventType, onComponentSelectionChange );
    });
  }

  function translateBoxVerticesHelper( vertices, vectors ) {
    // translateBoxVertices() expects an instance of THREE.Geometry.
    return translateBoxVertices({ vertices: vertices }, vectors );
  }

  function onCommandsInput( event ) {
    try {
      // Partial application of translateBoxVertices() as `t`.
      var fn = new Function( [ 't', 'vertices' ], event.target.value )
        .bind( undefined, translateBoxVerticesHelper );

      var _geometry = new THREE.Geometry().copy( baseGeometry );
      fn( _geometry.vertices );

      setGeometry( _geometry );
      forceGeometryUpdate();

      // Update transform function only if no errors have occurred.
      state.transform = fn;
      setQueryString();

      event.target.setCustomValidity( '' );
    } catch ( error ) {
      event.target.setCustomValidity( 'Invalid function' );
    }
  }

  function computeDeltaString( precision ) {
    var vector = new THREE.Vector3();

    return baseGeometry.vertices.map(function( a, i ) {
      var b = geometry.vertices[i];

      return vector
        .subVectors( a, b )
        .toArray()
        .map( round( precision ) )
        .join( ' ' );
    }).join( '\n' );
  }

  function setQueryString() {
    var _round = round( PRECISION );

    var params = {
      width: _round(config.width ),
      height: _round( config.height ),
      depth: _round( config.depth ),
      commands: textareas.commands.value.trim()
    };

    var query = Object.keys( params )
      .map(function( key ) {
        var value = params[ key ];
        if ( value ) {
          return [ key, value ].map( encodeURIComponent ).join( '=' );
        }
      })
      .filter( Boolean )
      .join( '&' );

    var hash = (
      window.location.origin +
      window.location.pathname +
      '?' + query
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
    camera.position.set( 0, 0, 8 );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    var axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    var gridHelper = new THREE.GridHelper( 4, 20 );
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    // Parse query string.
    var params = window.location.search
      .slice( 1 )
      .split( '&' )
      .reduce(function( object, pair ) {
        pair = pair.split( '=' ).map( decodeURIComponent );
        object[ pair[0] ] = pair[1];
        return object;
      }, {} );

    // Set default values.
    config.width = parseFloat( params.width ) || config.width;
    config.height = parseFloat( params.height ) || config.height;
    config.depth = parseFloat( params.depth ) || config.depth;
    textareas.commands.value = params.commands || '';

    // Build mesh.
    baseGeometry = createBaseGeometry( config );
    geometry = baseGeometry.clone();
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.95
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );
    createVertexLabels( geometry.vertices );

    vertexObject = new THREE.Object3D();
    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    scene.add( vertexObject );
    scene.add( transformControls );

    transformControls.addEventListener( 'change', function() {
      if ( state.selectedVertex ) {
        state.selectedVertex.copy( vertexObject.position );
        forceGeometryUpdate();
      }
    });

    Object.keys( textareas ).forEach(function( key ) {
      var textarea = textareas[ key ];

      createNumericInput( textarea );

      // Disable OrbitControls while in textarea.
      textarea.addEventListener( 'keydown', function( event ) {
        event.stopPropagation();
      });
    });

    // 3D.
    function setValue() {
      textareas.xyz.value = toInput( geometry.vertices );
    }

    setValue();
    textareas.xyz.addEventListener( 'input', onInput );
    dispatcher.addEventListener( 'change', function() {
      if ( textareas.xyz !== document.activeElement ) {
        setValue();
      }
    });

    function onSelectionChange( event ) {
      var selectionLineRange = getSelectionLineRange( event );
      var selectedVertices = [];

      for ( var i = selectionLineRange[0]; i <= selectionLineRange[1]; i++ ) {
        selectedVertices.push( geometry.vertices[i] );
      }

      setSelectedVertices( selectedVertices );
      render();
    }

    cursorEventTypes.forEach(function( eventType ) {
      textareas.xyz.addEventListener( eventType, onSelectionChange );
    });

    // 2D.
    [ 'xy', 'yz', 'xz' ].forEach(function( components ) {
      createComponentInput( textareas[ components ], components );
    });

    // Delta.
    function setDeltaValue() {
      textareas.delta.value = computeDeltaString( 2 );
    }

    setDeltaValue();
    dispatcher.addEventListener( 'change', setDeltaValue );

    // Commands.
    textareas.commands.addEventListener( 'input', onCommandsInput );
    // Set from query string.
    if ( textareas.commands.value ) {
      textareas.commands.dispatchEvent( new Event( 'input' ) );
    }

    var gui = new dat.GUI({
      width: 320
    });

    [ 'width', 'height', 'depth' ].forEach(function( dimension ) {
      gui.add( config, dimension, 0.1, 4 )
        .step( 0.1 )
        .listen()
        .onChange(function( value ) {
          config[ dimension ] = value;
          baseGeometry = createBaseGeometry( config );

          var _geometry = new THREE.Geometry().copy( baseGeometry );
          state.transform( _geometry.vertices );

          setGeometry( _geometry );
          forceGeometryUpdate();

          setQueryString();
        });
    });
  }

  function render() {
    if ( state.selectedVertex ) {
      vertexObject.position.copy( state.selectedVertex );
      transformControls.update();
    }

    updateVertexHelpers( state.selectedVertices );
    updateVertexLabels( geometry.vertices );
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
