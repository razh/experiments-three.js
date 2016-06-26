/* eslint-env es6 */
/*
global
THREE
createNumericInput
remove
round
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

  let container;

  let scene, camera, renderer;
  let raycaster;
  let mouse;

  let geometry, material, mesh;
  let wireframe;
  let geometryLabels;

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

    return geometries.reduce( ( a, b ) => {
      a.merge( b );
      return a;
    })
  }

  function computeBoundingBoxes( geometries ) {
    if ( !Array.isArray( geometries ) ) {
      geometries.computeBoundingBox();
      return [ geometries.boundingBox ];
    }

    return geometries.map( geometry => {
      geometry.computeBoundingBox();
      return geometry.boundingBox;
    });
  }

  function createBoundingBoxLabels( boundingBoxes ) {
    return boundingBoxes.map( ( boundingBox, index ) => {
      const label = createTextLabel( index );
      label.scale.multiplyScalar( 0.5 );
      label.material.depthTest = false;
      boundingBox.center( label.position );
      return label;
    });
  }

  function getQueryParam( key ) {
    const params = window.location.search
      .slice( 1 )
      .split( '&' )
      .reduce( ( object, pair ) => {
        pair = pair.split( '=' ).map( decodeURIComponent );
        object[ pair[0] ] = pair[1];
        return object;
      }, {} );

    return params[ key ];
  }

  function setQueryString( key, value ) {
    const hash = (
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

  const geometryMethods = [
    'rotateX',
    'rotateY',
    'rotateZ',
    'translate',
    'scale'
  ];

  const shorthandGeometryMethods = [ 'rx', 'ry', 'rz', 't', 's' ];

  const reargGeometryMethods = geometryMethods.map( reargMethod );

  function rearg( fn ) {
    return options => geometry => fn( geometry, options );
  }

  const reargAlign = rearg( alignBox );
  const reargColors = rearg( applyBoxVertexColors );
  const reargTranslateVertices = rearg( translateBoxVertices );
  const reargScaleVertices = rearg( scaleBoxVertices );

  function onInput( event ) {
    try {
      const args = {
        keys: [
          'THREE',
          '_',
          '$$',
          'align',
          'color',
          '$translate',
          '$t',
          '$scale',
          '$s'
        ]
          .concat( geometryMethods )
          .concat( shorthandGeometryMethods ),
        values: [
          THREE,
          createBoxGeometry,
          mergeGeometries,
          reargAlign,
          reargColors,
          reargTranslateVertices,
          reargTranslateVertices,
          reargScaleVertices,
          reargScaleVertices
        ]
          .concat( reargGeometryMethods )
          .concat( reargGeometryMethods )
      };

      const fn = new Function( args.keys, event.target.value );

      const _geometries = fn( ...args.values );
      // Add geometry labels.
      remove( geometryLabels );
      geometryLabels = new THREE.Group();
      createBoundingBoxLabels( computeBoundingBoxes( _geometries ) )
        .map( label => geometryLabels.add( label ) );
      scene.add( geometryLabels );

      const _geometry = mergeGeometries( _geometries );
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

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#777' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    const axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 4, 0.4 );
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MultiMaterial(
     createBoxTextures().map( texture =>
        new THREE.MeshStandardMaterial({
          emissive: '#777',
          emissiveMap: texture,
          shading: THREE.FlatShading,
          transparent: true,
          opacity: 0.95,
          vertexColors: THREE.VertexColors
        })
      )
    );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    const textarea = document.getElementById( 'textarea-commands' );
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls while textarea is focused.
    textarea.addEventListener( 'keydown', event => event.stopPropagation() );

    textarea.value = getQueryParam( 'commands' ) || 'return _([1, 1, 1])';
    textarea.dispatchEvent( new Event( 'input' ) );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  const debugEl = document.querySelector( '.debug' );

  function formatNumber( precision = 2 ) {
    return number => ( number < 0 ? '' : '\u00a0' ) + number.toFixed( precision );
  }

  document.addEventListener( 'mousemove', event => {
    mouse.x =  ( event.clientX / renderer.domElement.width  ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.height ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObject( mesh );
    if ( intersections.length ) {
      const intersection = intersections[0];
      const point = intersection.point;

      debugEl.textContent = point.toArray().map( formatNumber() ).join( ', ' );
    } else {
      debugEl.textContent = '';
    }
  });

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
}());
