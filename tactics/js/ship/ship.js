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
