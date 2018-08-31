/* eslint-env jest */

'use strict';

import * as THREE from 'three';

import './three.mock';
import { pm_trace, Trace } from '../aabb-trace.js';

test('tunneling', () => {
  const boxA = new THREE.Box3();

  const trace = new Trace();
  pm_trace(trace);
  expect(trace.fraction).toBe(0.5);
});

test('tunneling with overlap', () => {
  const trace = new Trace();
  pm_trace(trace);
});

test('sliding without overlap', () => {
  const trace = new Trace();
  pm_trace(trace);
});

test('freefall', () => {
  const trace = new Trace();
  pm_trace(trace);
});

test('ground trace', () => {
  const trace = new Trace();
  pm_trace(trace);
});

test('fraction', () => {
  const trace = new Trace();
  pm_trace(trace);
});
