/* global THREE, dat, modifiers, createNumericInput, createViewports */

(() => {
  'use strict';

  let container;

  let scene, camera, renderer;
  let views;

  let baseGeometry;
  let geometry, material, mesh;
  let wireframe;

  const textareas = {
    x: document.getElementById( 'textarea-x' ),
    y: document.getElementById( 'textarea-y' ),
    z: document.getElementById( 'textarea-z' ),
  };

  const viewports = document.getElementById( 'viewports' );

  const config = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 8,
    heightSegments: 8,
    depthSegments: 8,
  };

  let transformVertex = () => {};

  // Set from window.location.search.
  const params = new URLSearchParams( window.location.search );

  Object.keys( textareas ).forEach( key => {
    const value = params.get( key );
    if ( value ) {
      textareas[ key ].value = value;
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
    const _geometry = new THREE.Geometry().copy( baseGeometry );
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
    const x = textareas.x.value.trim() || 'x';
    const y = textareas.y.value.trim() || 'y';
    const z = textareas.z.value.trim() || 'z';

    try {
      const fns = [ x, y, z ].map( body => {
        // HACK: Check for no explicit return.
        if ( !/return/.test( body ) ) {
          body = `return ${ body };`;
        }

        return new Function(
          [ 'x', 'y', 'z', 'xt', 'yt', 'zt' ],
          body
        );
      });

      transformVertex = modifiers.parametric( baseGeometry, ( vector, xt, yt, zt ) => {
        vector.fromArray(fns.map( fn => {
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

    const newParams = new URLSearchParams();

    Object.keys( textareas ).forEach( key => {
      const value = textareas[ key ].value.trim();
      if ( value ) {
        newParams.set( key, value );
      }
    });

    // Update location.
    window.history.replaceState( '', '', `?${ newParams }` );
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

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 8, 8, 0 );
    scene.add( light );

    const axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 2, 20 );
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

    Object.keys( textareas ).forEach( key => {
      const textarea = textareas[ key ];

      createNumericInput( textarea );
      textarea.addEventListener( 'input', onInput );

      // Prevent input from toggling dat.gui via hide shortcut ('h').
      textarea.addEventListener( 'keydown', event => event.stopPropagation() );
    });

    const gui = new dat.GUI();

    [ 'width', 'height', 'depth' ].forEach( dimension => {
      gui.add( config, dimension, 0.1, 4 )
        .listen()
        .onChange( value => {
          config[ dimension ] = value;
          baseGeometry = createBaseGeometry( config );
          transformGeometry();
        });
    });

    [ 'widthSegments', 'heightSegments', 'depthSegments' ].forEach( segmentCount => {
      gui.add( config, segmentCount, 1, 16 )
        .step( 1 )
        .listen()
        .onChange( count => {
          config[ segmentCount ] = count;
          baseGeometry = createBaseGeometry( config );
          transformGeometry();
        });
    });
  }

  function render() {
    renderer.render( scene, camera );

    Object.keys( views ).forEach( key => {
      const view = views[ key ];
      view.renderer.render( scene, view.camera );
    });
  }

  init();
  onInput();
  render();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
})();
