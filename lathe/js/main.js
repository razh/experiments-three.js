/* eslint comma-dangle: ["error", "always-multiline"] */
/* global THREE, createPoints, modifiers, createNumericInput */

(function() {
  'use strict';

  let container;

  let scene, camera, controls, renderer;

  let geometry, material, mesh;
  let wireframe;

  const textarea = document.getElementById( 'points' );
  const segmentsInput = document.getElementById( 'segments' );
  const shadingInput = document.getElementById( 'shading' );
  const wireframeInput = document.getElementById( 'wireframe' );
  const toArrayButton = document.getElementById( 'to-array' );

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

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    scene.add( ambientLight );

    const light = new THREE.DirectionalLight();
    scene.add( light );

    const backLight = new THREE.DirectionalLight( '#eef' );
    scene.add( backLight );

    material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      side: THREE.DoubleSide,
    });

    mesh = new THREE.Mesh( new THREE.Geometry(), material );
    scene.add( mesh );

    // Set from window.location.hash.
    const hash = decodeURIComponent( window.location.hash ).slice( 1 );

    textarea.value = hash || [
      0,
      1,
      '0 2',
    ].join( '\n' );

    segmentsInput.value = 4;

    function createWireframe( mesh ) {
      let visible = true;

      if ( wireframe ) {
        // Store previous visible state.
        visible = wireframe.visible;

        if ( wireframe.parent ) {
          wireframe.parent.remove( wireframe );
        }
      }

      wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry( mesh.geometry ),
        new THREE.LineBasicMaterial({ color: 0 })
      );

      wireframe.visible = visible;
      scene.add( wireframe );
    }

    function onInput() {
      // Build geometry.
      const points = createPoints( textarea.value );

      geometry = new THREE.LatheGeometry( points, segmentsInput.value );
      mesh.geometry = geometry;
      mesh.needsUpdate = true;

      // Position lights.
      geometry.computeBoundingSphere();

      light.position
        .copy( geometry.boundingSphere.center )
        .addScalar( geometry.boundingSphere.radius );

      backLight.position
        .copy( geometry.boundingSphere.center )
        .subScalar( geometry.boundingSphere.radius );

      createWireframe( mesh );

      // Render.
      render();
      drawCanvas( points );

      // Update location.
      window.history.replaceState( '', '', `#${  encodeURIComponent( textarea.value ) }` );
    }

    onInput();
    createNumericInput( textarea );
    textarea.addEventListener( 'input', onInput );
    segmentsInput.addEventListener( 'input', onInput );

    textarea.addEventListener( 'keydown', event => event.stopPropagation() );

    shadingInput.addEventListener( 'change', event => {
      material.shading = THREE[event.target.value];
      material.needsUpdate = true;
      render();
    });

    wireframeInput.addEventListener( 'change', event => {
      wireframe.visible = event.target.checked;
      render();
    });

    toArrayButton.addEventListener( 'click', () => {
      const points = createPoints( textarea.value );
      const json = points.map( point => point.toArray() );
      console.log( JSON.stringify( json ) );
    });
  }

  function render() {
    renderer.render( scene, camera );
  }

  const drawCanvas = (function() {
    const canvas = document.getElementById( 'canvas' );
    const ctx = canvas.getContext( '2d' );

    const scale = 32;
    const radius = 4;
    const diameter = 2 * radius;

    const box = new THREE.Box2();

    function transformLeft( ctx ) {
      ctx.translate( canvas.width / 2, canvas.height - radius );
      ctx.scale( scale, -scale );
      ctx.translate( -box.min.x, -box.min.y );
    }

    function transformRight( ctx ) {
      ctx.translate( canvas.width / 2, canvas.height - radius );
      ctx.scale( -scale, -scale );
      ctx.translate( -box.min.x, -box.min.y );
    }

    function inverseTransform( x, y ) {
      x -= canvas.width / 2;
      y -= canvas.height - radius;

      if ( x > 0 ) {
        x *= -1;
      }

      x /= -scale;
      y /= -scale;

      x += box.min.x;
      y += box.min.y;

      return {
        x,
        y,
      };
    }

    function drawLine( ctx, points ) {
      ctx.beginPath();
      ctx.moveTo( points[0].x, points[0].y );
      for ( let i = 1; i < points.length; i++ ) {
        ctx.lineTo( points[i].x, points[i].y );
      }
    }

    function drawPoints( ctx, points ) {
      ctx.beginPath();
      points.forEach( point => {
        ctx.moveTo( point.x, point.y );
        ctx.arc( point.x, point.y, radius / scale, 0, 2 * Math.PI );
      });
    }

    canvas.addEventListener( 'mousemove', (function() {
      const pointerCanvas = document.getElementById( 'pointer-canvas' );
      const pointerCtx = pointerCanvas.getContext( '2d' );

      return event => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const points = [ inverseTransform( x, y ) ];

        pointerCanvas.width = canvas.width;
        pointerCanvas.height = canvas.height;

        pointerCtx.fillStyle = '#fff';

        // Left half.
        pointerCtx.save();
        transformLeft( pointerCtx );
        drawPoints( pointerCtx, points );
        pointerCtx.restore();
        pointerCtx.fill();

        // Right half.
        pointerCtx.save();
        transformRight( pointerCtx );
        drawPoints( pointerCtx, points );
        pointerCtx.restore();
        pointerCtx.fill();
      };
    })());

    return function( points ) {
      if ( !points.length ) {
        return;
      }

      box.setFromPoints( points );

      const width = box.max.x - box.min.x;
      const height = box.max.y - box.min.y;

      canvas.width = 2 * scale * width + diameter;
      canvas.height = scale * height + diameter;

      ctx.clearRect( 0, 0, canvas.width, canvas.height );
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1.5;

      // Left half.
      ctx.save();
      transformLeft( ctx );
      drawLine( ctx, points );
      ctx.restore();
      ctx.stroke();

      ctx.save();
      transformLeft( ctx );
      drawPoints( ctx, points );
      ctx.restore();
      ctx.fill();

      // Right half.
      ctx.save();
      transformRight( ctx );
      drawLine( ctx, points );
      ctx.restore();
      ctx.stroke();

      ctx.save();
      transformRight( ctx );
      drawPoints( ctx, points );
      ctx.restore();
      ctx.fill();
    };
  })();

  init();
  render();

  window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });
})();
