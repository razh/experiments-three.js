base = _([8, 1, 8])

flatLeft = _
  ( [2, 6, 2]
  , relativeAlign('nx_ny_nz')(base, 'nx_py_nz')
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
  , relativeAlign('nx_ny_nz')(base, 'px_py_nz')
  , $t(
      { nx_py_nz: { y: 4 }
      , nx_py_pz: { y: 2 }
      , px_py_nz: { y: 2 }
      }
    )
  )

bentLeft = _
  ( [2, 6, 2]
  , relativeAlign('nx_ny_pz')(base, 'nx_py_pz')
  , $t(
      { nx_py_pz: { y: 4 } }
    )
  )

bentRight = _
  ( [2, 6, 2]
  , rotateY(-Math.PI / 2)
  , relativeAlign('px_ny_nz')(base, 'px_py_pz')
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
