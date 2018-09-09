/* eslint-env jest */

'use strict';

import * as THREE from 'three';

import './three.mock';
import { pm_trace, Trace } from '../aabb-trace.js';

/*
     ┌─────┐
     │  A  │
     └─────┘
        │
  ┌─────┼───────────┐
  │     │  B        │
  └─────┼───────────┘
        ▼
     ┌ ─ ─ ┐
        A
     └ ─ ─ ┘
 */
test('tunneling', () => {
  const boxA = new THREE.Box3(
    new THREE.Vector3(-1, 2, -1),
    new THREE.Vector3(1, 4, 1),
  );

  const boxB = new THREE.Box3(
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(2, 0, 2),
  );

  const trace = new Trace();
  pm_trace(trace, new THREE.Vector3(), new THREE.Vector3(0, -8, 0), boxA, boxB);
  expect(trace.fraction).toBe(0.25);
});

/*
     ┌─────┐     ┌ ─ ─ ┐
     │  A  │ ──▶    A
  ┌──┴─────┴─────┴─────┴──┐
  │           B           │
  └───────────────────────┘
 */
test('sliding without overlap', () => {
  const boxA = new THREE.Box3(
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(1, 2, 1),
  );

  const boxB = new THREE.Box3(
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(8, 0, 2),
  );

  const trace = new Trace();
  pm_trace(trace, new THREE.Vector3(), new THREE.Vector3(6, 0, 0), boxA, boxB);
  expect(trace.fraction).toBe(1);
});

/*
  ┌─────┐
  │  A  │
  └─────┘
     │    ┌─────┐
     │    │  B  │
     ▼    └─────┘
  ┌ ─ ─ ┐
     A
  └ ─ ─ ┘
 */
test('freefall', () => {
  const boxA = new THREE.Box3(
    new THREE.Vector3(-1, -1, -1),
    new THREE.Vector3(1, 1, 1),
  );

  const boxB = new THREE.Box3(
    new THREE.Vector3(8, -3, -1),
    new THREE.Vector3(10, -2, 1),
  );

  const trace = new Trace();
  pm_trace(
    trace,
    new THREE.Vector3(),
    new THREE.Vector3(0, -10, 0),
    boxA,
    boxB,
  );
  expect(trace.fraction).toBe(1);
});

/*
      ┌─────┐
      │  A  │
  ┌───┼─────┼───┐
  │   └─────┘   │
  │      B      │
  └─────────────┘
 */
test('ground trace', () => {
  const boxA = new THREE.Box3(
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(1, 2, 1),
  );

  const boxB = new THREE.Box3(
    new THREE.Vector3(-3, -1, -3),
    new THREE.Vector3(3, 0, 3),
  );

  const trace = new Trace();
  const intersects = pm_trace(
    trace,
    new THREE.Vector3(),
    new THREE.Vector3(0, -0.25, 0),
    boxA,
    boxB,
  );
  expect(intersects).toBe(true);
  expect(trace.fraction).toBe(0);
});
