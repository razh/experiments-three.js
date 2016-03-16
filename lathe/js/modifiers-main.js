/* global THREE, modifiers */
(function() {
  'use strict';

  var container;

  var scene, camera, renderer;

  var baseGeometry;
  var geometry, material, mesh;
  var wireframe;

  var textarea = document.getElementById( 'textarea' );

  function createWireframe() {
    if ( wireframe && wireframe.parent ) {
      wireframe.parent.remove( wireframe );
    }

    wireframe = new THREE.WireframeHelper( mesh );
    scene.add( wireframe );
  }

  function onInput() {
    var lines = textarea.value.split( '\n' );

    var x = lines[0] || 'x';
    var y = lines[1] || 'y';
    var z = lines[2] || 'z';

    try {
      var fn = new Function(
        [ 'x', 'y', 'z', 'xt', 'yt', 'zt' ],
        'return [' + x + ', ' + y + ', ' + z + '];'
      );

      var op = modifiers.parametric( baseGeometry, function( vector, xt, yt, zt ) {
        vector.fromArray( fn( vector.x, vector.y, vector.z, xt, yt, zt ) );
      });

      geometry = new THREE.Geometry().copy( baseGeometry );
      geometry.vertices.forEach( op );
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      mesh.geometry = geometry;
      mesh.needsUpdate = true;

      createWireframe( mesh );

      render();
    } catch ( error ) {
      console.error( error );
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
    camera.position.set( 0, 4, 8 );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    baseGeometry = new THREE.BoxGeometry( 4, 4, 4, 8, 8, 8 );
    geometry = baseGeometry;
    material = new THREE.MeshStandardMaterial({ shading: THREE.FlatShading });
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    createWireframe( mesh );

    var light = new THREE.DirectionalLight();
    light.position.set( 8, 8, 0 );
    scene.add( light );

    scene.add( new THREE.AmbientLight( '#333' ) );

    textarea.addEventListener( 'input', onInput );
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
