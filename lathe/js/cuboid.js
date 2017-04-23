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

  let container;

  let scene, camera, renderer;

  let geometry, material, mesh;
  let baseGeometry;
  let wireframe;
  let vertexHelpers;
  let vertexLabels;

  let transformControls;
  let vertexObject;

  const dispatcher = new THREE.EventDispatcher();

  const config = {
    width: 1,
    height: 1,
    depth: 1,
  };

  const state = {
    selectedVertices: [],
    selectedVertex: null,
    transform: vertices => vertices,
  };

  const textareas = {
    commands: document.getElementById( 'textarea-commands' ),
    delta: document.getElementById( 'textarea-delta' ),
    xyz: document.getElementById( 'textarea-xyz' ),
    xy: document.getElementById( 'textarea-xy' ),
    yz: document.getElementById( 'textarea-yz' ),
    xz: document.getElementById( 'textarea-xz' ),
  };

  //  0.001
  const PRECISION = 3;

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
      transformControls.attach( vertexObject );
    } else {
      transformControls.detach();
    }
  }

  function setSelectedVertices( vertices = [] ) {
    state.selectedVertices = vertices;
    createVertexHelpers( vertices );
    setSelectedVertex( vertices[0] );
  }

  function createVertexHelpers( vertices ) {
    if ( vertexHelpers ) {
      vertexHelpers.forEach( remove );
    }

    vertexHelpers = vertices.map( vertex => {
      const vertexHelper = createVertexHelper( vertex, 0.15 );
      scene.add( vertexHelper );
      return vertexHelper;
    });
  }

  function updateVertexHelpers( vertices ) {
    vertices.map(( vertex, index ) => {
      vertexHelpers[ index ].position.copy( vertex );
    });
  }

  function createVertexLabels( vertices ) {
    vertexLabels = vertices.map(( vertex, index ) => {
      const sprite = createTextLabel( index );
      sprite.scale.multiplyScalar( 0.5 );
      scene.add( sprite );
      return sprite;
    });
  }

  function updateVertexLabels( vertices ) {
    vertices.map(( vertex, index ) => {
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
    return lines
      .split( '\n' )
      .map( line => line.split( ' ' ).map( parseFloat ) );
  }

  function toInput( vertices ) {
    return vertices.map( vertex => {
      return vertex.toArray().map( round( PRECISION ) ).join( ' ' );
    }).join( '\n' );
  }

  function onInput( event ) {
    const arrays = fromInput( event.target.value );

    arrays.forEach(( array, index ) => {
      geometry.vertices[ index ].fromArray( array );
    });

    forceGeometryUpdate();
  }

  function createVertexMap( vertices, componentKeys ) {
    const vertexMap = {};

    const precisionPoints = 4;
    const precision = Math.pow( 10, precisionPoints );

    vertices.forEach( vertex => {
      const key = componentKeys.map( componentKey => {
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
  const cursorEventTypes = [ 'click', 'focus', 'keydown', 'select' ];

  function getSelectionLineRange( event ) {
    const { target } = event;

    return [
      target.value.slice( 0, target.selectionStart ).split( '\n' ).length - 1,
      target.value.slice( 0, target.selectionEnd ).split( '\n' ).length - 1,
    ];
  }

  function createComponentInput( textarea, components ) {
    const keys = components.split( '' );

    let vertexMap;
    let vertexKeys;

    function toComponentInput( vertices ) {
      vertexMap = createVertexMap( vertices, keys );
      vertexKeys = Object.keys( vertexMap );

      return vertexKeys.map( vertexKey => {
        const vertex = vertexMap[ vertexKey ][0];

        return keys
          .map( key => vertex[ key ] )
          .map( round( PRECISION ) )
          .join( ' ' );
      }).join( '\n' );
    }

    function onComponentInput( event ) {
      const arrays = fromInput( event.target.value );

      arrays.forEach(( array, index ) => {
        const vertexKey = vertexKeys[ index ];
        const vertices = vertexMap[ vertexKey ];

        keys.forEach(( key, keyIndex ) => {
          vertices.forEach( vertex => {
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
    dispatcher.addEventListener( 'change', () => {
      if ( textarea !== document.activeElement ) {
        setValue();
      }
    });

    function onComponentSelectionChange( event ) {
      const selectionLineRange = getSelectionLineRange( event );
      const selectedVertices = [];

      for ( let i = selectionLineRange[0]; i <= selectionLineRange[1]; i++ ) {
        const vertexKey = vertexKeys[i];
        const vertices = vertexMap[ vertexKey ];

        if ( vertices ) {
          selectedVertices.push( ...vertices );
        }
      }

      setSelectedVertices( selectedVertices );
      render();
    }

    cursorEventTypes.forEach( eventType => {
      textarea.addEventListener( eventType, onComponentSelectionChange );
    });
  }

  function translateBoxVerticesHelper( vertices, vectors ) {
    // translateBoxVertices() expects an instance of THREE.Geometry.
    return translateBoxVertices({ vertices }, vectors );
  }

  function onCommandsInput( event ) {
    try {
      // Partial application of translateBoxVertices() as `t`.
      const fn = new Function( [ 't', 'vertices' ], event.target.value )
        .bind( undefined, translateBoxVerticesHelper );

      const _geometry = new THREE.Geometry().copy( baseGeometry );
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
    const vector = new THREE.Vector3();

    return baseGeometry.vertices.map(( a, i ) => {
      const b = geometry.vertices[i];

      return vector
        .subVectors( a, b )
        .toArray()
        .map( round( precision ) )
        .join( ' ' );
    }).join( '\n' );
  }

  function setQueryString() {
    const _round = round( PRECISION );

    const params = {
      width: _round(config.width ),
      height: _round( config.height ),
      depth: _round( config.depth ),
      commands: textareas.commands.value.trim(),
    };

    const query = Object.keys( params )
      .map( key => {
        const value = params[ key ];
        if ( value ) {
          return [ key, value ].map( encodeURIComponent ).join( '=' );
        }
      })
      .filter( Boolean )
      .join( '&' );

    window.history.replaceState( '', '', `?${ query }` );
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

    scene.add( new THREE.AmbientLight( '#333' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    const axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 4, 20 );
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    // Parse query string.
    const params = new URLSearchParams( window.location.search );

    // Set default values.
    config.width = parseFloat( params.get( 'width' ) ) || config.width;
    config.height = parseFloat( params.get( 'height' ) ) || config.height;
    config.depth = parseFloat( params.get( 'depth' ) ) || config.depth;
    textareas.commands.value = params.get( 'commands' ) || '';

    // Build mesh.
    baseGeometry = createBaseGeometry( config );
    geometry = baseGeometry.clone();
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.95,
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );
    createVertexLabels( geometry.vertices );

    vertexObject = new THREE.Object3D();
    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    scene.add( vertexObject );
    scene.add( transformControls );

    transformControls.addEventListener( 'change', () => {
      if ( state.selectedVertex ) {
        state.selectedVertex.copy( vertexObject.position );
        forceGeometryUpdate();
      }
    });

    Object.keys( textareas ).forEach( key => {
      const textarea = textareas[ key ];

      createNumericInput( textarea );

      // Disable OrbitControls while in textarea.
      textarea.addEventListener( 'keydown', event => event.stopPropagation() );
    });

    // 3D.
    function setValue() {
      textareas.xyz.value = toInput( geometry.vertices );
    }

    setValue();
    textareas.xyz.addEventListener( 'input', onInput );
    dispatcher.addEventListener( 'change', () => {
      if ( textareas.xyz !== document.activeElement ) {
        setValue();
      }
    });

    function onSelectionChange( event ) {
      const selectionLineRange = getSelectionLineRange( event );
      const selectedVertices = [];

      for ( let i = selectionLineRange[0]; i <= selectionLineRange[1]; i++ ) {
        selectedVertices.push( geometry.vertices[i] );
      }

      setSelectedVertices( selectedVertices );
      render();
    }

    cursorEventTypes.forEach( eventType => {
      textareas.xyz.addEventListener( eventType, onSelectionChange );
    });

    // 2D.
    [ 'xy', 'yz', 'xz' ].forEach( components => {
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

    const gui = new dat.GUI({
      width: 320,
    });

    [ 'width', 'height', 'depth' ].forEach( dimension => {
      gui.add( config, dimension, 0.1, 4 )
        .step( 0.1 )
        .listen()
        .onChange( value => {
          config[ dimension ] = value;
          baseGeometry = createBaseGeometry( config );

          const _geometry = new THREE.Geometry().copy( baseGeometry );
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

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
}());
