/* global THREE, remove, updateGeometry, createBoxTextures */

(function() {
  'use strict';

  let container;

  let scene, camera, renderer;

  let geometry, material, mesh;
  let wireframe;

  let vertexObject;
  let transformControls;

  const state = {
    nearestVertex: null,
    isTransforming: false,
  };

  function createWireframe() {
    remove( wireframe );

    wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry( mesh.geometry ),
      new THREE.LineBasicMaterial()
    );

    scene.add( wireframe );
  }

  function forceGeometryUpdate() {
    updateGeometry( geometry );
    createWireframe( mesh );
    render();
  }

  function setNearestVertex( vertex ) {
    if ( vertex === state.nearestVertex ) {
      return;
    }

    state.nearestVertex = vertex;

    if ( vertex ) {
      vertexObject.position.copy( vertex );
      transformControls.attach( vertexObject );
    } else {
      transformControls.detach();
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

    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( '#333' ) );

    const light = new THREE.DirectionalLight();
    light.position.set( 0, 8, 8 );
    scene.add( light );

    const axisHelper = new THREE.AxisHelper();
    scene.add( axisHelper );

    const gridHelper = new THREE.GridHelper( 2, 20 );
    gridHelper.position.y = -1;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add( gridHelper );

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = createBoxTextures().map( texture =>
      new THREE.MeshStandardMaterial({
        emissive: '#333',
        emissiveMap: texture,
        shading: THREE.FlatShading,
        transparent: true,
        opacity: 0.8,
      })
    );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    createWireframe( mesh );

    vertexObject = new THREE.Object3D();
    transformControls = new THREE.TransformControls( camera, renderer.domElement );
    scene.add( vertexObject );
    scene.add( transformControls );

    transformControls.addEventListener( 'mousedown', () => state.isTransforming = true );
    transformControls.addEventListener( 'mouseup', () => state.isTransforming = false );

    transformControls.addEventListener( 'change', () => {
      if ( state.nearestVertex ) {
        state.nearestVertex.copy( vertexObject.position );
        forceGeometryUpdate();
      }
    });
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

  const mouse = new THREE.Vector2();
  const vector = new THREE.Vector3();

  function onMouseMove( event ) {
    if ( state.isTransforming ) {
      return;
    }

    mouse.set( event.clientX, event.clientY );

    let minDistanceToSquared = Infinity;
    let minVertex;

    geometry.vertices.forEach( vertex => {
      vector.copy( vertex ).project( camera );

      vector.set(
        window.innerWidth  * ( 1 + vector.x ) / 2,
        window.innerHeight * ( 1 - vector.y ) / 2
      );

      const distanceToSquared = mouse.distanceToSquared( vector );
      if ( distanceToSquared < minDistanceToSquared ) {
        minDistanceToSquared = distanceToSquared;
        minVertex = vertex;
      }
    });

    setNearestVertex( minVertex );
    render();
  }

  document.addEventListener( 'mousemove', onMouseMove );

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
}());
