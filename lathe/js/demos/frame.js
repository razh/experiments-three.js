frame = (size = 8, thickness = 1) => {
  length = size - (2 * thickness)
  radius = (size - thickness) / 2

  dimensions = {
    x: [thickness, length, thickness],
    y: [length, thickness, thickness],
    corner: [thickness, thickness, thickness],
  }

  const top = _(dimensions.y, t(0, radius, 0))
  const right = _(dimensions.x, t(radius, 0, 0))
  const bottom = _(dimensions.y, t(0, -radius, 0))
  const left = _(dimensions.x, t(-radius, 0, 0))

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

  const top = _(dimensions.y, t(0, radius, 0), $t({
    px_ny: { x: -thickness },
    nx_ny: { x: thickness },
  }))

  const right = _(dimensions.x, t(radius, 0, 0), $t({
    nx_py: { y: -thickness },
    nx_ny: { y: thickness },
  }))

  const bottom = _(dimensions.y, t(0, -radius, 0), $t({
    px_py: { x: -thickness },
    nx_py: { x: thickness },
  }))

  const left = _(dimensions.x, t(-radius, 0, 0), $t({
    px_py: { y: -thickness },
    px_ny: { y: thickness },
  }))

  return [
    top,
    right,
    bottom,
    left,
  ]
}

return [
  ...frame().map(t(0, 0, 4)),
  ...frameMiter().map(t(0, 0, -4)),
]
