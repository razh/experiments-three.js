/* global THREE, createNumericInput */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;

  var dispatcher = new THREE.EventDispatcher();

  var textareas = {
    xyz: document.getElementById( 'textarea-xyz' ),
    xy: document.getElementById( 'textarea-xy' ),
    yz: document.getElementById( 'textarea-yz' ),
    xz: document.getElementById( 'textarea-xz' )
  };

  function forceGeometryUpdate() {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    geometry.normalsNeedUpdate = true;
    geometry.verticesNeedUpdate = true;

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

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading
    });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    scene.add( new THREE.AmbientLight( '#333' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

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
