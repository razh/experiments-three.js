base = _([8, 1, 8])

flatLeft = _
  ( [2, 6, 2]
  , relativeAlign(base, 'nx_py_nz')('nx_ny_nz')
  , $t(
      { nx_py_nz: { y: 4 }
      , nx_py_pz: { y: 2 }
      , px_py_nz: { y: 2 }
      }
    )
  )

flatRight = _
  ( [2, 6, 2]
  , rotateY(-Math.PI / 2)
  , relativeAlign(base, 'px_py_nz')('nx_ny_nz')
  , $t(
      { nx_py_nz: { y: 4 }
      , nx_py_pz: { y: 2 }
      , px_py_nz: { y: 2 }
      }
    )
  )

bentLeft = _
  ( [2, 6, 2]
  , relativeAlign(base, 'nx_py_pz')('nx_ny_pz')
  , $t(
      { nx_py_pz: { y: 4 } }
    )
  )

bentRight = _
  ( [2, 6, 2]
  , rotateY(-Math.PI / 2)
  , relativeAlign(base, 'px_py_pz')('px_ny_nz')
  , $t(
      { px_py_nz: { y: 4 } }
    )
  )

return [
  base,
  flatLeft,
  flatRight,
  bentLeft,
  bentRight,
]
