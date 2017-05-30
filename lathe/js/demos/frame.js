frame = (size = 8, thickness = 1) => {
  const length = size - (2 * thickness)
  const radius = (size - thickness) / 2

  dimensions = {
    x: [thickness, length, thickness],
    y: [length, thickness, thickness],
    corner: [thickness, thickness, thickness],
  }

  const top = _(dimensions.y, ty(radius))
  const right = _(dimensions.x, tx(radius))
  const bottom = _(dimensions.y, ty(-radius))
  const left = _(dimensions.x, tx(-radius))

  const topRight = _(dimensions.corner, t(radius, radius, 0))
  const bottomRight = _(dimensions.corner, t(radius, -radius, 0))
  const bottomLeft = _(dimensions.corner, t(-radius, -radius, 0))
  const topLeft = _(dimensions.corner, t(-radius, radius, 0))

  return [
    top,
    right,
    bottom,
    left,
    topRight,
    bottomRight,
    bottomLeft,
    topLeft,
  ]
}

frameMiter = (size = 8, thickness = 1) => {
  radius = (size - thickness) / 2

  dimensions = {
    x: [thickness, size, thickness],
    y: [size, thickness, thickness],
  }

  const top = _(dimensions.y, ty(radius), $tx({
    px_ny: -thickness,
    nx_ny: thickness,
  }))

  const right = _(dimensions.x, tx(radius), $ty({
    nx_py: -thickness,
    nx_ny: thickness,
  }))

  const bottom = _(dimensions.y, ty(-radius), $tx({
    px_py: -thickness,
    nx_py: thickness,
  }))

  const left = _(dimensions.x, tx(-radius), $ty({
    px_py: -thickness,
    px_ny: thickness,
  }))

  return [
    top,
    right,
    bottom,
    left,
  ]
}

return [
  ...frame().map(tz(4)),
  ...frameMiter().map(tz(-4)),
]
