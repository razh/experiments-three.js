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
    var gunRadius = 0.04;

    var gunLeft = new THREE.CylinderGeometry( gunRadius, gunRadius, gunLength, 16 );
    var gunRight = new THREE.CylinderGeometry( gunRadius, gunRadius, gunLength, 16 );

    matrix.makeTranslation( -gunOffsetX, 0, 0 );
    gunLeft.applyMatrix( matrix );

    matrix.makeTranslation( gunOffsetX, 0, 0 );
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
    var turretHeight = 0.25;

    var turretShape = new THREE.Shape();

    // Pentagon.
    var subdivAngle = 2 * Math.PI / 5;
    var angle;

    turretShape.moveTo( 0, turretRadius );
    for ( var i = 1; i <= 5; i++ ) {
      angle = i * subdivAngle;
      turretShape.lineTo(
        turretRadius * Math.sin( angle ),
        turretRadius * Math.cos( angle )
      );
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
