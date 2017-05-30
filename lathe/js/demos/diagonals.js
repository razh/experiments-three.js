base = _([8, 1, 8])

flatLeft = _(
  [2, 6, 2],
  relativeAlign('nx_ny_nz')(base, 'nx_py_nz'),
  $ty({
    nx_py_nz: 4,
    nx_py_pz: 2,
    px_py_nz: 2,
  }),
)

flatRight = _(
  [2, 6, 2],
  rotateY(-Math.PI / 2),
  relativeAlign('nx_ny_nz')(base, 'px_py_nz'),
  $ty({
    nx_py_nz: 4,
    nx_py_pz: 2,
    px_py_nz: 2,
  }),
)

bentLeft = _(
  [2, 6, 2],
  relativeAlign('nx_ny_pz')(base, 'nx_py_pz'),
  $ty('nx_py_pz', 4),
)

bentRight = _(
  [2, 6, 2],
  rotateY(-Math.PI / 2),
  relativeAlign('px_ny_nz')(base, 'px_py_pz'),
  $ty('px_py_nz', 4),
)

return [
  base,
  flatLeft,
  flatRight,
  bentLeft,
  bentRight,
]
