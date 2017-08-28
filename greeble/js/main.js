/* global THREE, greeble */

(() => {
  'use strict';

  let container;

  let scene, camera, controls, renderer;

  // Generic test greebling.
  function greeblerHelper( geometry ) {
    const greebles = greeble( geometry, {
      count: 300,
      fn() {
        return new THREE.BoxGeometry(
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 ),
          THREE.Math.randFloat( 0.1, 1.5 )
        );
      },
    });

    if ( greebles ) {
      geometry.merge( greebles );
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
      color: '#dde',
      specular: '#fff',
      flatShading: true,
    }));

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000 );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 8 );
    scene.add( camera );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );

    // Icosahedron greebled.
    const icosahedronGeometry = new THREE.IcosahedronGeometry( 2, 1 );
    const icosahedronMesh = greeblerHelper( icosahedronGeometry );
    scene.add( icosahedronMesh );

    // Plane greebled.
    const planeGeometry = new THREE.PlaneGeometry( 16, 16 );
    const planeMesh = greeblerHelper( planeGeometry );
    planeMesh.position.y = -3;
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add( planeMesh );

    scene.fog = new THREE.FogExp2( '#000', 0.08 );

    const light = new THREE.SpotLight( '#e85', 0.5 );
    light.position.set( 32, 128, 0 );
    light.castShadow = true;
    scene.add( light );

    scene.add( new THREE.AmbientLight( '#325' ) );
  }

  function render() {
    renderer.render( scene, camera );
  }

  init();
  render();
  // HACK: Render again for shadow-map.
  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  });
})();
