/* global THREE, createPoints, modifiers */
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
  var toArrayButton = document.getElementById( 'to-array' );

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

    // Set from window.location.hash.
    var hash = decodeURIComponent( window.location.hash ).slice( 1 );

    textarea.value = hash || [
      0,
      1,
      '0 2'
    ].join( '\n' );

    segmentsInput.value = 4;

    function createWireframe( mesh ) {
      var visible = true;

      if ( wireframe ) {
        // Store previous visible state.
        visible = wireframe.visible;

        if ( wireframe.parent ) {
          wireframe.parent.remove( wireframe );
        }
      }

      wireframe = new THREE.WireframeHelper( mesh, 0 );
      wireframe.visible = visible;
      scene.add( wireframe );
    }

    function onInput() {
      // Build geometry.
      var points = createPoints( textarea.value );

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
      var hash = (
        window.location.origin +
        window.location.pathname +
        '#' + encodeURIComponent( textarea.value )
      );

      window.history.replaceState( '', '', hash );
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

    toArrayButton.addEventListener( 'click', function() {
      var points = createPoints( textarea.value );
      var json = points.map(function( point ) {
        return point.toArray();
      });

      console.log( JSON.stringify( json ) );
    });
  }

  function render() {
    renderer.render( scene, camera );
  }

  var drawCanvas = (function() {
    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    var scale = 32;
    var radius = 4;
    var diameter = 2 * radius;

    var box = new THREE.Box2();

    function transformLeft( ctx ) {
      ctx.translate( canvas.width / 2, canvas.height - radius );
      ctx.scale( scale, -scale );
    }

    function transformRight( ctx ) {
      ctx.translate( canvas.width / 2, canvas.height - radius );
      ctx.scale( -scale, -scale );
    }

    function inverseTransform( x, y ) {
      x -= canvas.width / 2;
      y -= canvas.height - radius;

      if ( x > 0 ) {
        x *= -1;
      }

      x /= -scale;
      y /= -scale;

      return {
        x: x,
        y: y
      };
    }

    function drawLine( ctx, points ) {
      ctx.beginPath();
      ctx.moveTo( points[0].x, points[0].y );
      for ( var i = 1; i < points.length; i++ ) {
        ctx.lineTo( points[i].x, points[i].y );
      }
    }

    function drawPoints( ctx, points ) {
      ctx.beginPath();
      points.forEach(function( point ) {
        ctx.moveTo( point.x, point.y );
        ctx.arc( point.x, point.y, radius / scale, 0, 2 * Math.PI );
      });
    }

    canvas.addEventListener( 'mousemove', (function() {
      var pointerCanvas = document.getElementById( 'pointer-canvas' );
      var pointerCtx = pointerCanvas.getContext( '2d' );

      return function( event ) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var points = [ inverseTransform( x, y ) ];

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

      var width = box.max.x - box.min.x;
      var height = box.max.y - box.min.y;

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

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  });

})();
