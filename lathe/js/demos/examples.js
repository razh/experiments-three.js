d = [8, 8, 8]

// Dimensions
// Vector3 { x: 8, y: 8, z: 8 }
size(_(d))

// 8
width(_(d))

// 8
height(_(d))

// 8
depth(_(d))

// Getters
// Vector3 { x: 8, y: 8, z: 8 }
vertex('px_py_pz', _(d))
// Vector3 { x: 4, y: 0, z: 0 }
centroid('px')(_(d))

// Setters
_setX = _(d, setX('px_py_pz', 8))
_setY = _(d, setY('px_py_pz', 8))
_setZ = _(d, setZ('px_py_pz', 8))

_copy = _(d, copy('px_py_pz', vertex('px_py_pz')(_setY)))

return [
  _setX,
  _setY,
  _setZ,
  _copy,
].map((geometry, index, array) =>
  _(geometry, tz(-16 * (index - ((array.length - 1) / 2))))
)
