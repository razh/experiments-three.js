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
_translate = $$([
  _(d),
  _(d, translate(2, 2, 2)),
])

// Scale
_scale = _(d, scale(2, 2, 2))

// Vertex transforms
_$translateVertex = _(d, $translate('px_py_pz', { x: 4 }))
_$translateEdge = _(d, $translate('px_py', { x: 4 }))
_$translateFace = _(d, $translate('px', { x: 4 }))

_$scaleVertex = _(d, $translate('nx_py_pz', { x: 2 }))
_$scaleEdge = _(d, $translate('nx_py', { x: 2 }))
_$scaleFace = _(d, $translate('nx', { x: 2 }))

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
  _$translateVertex,
  _$translateEdge,
  _$translateFace,
  _$scaleVertex,
  _$scaleEdge,
  _$scaleFace,
].map((geometry, index, array) => {
  var sqrt = Math.ceil(Math.sqrt(array.length))
  var x = Math.floor(index / sqrt)
  var z = index % sqrt

  var separation = 24

  // Quadrant
  var circumference = 4 * array.length * separation
  var radius = circumference / (2 * Math.PI)
  var angle = (2 * Math.PI) * (index / (4 * array.length))
  var x = radius * Math.cos(angle)
  var z = radius * Math.sin(angle)

  x = (-x + radius ) / 2
  z = -z + 48

  return _
    ( geometry
    , tx(x)
    , tz(z)
    )
})
