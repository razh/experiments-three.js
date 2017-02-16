atrium = (width = 16, height = 8, depth = 16, thickness = 1) => {
  rx = (width - thickness) / 2
  rz = (depth - thickness) / 2

  dimensions = {
    x: [thickness, height, depth],
    y: [width, thickness, depth],
    z: [width, height, thickness],
  }

  right = _(
    dimensions.x,
    tx(rx),
    ty(height / 2),
    $ty('nx_ny', thickness),
    $tz({
      nx_pz: -thickness,
      nx_nz: thickness,
    }),
  )

  left = _(
    dimensions.x,
    tx(-rx),
    ty(height / 2),
    $ty('px_ny', thickness),
    $tz({
      px_pz: -thickness,
      px_nz: thickness,
    }),
  )

  bottom = _(
    dimensions.y,
    ty(thickness / 2),
    $tx({
      px_py: -thickness,
      nx_py: thickness,
    }),
    $tz({
      py_pz: -thickness,
      py_nz: thickness,
    }),
  )

  front = _(
    dimensions.z,
    tz(rz),
    ty(height / 2),
    $tx({
      px_nz: -thickness,
      nx_nz: thickness,
    }),
    $ty('ny_nz', thickness),
  )

  back = _(
    dimensions.z,
    tz(-rz),
    ty(height / 2),
    $tx({
      px_pz: -thickness,
      nx_pz: thickness,
    }),
    $ty('ny_pz', thickness),
  )

  return [
    right,
    left,
    bottom,
    front,
    back,
  ]
}


return [
  ...atrium(),
]
