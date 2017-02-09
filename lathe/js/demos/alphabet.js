/* eslint-env es6 */

_1 = 2
_2 = 2 * _1
_3 = 3 * _1
_4 = 4 * _1
_5 = 5 * _1
_z = _1

// intercept transforms
nx_py = align('nx_py')

__ = _
_ = (geometry, ...transforms) => __(geometry, nx_py, ...transforms)

A = $$([
  _([_1, _5, _z]),
  _([_1, _1, _z], tx(_1)),
  _([_1, _1, _z], tx(_1), ty(-_2)),
  _([_1, _5, _z], tx(_2)),
], ty(_5))

B = $$([
  _([_1, _5, _z]),
  _([_2, _1, _z], tx(_1)),
  _([_1, _1, _z], tx(_2), ty(-_1)),
  _([_1, _1, _z], tx(_1), ty(-_2)),
  _([_1, _1, _z], tx(_2), ty(-_3)),
  _([_2, _1, _z], tx(_1), ty(-_4)),
], ty(_5))

C = $$([
  _([_1, _3, _z], ty(-_1)),
  _([_2, _1, _z], tx(_1)),
  _([_2, _1, _z], tx(_1), ty(-_4)),
], ty(_5))

return [
  A,
  B,
  C,
].map((geometry, index) => tx(_4 * index)(geometry))
