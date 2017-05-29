/* global THREE */

(() => {
  'use strict';

  let container;

  let scene, camera, renderer;
  let controls;

  function createTrackGeometry( radius, length, meshSpacing ) {
    const geometry = new THREE.Geometry();

    const height = radius * Math.sin( Math.PI / 3 );

    geometry.vertices = [
      // Left panel.
      [ radius / 2 + meshSpacing, 0, 0 ],
      [ radius + meshSpacing, height, 0 ],
      [ radius + meshSpacing, height, -length ],
      [ radius / 2 + meshSpacing, 0, -length ],

      // Center panel.
      [ -( radius / 2 ), 0, 0 ],
      [  ( radius / 2 ), 0, 0 ],
      [  ( radius / 2 ), 0, -length ],
      [ -( radius / 2 ), 0, -length ],

      // Right panel.
      [ -( radius + meshSpacing ), height, 0 ],
      [ -( radius / 2 + meshSpacing ), 0, 0 ],
      [ -( radius / 2 + meshSpacing ), 0, -length ],
      [ -( radius + meshSpacing ), height, -length ],
    ].map( vertex => new THREE.Vector3( ...vertex ) );

    geometry.faces = [
      [ 0, 1, 2 ],
      [ 2, 3, 0 ],
      [ 4, 5, 6 ],
      [ 6, 7, 4 ],
      [ 8, 9, 10 ],
      [ 10, 11, 8 ],
    ].map( face => new THREE.Face3( ...face ) );

    geometry.computeFaceNormals();

    return geometry;
  }

  function createTrackMeshes( options = {} ) {
    const {
      count = 0,
      radius = 5,
      length = 3,
      spacing = 0.5,
      meshSpacing = 0.5,
    } = options;

    const geometry = createTrackGeometry( radius, length, meshSpacing );

    const material = new THREE.MeshBasicMaterial({
      color: '#fff',
    });

    const meshes = [];

    for ( let i = 0; i < count; i++ ) {
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.z = i * ( length + spacing );
      meshes.push( mesh );
    }

    return meshes;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    const width = 568;
    const height = 320;

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 90, width / height, 0.1, 1000 );
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    const meshes = createTrackMeshes({
      count: 5,
    });

    meshes.forEach( mesh => scene.add( mesh ) );

    camera.position.set( 0, 2, -4 );
    const position = camera.position.clone();
    position.z = 10;
    controls.target = position;
    camera.lookAt( position );

    scene.fog = new THREE.FogExp2( 0x000000, 0.1 );
  }

  function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  init();
  animate();
})();
