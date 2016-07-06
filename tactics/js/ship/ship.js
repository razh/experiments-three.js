/* eslint-env es6 */
/*global THREE*/
/* exported createShipGeometry */
function createShipGeometry() {
  'use strict';

  const shape = new THREE.Shape();

  // Dreadnought-class ships have a length of 160 meters and a beam of 25
  // meters.
  const width = 2.5;
  const length = 16;

  const halfWidth = width / 2;
  const halfLength = length / 2;

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

/* exported createGunGeometry */
function createGunGeometry() {
  'use strict';

  // 14 meter barrel length.
  const gunLength = 1.4;
  const gunOffsetX = 0.1;
  const gunOffsetY = 0.2;
  const gunRadius = 0.03;

  const geometry = new THREE.Geometry();

  const gunLeft = new THREE.CylinderGeometry( gunRadius, gunRadius, gunLength, 16 );
  const gunRight = gunLeft.clone();

  geometry.merge( gunLeft.translate( -gunOffsetX, gunOffsetY, 0 ) );
  geometry.merge( gunRight.translate( gunOffsetX, gunOffsetY, 0 ) );

  return geometry;
}

/* exported createTurretGeometry */
function createTurretGeometry() {
  const turretRadius = 0.5;
  const turretHeight = 0.2;

  const turretShape = new THREE.Shape();
  turretShape.moveTo( 0, turretRadius );

  const points = [
    [ 0.3, 1 ],
    [ 0.6, 0.8 ],
    [ 0.6, 0 ],
    [ 0.3, -0.9 ]
  ];

  for ( let i = 0; i < points.length; i++ ) {
    const point = points[i];
    turretShape.lineTo( point[0] * turretRadius, point[1] * turretRadius );
  }

  // Mirror.
  for ( let i = points.length - 1; i >= 0; i-- ) {
    const point = points[i];
    turretShape.lineTo( -point[0] * turretRadius, point[1] * turretRadius );
  }

  const geometry = new THREE.ExtrudeGeometry( turretShape, {
    amount: 0,
    bevelSize: 0.06,
    bevelThickness: turretHeight,
    bevelSegments: 1
  });

  // Center turret vertically.
  geometry.translate( 0, 0, -turretHeight / 2 );

  return geometry;
}

/* exported createSmokestackGeometry */
function createSmokestackGeometry() {
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
  const width = 0.4;
  const length = 0.35;

  const halfWidth = width / 2;
  const halfLength = length / 2;

  const shape = new THREE.Shape();

  // Counter-clockwise starting from top-right.
  // NOTE: Arc API is different from that of canvas.
  shape.moveTo( halfWidth, -halfLength );
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

  const geometry = new THREE.ExtrudeGeometry( shape, {
    amount: 1,
    bevelEnabled: false,
    curveSegments: 4
  });

  return geometry;
}

/* exported createFrontDeckGeometry */
const createFrontDeckGeometry = (function() {
  'use strict';

  function splitBezierCurve( v0, v1, v2, v3, t ) {
    // Lerp control points.
    const v01 = v0.clone().lerp( v1, t );
    const v12 = v1.clone().lerp( v2, t );
    const v23 = v2.clone().lerp( v3, t );

    // Second iteration.
    const v012 = v01.clone().lerp( v12, t );
    const v123 = v12.clone().lerp( v23, t );

    // Final iteration.
    const v0123 = v012.clone().lerp( v123, t );

    return [
      // First curve, from 0 to t.
      [ v0, v01, v012, v0123 ],
      // Second curve, from t to 1.
      [ v0123, v123, v23, v3 ]
    ];
  }

  function createFrontDeckGeometry() {
    const shape = new THREE.Shape();

    // NOTE: These values are the same as the ship geometry.
    const width = 2.5;
    const length = 16;

    const halfWidth = width / 2;
    const halfLength = length / 2;

    const t = 0.5;

    let rightCurve = [
      ...[
        [ 0, halfLength ],
        [ halfWidth / 3, halfLength ],
        [ halfWidth, 2 / 3 * halfLength ],
        [ halfWidth, 0 ]
      ].map( xy => new THREE.Vector2( ...xy ) ),
      t
    ];

    rightCurve = splitBezierCurve( ...rightCurve )[0];

    let leftCurve = [
      ...[
        [ -halfWidth, 0 ],
        [ -halfWidth, 2 / 3 * halfLength ],
        [ -halfWidth / 3, halfLength ],
        [ 0, halfLength ]
      ].map( xy => new THREE.Vector2( ...xy ) ),
      1 - t
    ];

    leftCurve = splitBezierCurve( ...leftCurve )[1];

    shape.moveTo( 0, halfLength );

    shape.bezierCurveTo(
      rightCurve[1].x, rightCurve[1].y,
      rightCurve[2].x, rightCurve[2].y,
      rightCurve[3].x, rightCurve[3].y
    );

    shape.lineTo( leftCurve[0].x, leftCurve[0].y );

    shape.bezierCurveTo(
      leftCurve[1].x, leftCurve[1].y,
      leftCurve[2].x, leftCurve[2].y,
      leftCurve[3].x, leftCurve[3].y
    );

    const geometry = new THREE.ExtrudeGeometry( shape, {
      amount: 0.2,
      bevelEnabled: false
    });

    return geometry;
  }

  return createFrontDeckGeometry;
}());
