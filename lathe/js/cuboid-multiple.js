/* eslint-env es6 */
/*
global
THREE,
createNumericInput
remove,
updateGeometry
createTextLabel
createBoxTextures
alignBox
applyBoxVertexColors
defaultsVertexColor
translateBoxVertices
scaleBoxVertices
*/
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var geometry, material, mesh;
  var wireframe;
  var geometryLabels;

  function setGeometry( _geometry ) {
    geometry = _geometry;
    mesh.geometry = geometry;
    mesh.needsUpdate = true;
  }

  function createBoxGeometry( parameters, ...transforms ) {
    const geometry = new THREE.BoxGeometry( ...parameters );

    transforms.forEach( transform => transform( geometry ) );

    return geometry;
  }

  function createWireframe() {
    remove( wireframe );
    wireframe = new THREE.WireframeHelper( mesh );
    scene.add( wireframe );
  }

  function mergeGeometries( geometries ) {
    if ( !Array.isArray( geometries ) ) {
      return geometries;
    }

    return geometries.reduce(function( a, b ) {
      a.merge( b );
      return a;
    })
  }

  function computeBoundingBoxes( geometries ) {
    if ( !Array.isArray( geometries ) ) {
      geometries.computeBoundingBox();
      return [ geometries.boundingBox ];
    }

    return geometries.map(function( geometry ) {
      geometry.computeBoundingBox();
      return geometry.boundingBox;
    });
  }

  function createBoundingBoxLabels( boundingBoxes ) {
    return boundingBoxes.map(function( boundingBox, index ) {
      var label = createTextLabel( index );
      label.scale.multiplyScalar( 0.5 );
      label.material.depthTest = false;
      boundingBox.center( label.position );
      return label;
    });
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
      '?' + [ key, value ].map( encodeURIComponent ).join( '=' )
    );

    window.history.replaceState( '', '', hash );
  }

  function reargMethod( key ) {
    return ( ...args ) => {
      return geometry => {
        geometry[ key ]( ...args );
        return geometry;
      }
    };
  }

  var geometryMethods = [
    'rotateX',
    'rotateY',
    'rotateZ',
    'translate',
    'scale'
  ];

  var shorthandGeometryMethods = [ 'rx', 'ry', 'rz', 't', 's' ];

  var reargGeometryMethods = geometryMethods.reduce(function( fns, key ) {
    fns.push( reargMethod( key ) );
    return fns;
  }, [] );

  function rearg( fn ) {
    return options => geometry => fn( geometry, options );
  }

  const reargAlign = rearg( alignBox );
  const reargColors = rearg( applyBoxVertexColors );
  const reargTranslateVertices = rearg( translateBoxVertices );
  const reargScaleVertices = rearg( scaleBoxVertices );

  function onInput( event ) {
    try {
      var args = {
        keys: [ '_', '$$', 'align', 'color', '$t', '$s' ]
          .concat( geometryMethods )
          .concat( shorthandGeometryMethods ),
        values: [
          createBoxGeometry,
          mergeGeometries,
          reargAlign,
          reargColors,
          reargTranslateVertices,
          reargScaleVertices
        ]
          .concat( reargGeometryMethods )
          .concat( reargGeometryMethods )
      };

      var fn = new Function( args.keys, event.target.value );

      var _geometries = fn.apply( undefined, args.values );
      // Add geometry labels.
      remove( geometryLabels );
      geometryLabels = new THREE.Group();
      createBoundingBoxLabels( computeBoundingBoxes( _geometries ) )
        .map(function( label ) {
          geometryLabels.add( label );
        });
      scene.add( geometryLabels );

      var _geometry = mergeGeometries( _geometries );
      defaultsVertexColor( _geometry );
      updateGeometry( _geometry );

      setGeometry( _geometry );
      createWireframe( mesh );
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

    scene.add( new THREE.AmbientLight( '#777' ) );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    var axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    var gridHelper = new THREE.GridHelper( 4, 0.4 );
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MultiMaterial(
     createBoxTextures().map(function( texture ) {
        return new THREE.MeshStandardMaterial({
          emissive: '#777',
          emissiveMap: texture,
          shading: THREE.FlatShading,
          transparent: true,
          opacity: 0.95,
          vertexColors: THREE.VertexColors
        });
      })
    );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    var textarea = document.getElementById( 'textarea-commands' );
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls while textarea is focused.
    textarea.addEventListener( 'keydown', function( event ) {
      event.stopPropagation();
    });

    textarea.value = getQueryParam( 'commands' ) || 'return _([1, 1, 1])';
    textarea.dispatchEvent( new Event( 'input' ) );
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
