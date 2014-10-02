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
      amount: 0.4,
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
      [ 0.35, 1 ],
      [ 0.7, 0.6 ],
      [ 0.7, -0.1 ],
      [ 0.35, -0.9 ]
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
      amount: turretHeight,
      bevelEnabled: false
    });

    // Center turret vertically.
    matrix.makeTranslation( 0, 0, -turretHeight / 2 );
    geometry.applyMatrix( matrix );

    return geometry;
  }

  return createTurretGeometry;

}) ();
