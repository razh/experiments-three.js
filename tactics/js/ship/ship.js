/*global THREE*/
/*exported createShipGeometry*/
var createShipGeometry = (function() {
  'use strict';

  function createShipGeometry() {
    var shape = new THREE.Shape();

    // Dreadnought-class ships have a length of 160 meters and a beam of 25
    // meters.
    var width = 2.5;
    var length = 16;

    var halfWidth = width / 2;
    var halfLength = length / 2;

    shape.moveTo( 0, halfLength );

    shape.bezierCurveTo(
      halfWidth / 3, halfLength,
      halfWidth, 2 / 3 * halfLength,
      halfWidth, 0
    );

    shape.bezierCurveTo(
      halfWidth, -2 / 3 * halfLength,
      halfWidth / 3, -halfLength,
      0, -halfLength
    );

    shape.bezierCurveTo(
      -halfWidth / 3, -halfLength,
      -halfWidth, -2 / 3 * halfLength,
      -halfWidth, 0
    );

    shape.bezierCurveTo(
      -halfWidth, 2 / 3 * halfLength,
      -halfWidth / 3, halfLength,
      0, halfLength
    );

    return new THREE.ExtrudeGeometry( shape, {
      amount: 0.35,
      curveSegments: 32,
      bevelEnabled: false
    });
  }

  return createShipGeometry;

}) ();

/*exported createGunGeometry*/
var createGunGeometry = (function() {
  'use strict';

  var matrix = new THREE.Matrix4();

  function createGunGeometry() {
    // 14 meter barrel length.
    var gunLength = 1.4;
    var gunOffsetX = 0.1;
    var gunOffsetY = 0.2;
    var gunRadius = 0.03;

    var gunLeft = new THREE.CylinderGeometry( gunRadius, gunRadius, gunLength, 16 );
    var gunRight = new THREE.CylinderGeometry( gunRadius, gunRadius, gunLength, 16 );

    matrix.makeTranslation( -gunOffsetX, gunOffsetY, 0 );
    gunLeft.applyMatrix( matrix );

    matrix.makeTranslation( gunOffsetX, gunOffsetY, 0 );
    gunRight.applyMatrix( matrix );

    gunLeft.merge( gunRight );

    return gunLeft;
  }

  return createGunGeometry;

}) ();

/*exported createTurretGeometry*/
var createTurretGeometry = (function() {
  'use strict';

  var matrix = new THREE.Matrix4();

  function createTurretGeometry() {
    var turretRadius = 0.5;
    var turretHeight = 0.2;

    var turretShape = new THREE.Shape();
    turretShape.moveTo( 0, turretRadius );

    var points = [
      [ 0.3, 1 ],
      [ 0.6, 0.8 ],
      [ 0.6, 0 ],
      [ 0.3, -0.9 ]
    ];

    var point;
    var i, il;
    for ( i = 0, il = points.length; i < il; i++ ) {
      point = points[i];
      turretShape.lineTo( point[0] * turretRadius, point[1] * turretRadius );
    }

    // Mirror.
    for ( i = points.length - 1; i >= 0; i-- ) {
      point = points[i];
      turretShape.lineTo( -point[0] * turretRadius, point[1] * turretRadius );
    }

    var geometry = new THREE.ExtrudeGeometry( turretShape, {
      amount: 0,
      bevelSize: 0.06,
      bevelThickness: turretHeight,
      bevelSegments: 1
    });

    // Center turret vertically.
    matrix.makeTranslation( 0, 0, -turretHeight / 2 );
    geometry.applyMatrix( matrix );

    return geometry;
  }

  return createTurretGeometry;

}) ();

/*exported createSmokestackGeometry*/
var createSmokestackGeometry = (function() {
  'use strict';

  /**
   * 2D capsule.
   *
   *   |- width -|
   *      ____      ---
   *    /      \     |
   *   |        |    |
   *   |        |  length
   *   |        |    |
   *   |        |    |
   *    \ ____ /    ---
   *
   */
  function createSmokestackGeometry() {
    var width = 0.4;
    var length = 0.35;

    var halfWidth = width / 2;
    var halfLength = length / 2;

    var shape = new THREE.Shape();

    // Counter-clockwise starting from top-right.
    shape.moveTo( halfWidth, -halfLength );
    // NOTE: Arc API is different from that of canvas.
    shape.arc(
      -halfWidth,
      -(halfLength - halfWidth),
      halfWidth,
      Math.PI, 2 * Math.PI
    );

    shape.lineTo( -halfWidth, halfLength );
    shape.arc(
      halfWidth,
      halfLength - halfWidth,
      halfWidth,
      0, Math.PI
    );

    // Close path.
    shape.lineTo( halfWidth, -halfLength );

    var geometry = new THREE.ExtrudeGeometry( shape, {
      amount: 1,
      bevelEnabled: false,
      curveSegments: 4
    });

    return geometry;
  }

  return createSmokestackGeometry;

}) ();

/*exported createFrontDeckGeometry*/
var createFrontDeckGeometry = (function() {
  'use strict';

  function splitBezierCurve( v0, v1, v2, v3, t ) {
    // Lerp control points.
    var v01 = v0.clone().lerp( v1, t );
    var v12 = v1.clone().lerp( v2, t );
    var v23 = v2.clone().lerp( v3, t );

    // Second iteration.
    var v012 = v01.clone().lerp( v12, t );
    var v123 = v12.clone().lerp( v23, t );

    // Finasl iteration.
    var v0123 = v012.clone().lerp( v123, t );

    return [
      // First curve, from 0 to t.
      [ v0, v01, v012, v0123 ],
      // Second curve, from t to 1.
      [ v0123, v123, v23, v3 ]
    ];
  }

  function createFrontDeckGeometry() {}

  return createFrontDeckGeometry;

}) ();
