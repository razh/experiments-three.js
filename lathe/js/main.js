/* global THREE */
(function() {
  'use strict';

  var container;

  var scene, camera, controls, renderer;

  var geometry, material, mesh;

  var textarea = document.getElementById( 'points' );

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );

    var ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );

    var light = new THREE.DirectionalLight();
    light.position.set( 0, 32, 0 );
    scene.add( light );

    material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading
    });

    mesh = new THREE.Mesh( new THREE.Geometry(), material );
    scene.add( mesh );

    textarea.addEventListener( 'input', function( event ) {
      var value = event.target.value;
      var points = [];

      var lines = value.split( '\n' );
      var point;
      var x, y, z;
      for ( var i = 0; i < lines.length; i++ ) {
        point = lines[i].split( ' ' ).map( parseFloat );

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

      geometry = new THREE.LatheGeometry( points, 4 );
      mesh.geometry = geometry;
      mesh.needsUpdate = true;

      geometry.computeBoundingSphere();

      camera.position
        .copy( geometry.boundingSphere.center )
        .addScalar( geometry.boundingSphere.radius );

      camera.lookAt( geometry.boundingSphere.center );

      render();
    });
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();

})();
