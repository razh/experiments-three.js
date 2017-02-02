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
_set = _(d, set('px_py_pz', 8, 8, 8))
_setX = _(d, setX('px_py_pz', 8))
_setY = _(d, setY('px_py_pz', 8))
_setZ = _(d, setZ('px_py_pz', 8))

_copy = _(d, copy('px_py_pz', vertex('px_py_pz')(_setY)))

// Align
_align = _(d, align('ny'))
_relativeAlign = (function() {
  var _d = _(d);

  return $$([
    _d,
    _(d, relativeAlign('px')(_d, 'nx')),
  ])
}())

// Transforms
// Rotate
_rotateX = _(d, rotateX(Math.PI / 4))
_rotateY = _(d, rotateY(Math.PI / 4))
_rotateZ = _(d, rotateZ(Math.PI / 4))

// Translate
_translate = _(d, translate(2, 2, 2))

// Scale
_scale = _(d, scale(1.5, 1.5, 1.5))


return [
  _set,
  _setX,
  _setY,
  _setZ,
  _copy,
  _align,
  _relativeAlign,
  _rotateX,
  _rotateY,
  _rotateZ,
  _translate,
  _scale,
].map((geometry, index, array) =>
  _(geometry, tz(-16 * (index - ((array.length - 1) / 2))))
)
