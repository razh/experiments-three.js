/* eslint-env es6 */
/*
global
THREE
createNumericInput
remove
updateGeometry
createTextLabel
createBoxTextures
defaultVertexColors
geometryArguments
*/

(function() {
  'use strict';

  let container;

  let scene, camera, renderer;
  let raycaster;
  let mouse;

  let geometry, material, mesh;
  let wireframe;
  let debugMaterial;
  let geometryLabels;

  let DEBUG = true;

  function setGeometry( _geometry ) {
    if ( geometry ) {
      geometry.dispose();
    }

    geometry = _geometry;
    mesh.geometry = geometry;
    mesh.needsUpdate = true;
  }

  function applyTransforms( geometry, ...transforms ) {
    transforms.forEach( transform => transform( geometry ) );
    return geometry;
  }

  function createGeometryWrapper( value, ...transforms ) {
    let geometry;

    if ( value instanceof THREE.Geometry ) {
      geometry = value;
    } else if ( Array.isArray( value ) ) {
      geometry = new THREE.BoxGeometry( ...value );
    } else {
      return new THREE.Geometry();
    }

    return applyTransforms( geometry, ...transforms );
  }

  function createGeometryLabels( geometries ) {
    const visible = geometryLabels ? geometryLabels.visible : true;
    remove( geometryLabels );

    geometryLabels = new THREE.Group();
    geometryLabels.visible = visible;
    createBoundingBoxLabels( computeBoundingBoxes( geometries ) )
      .map( label => geometryLabels.add( label ) );

    scene.add( geometryLabels );
  }

  function createWireframe() {
    const visible = wireframe ? wireframe.visible : true;
    remove( wireframe );

    wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry( mesh.geometry ),
      new THREE.LineBasicMaterial()
    );

    wireframe.visible = visible;

    scene.add( wireframe );
  }

  function applyDefaultVertexColors( geometries ) {
    if ( !Array.isArray( geometries ) ) {
      return defaultVertexColors( geometry );
    }

    return geometries.map( geometry => defaultVertexColors( geometry ) );
  }

  function mergeGeometries( geometries, ...transforms ) {
    if ( !Array.isArray( geometries ) ) {
      return applyTransforms( geometries, ...transforms );
    }

    return geometries
      .map( geometry => applyTransforms( geometry, ...transforms ) )
      .reduce( ( a, b ) => {
        a.merge( b );
        return a;
      });
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

  const getBoundingBoxLabel = (function() {
    const labels = {};

    return index => {
      if ( labels[ index ] ) {
        return labels[ index ];
      }

      labels[ index ] = createTextLabel( index );
      return labels[ index ];
    };
  }());

  function createBoundingBoxLabels( boundingBoxes ) {
    return boundingBoxes.map( ( boundingBox, index ) => {
      const label = getBoundingBoxLabel( index );
      label.material.depthTest = false;
      boundingBox.getCenter( label.position );
      return label;
    });
  }

  function setQueryString( key, value ) {
    const params = new URLSearchParams();
    params.set( key, value );
    window.history.replaceState( '', '', `?${params.toString()}` );
  }

  function onInput( event ) {
    try {
      const args = {
        keys: geometryArguments.keys.concat([
          '_',
          '$$',
        ]),
        values: geometryArguments.values.concat([
          createGeometryWrapper,
          mergeGeometries,
        ]),
      };

      const fn = new Function( args.keys, event.target.value );

      const _geometries = fn( ...args.values );
      createGeometryLabels( _geometries );

      applyDefaultVertexColors( _geometries );
      const _geometry = mergeGeometries( _geometries );
      updateGeometry( _geometry );

      setGeometry( _geometry );
      createWireframe( mesh );
      render();

      setQueryString( 'commands', event.target.value.trim() );

      if ( !event.target.validity.valid ) {
        console.info( '' );
      }

      event.target.setCustomValidity( '' );
    } catch ( error ) {
      console.error( error );
      event.target.setCustomValidity( error );
    }

    event.target.form.querySelector('.js-validation-message').textContent = event.target.validationMessage;
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
    camera.position.set( 0, 0, 64 );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#777' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 0, 64, 64 );
    scene.add( light );

    const axisHelper = new THREE.AxisHelper( 16 );
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 32, 16 );
    gridHelper.position.y = -4;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );

    const materialParameters = {
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.95,
      vertexColors: THREE.VertexColors,
    };

    material = new THREE.MeshStandardMaterial( materialParameters );

    debugMaterial = new THREE.MultiMaterial(
     createBoxTextures().map( texture =>
        new THREE.MeshStandardMaterial(
          Object.assign({
            emissive: '#777',
            emissiveMap: texture,
          }, materialParameters
        ))
      )
    );

    mesh = new THREE.Mesh( geometry, DEBUG ? debugMaterial : material );
    scene.add( mesh );

    const textarea = document.getElementById( 'textarea-commands' );
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    // Disable OrbitControls when focused on textarea.
    textarea.addEventListener( 'keydown', event => event.stopPropagation() );

    const params = new URLSearchParams( window.location.search );

    // Get default value.
    (function() {
      // Fetch from file-path if it exists.
      const path = params.get( 'path' );
      if ( path ) {
        // Save path before replaceState.
        window.history.pushState( '', '', window.location.search );
        return fetch( path ).then( res => res.text() );
      }

      const value = params.get( 'commands' ) || 'return _([1, 1, 1])';
      return Promise.resolve( value );
    }())
      .then( value => {
        textarea.value = value;
        textarea.dispatchEvent( new Event( 'input' ) );

        // Go back if fetched from file-path.
        if ( params.get( 'path' ) ) {
          window.history.back();
        }
      });
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  const intersectionEl = document.querySelector( '.js-intersection' );

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

      intersectionEl.textContent = point.toArray().map( formatNumber() ).join( ', ' );
    } else {
      intersectionEl.textContent = '';
    }
  });

  const debugEl = document.querySelector( '.js-debug' );
  debugEl.checked = DEBUG;

  debugEl.addEventListener( 'change', () => {
    DEBUG = !DEBUG;
    wireframe.visible = DEBUG;
    geometryLabels.visible = DEBUG;
    mesh.material = DEBUG ? debugMaterial : material;
    render();
  });

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
}());
