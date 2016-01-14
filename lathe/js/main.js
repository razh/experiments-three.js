/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var geometry, material, mesh;
  var wireframe;

  var textarea = document.getElementById( 'points' );
  var segmentsInput = document.getElementById( 'segments' );
  var shadingInput = document.getElementById( 'shading' );
  var wireframeInput = document.getElementById( 'wireframe' );

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

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    var ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );

    var light = new THREE.DirectionalLight();
    scene.add( light );

    var backLight = new THREE.DirectionalLight( '#eef' );
    scene.add( backLight );

    material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      side: THREE.DoubleSide
    });

    mesh = new THREE.Mesh( new THREE.Geometry(), material );
    scene.add( mesh );

    textarea.value = [
      0,
      1,
      '0 2'
    ].join( '\n' );

    segmentsInput.value = 4;

    function createWireframe( mesh ) {
      if ( wireframe && wireframe.parent ) {
        wireframe.parent.remove( wireframe );
      }

      wireframe = new THREE.WireframeHelper( mesh, 0 );
      scene.add( wireframe );
    }

    function onInput() {
      var lines = textarea.value.split( '\n' );
      var line;

      var points = [];
      var point;
      var x, y, z;
      for ( var i = 0; i < lines.length; i++ ) {
        line = lines[i].trim();

        if ( !line.length ) {
          continue;
        }

        point = line.split( ' ' ).map( parseFloat );

        if ( !point.length || point.some( isNaN ) ) {
          return;
        }

        x = point[0];

        if ( point.length === 1 ) {
          y = 0;
          z = x;
        } else if ( point.length === 2 ) {
          y = 0;
          z = point[1];
        } else {
          y = point[1];
          z = point[2];
        }

        points.push( new THREE.Vector3( x, y, z ) );
      }

      geometry = new THREE.LatheGeometry( points, segmentsInput.value );
      mesh.geometry = geometry;
      mesh.needsUpdate = true;

      geometry.computeBoundingSphere();

      light.position
        .copy( geometry.boundingSphere.center )
        .addScalar( geometry.boundingSphere.radius );

      backLight.position
        .copy( geometry.boundingSphere.center )
        .subScalar( geometry.boundingSphere.radius );

      createWireframe( mesh );

      render();
    }

    onInput();
    textarea.addEventListener( 'input', onInput );
    segmentsInput.addEventListener( 'input', onInput );

    textarea.addEventListener( 'keydown', function( event ) {
      event.stopPropagation();
    });

    shadingInput.addEventListener( 'change', function( event ) {
      material.shading = THREE[event.target.value];
      material.needsUpdate = true;
      render();
    });

    wireframeInput.addEventListener( 'change', function( event ) {
      wireframe.visible = event.target.checked;
      render();
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
