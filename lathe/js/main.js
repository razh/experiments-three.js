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

  function createPoints( string ) {
    var lines = string.split( '\n' );
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
        continue;
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

    return points;
  }

  // SVG path operations.
  var ops = {
    M: 'moveTo',
    L: 'lineTo',
    Q: 'quadraticCurveTo',
    B: 'bezierCurveTo'
  };

  function createPathPoints( string ) {
    var lines = string.split( '\n' );
    var line;

    var path = new THREE.Path();
    var point;
    var op, opcode;
    for ( var i = 0; i < lines.length; i++ ) {
      line = lines[i].trim();

      if ( !line.length ) {
        continue;
      }

      if ( /^[A-Za-z]/.test( line ) ) {
        opcode = line.slice( 0, 1 );
        line = line.slice( 1 ).trim();
      }

      point = line.split( ' ' ).map( parseFloat );

      if ( !point.length || point.some( isNaN ) ) {
        continue;
      }

      if ( !i ) {
        path.moveTo.apply( path, point );
      } else {
        op = path[ops[opcode]];
        if (op) {
          op.apply( path, point );
        }
      }
    }

    return path
      .getPoints()
      .map( function( v ) { return new THREE.Vector3( v.x, 0, v.y ) } );
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

    var box = new THREE.Box3();

    function transformBottom() {
      ctx.translate( radius, canvas.height / 2 );
      ctx.scale( scale, scale );
    }

    function transformTop() {
      ctx.translate( radius, canvas.height / 2 );
      ctx.scale( scale, -scale );
    }

    function drawLine( ctx, points ) {
      ctx.beginPath();
      ctx.moveTo( points[0].z, points[0].x );
      for ( var i = 1; i < points.length; i++ ) {
        ctx.lineTo( points[i].z, points[i].x );
      }
    }

    function drawPoints( ctx, points ) {
      ctx.beginPath();
      points.forEach(function( point ) {
        ctx.moveTo( point.z, point.x );
        ctx.arc( point.z, point.x, radius / scale, 0, 2 * Math.PI );
      });
    }

    return function( points ) {
      if ( !points.length ) {
        return;
      }

      box.setFromPoints( points );

      var width = box.max.x - box.min.x;
      var depth = box.max.z - box.min.z;

      canvas.width = scale * depth + diameter;
      canvas.height = 2 * scale * width + diameter;

      ctx.clearRect( 0, 0, canvas.width, canvas.height );
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1.5;

      // Bottom half.
      ctx.save();
      transformBottom();
      drawLine( ctx, points );
      ctx.restore();
      ctx.stroke();

      ctx.save();
      transformBottom();
      drawPoints( ctx, points );
      ctx.restore();
      ctx.fill();

      // Top half.
      ctx.save();
      transformTop();
      drawLine( ctx, points );
      ctx.restore();
      ctx.stroke();

      ctx.save();
      transformTop();
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
