/* global THREE, createNumericInput */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;
  var wireframe;
  var vertexHelpers;

  var transformControls;
  var vertexObject;
  var selectedVertex;

  var dispatcher = new THREE.EventDispatcher();

  var textareas = {
    xyz: document.getElementById( 'textarea-xyz' ),
    xy: document.getElementById( 'textarea-xy' ),
    yz: document.getElementById( 'textarea-yz' ),
    xz: document.getElementById( 'textarea-xz' )
  };

  function createWireframe() {
    if ( wireframe && wireframe.parent ) {
      wireframe.parent.remove( wireframe );
    }

    wireframe = new THREE.WireframeHelper( mesh );
    scene.add( wireframe );
  }

  function setSelectedVertex( vertex ) {
    if ( vertex === selectedVertex ) {
      return;
    }

    selectedVertex = vertex;

    if ( selectedVertex ) {
      vertexObject.position.copy( selectedVertex );
      transformControls.attach( vertexObject )
    } else {
      transformControls.detach()
    }
  }

  function createVertexHelpers( vertices ) {
    var size = 0.15;

    if ( vertexHelpers ) {
      vertexHelpers.forEach(function( vertexHelper ) {
        if ( vertexHelper && vertexHelper.parent ) {
          vertexHelper.parent.remove( vertexHelper );
        }
      });
    }

    vertexHelpers = vertices.map(function( vertex ) {
      var vertexHelper = new THREE.Mesh(
        new THREE.BoxBufferGeometry( size, size, size ),
        new THREE.MeshBasicMaterial()
      );

      vertexHelper.position.copy( vertex );
      scene.add( vertexHelper );
      return vertexHelper;
    });
  }

  function forceGeometryUpdate() {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    geometry.normalsNeedUpdate = true;
    geometry.verticesNeedUpdate = true;

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
      return vertex.toArray().join( ' ' );
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

        return keys.map(function( key ) {
          return vertex[ key ];
        }).join( ' ' );
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

      createVertexHelpers( selectedVertices );
      setSelectedVertex( selectedVertices[0] );
      render();
    }

    cursorEventTypes.forEach(function( eventType ) {
      textarea.addEventListener( eventType, onComponentSelectionChange );
    });
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

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );

    vertexObject = new THREE.Object3D();
    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    scene.add( vertexObject );
    scene.add( transformControls );

    transformControls.addEventListener( 'change', function() {
      if ( selectedVertex ) {
        selectedVertex.copy( vertexObject.position );
        forceGeometryUpdate();
      }
    });

    Object.keys( textareas ).forEach(function( key ) {
      createNumericInput( textareas[ key ] );
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

      createVertexHelpers( selectedVertices );
      setSelectedVertex( selectedVertices[0] );
      render();
    }

    cursorEventTypes.forEach(function( eventType ) {
      textareas.xyz.addEventListener( eventType, onSelectionChange );
    });

    // 2D.
    [ 'xy', 'yz', 'xz' ].forEach(function( components ) {
      createComponentInput( textareas[ components ], components );
    });
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
