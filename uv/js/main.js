/* global THREE, dat */

(() => {
  'use strict';

  let container;

  let canvas, ctx;

  let scene, camera, renderer;

  let geometry, material, mesh;
  let texture;

  const depthScale = 0.25;
  let depthScene, depthRenderer;
  let depthMaterial, depthMesh;

  const geometries = {
    icosahedron: new THREE.IcosahedronGeometry( 1, 3 ),
    sphere: new THREE.SphereGeometry( 1, 16, 16 ),
    octahedron: new THREE.OctahedronGeometry( 1, 2 ),
    tetrahedron: new THREE.TetrahedronGeometry( 1 ),
    box: new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4 ),
    cylinder: new THREE.CylinderGeometry( 0.5, 0.5, 2, 32, 4 ),
    torus: new THREE.TorusGeometry( 1, 0.25, 16, 16 ),
  };

  const types = Object.keys( geometries );

  const options = {
    powerOfTwo: 8,
    strokeStyle: '#000',
    lineWidth: 0.5,
    type: 'icosahedron',
  };

  function drawUVs( ctx, mesh ) {
    const { width, height } = ctx.canvas;
    ctx.beginPath();

    mesh.geometry.faceVertexUvs[0].forEach( uvs => {
      ctx.moveTo( width * uvs[0].x, height * uvs[0].y );
      ctx.lineTo( width * uvs[1].x, height * uvs[1].y );
      ctx.lineTo( width * uvs[2].x, height * uvs[2].y );
    });

    ctx.strokeStyle = options.strokeStyle;
    ctx.lineWidth = options.lineWidth;
    ctx.stroke();
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    depthRenderer = new THREE.WebGLRenderer({ antialias: true });
    depthRenderer.setSize( depthScale * window.innerWidth, depthScale * window.innerHeight );

    const depthElement = depthRenderer.domElement;
    depthElement.style.position = 'fixed';
    depthElement.style.left = 0;
    depthElement.style.bottom = 0;
    container.appendChild( depthElement );

    scene = new THREE.Scene();
    depthScene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 2 );
    scene.add( camera );

    new THREE.OrbitControls( camera, renderer.domElement );

    scene.add( new THREE.HemisphereLight( '#fff', '#111' ) );

    // UV map.
    canvas = document.createElement( 'canvas' );
    ctx = canvas.getContext( '2d' );

    function resizeCanvas( exponent ) {
      const size = Math.pow( 2, exponent );
      canvas.width = size;
      canvas.height = size;
    }

    Object.assign(canvas.style, {
      position: 'fixed',
      left: 0,
      top: 0,
      width: '256px',
      height: '256px',
    });

    resizeCanvas( options.powerOfTwo );
    texture = new THREE.Texture( canvas );
    texture.anisotropy = renderer.getMaxAnisotropy();
    document.body.appendChild( canvas );

    material = new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.FlatShading,
    });

    depthMaterial = new THREE.MeshDepthMaterial();

    function createMesh() {
      scene.remove( mesh );
      geometry = geometries[ options.type ];
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      depthScene.remove( depthMesh );
      depthMesh = new THREE.Mesh( geometry.clone(), depthMaterial );
      depthScene.add( depthMesh );
    }

    createMesh();

    function drawUVTexture() {
      ctx.fillStyle = '#fff';
      ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      drawUVs( ctx, mesh );

      texture.needsUpdate = true;
    }

    function resizeUVTexture( exponent ) {
      resizeCanvas( exponent );
      drawUVTexture();
    }

    drawUVTexture( options.powerOfTwo );

    // GUI.
    const gui = new dat.GUI();

    gui.add( options, 'powerOfTwo', 0, 12 )
      .step( 1 )
      .listen()
      .onChange( resizeUVTexture );

    gui.add( options, 'lineWidth', 0.01, 4 )
      .listen()
      .onChange( drawUVTexture );

    gui.addColor( options, 'strokeStyle' )
      .listen()
      .onChange( drawUVTexture );

    gui.add( options, 'type', types )
      .listen()
      .onChange(() => {
        createMesh();
        drawUVTexture();
      });
  }

  function setDepthCamera( mesh, camera ) {
    const vector = new THREE.Vector3();

    // Assume mesh.matrixWorld is already pre=calculated.
    const distances = mesh.geometry.vertices.map( vertex => {
      return vector.copy( vertex )
        .applyMatrix4( mesh.matrixWorld )
        .distanceTo( camera.position );
    });

    const max = Math.max( ...distances );
    const far = Math.min( max * 1.5, 2000 );

    // Prevent degenrate projection matrix.
    if ( far !== camera.near ) {
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }

  function animate() {
    renderer.render( scene, camera );

    // Render scene depth.
    setDepthCamera( mesh, camera );
    depthRenderer.render( depthScene, camera );

    requestAnimationFrame( animate );
  }

  init();
  animate();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    depthRenderer.setSize( depthScale * window.innerWidth, depthScale * window.innerHeight );
  });
})();
