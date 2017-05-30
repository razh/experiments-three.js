truss = (width = 16, height = 8, thickness = 1) => {
  const innerWidth = width - (2 * thickness)
  const innerHeight = height - (2 * thickness)

  const dimensions = {
    x: [width, thickness, thickness],
    y: [thickness, innerHeight, thickness],
  }

  const horizontalY = (height - thickness) / 2
  const diagonalX = ((innerWidth - thickness) / 2) - thickness
  const verticalX = (innerWidth + thickness) / 2

  const top = _(
    dimensions.x,
    ty(horizontalY),
  )

  const bottom = _(
    dimensions.x,
    ty(-horizontalY),
  )

  const vertical = _(dimensions.y)

  const leftDiagonal = _(
    dimensions.y,
    tx(-thickness),
    $tx('py', -diagonalX),
  )

  const rightDiagonal = _(
    dimensions.y,
    tx(thickness),
    $tx('py', diagonalX),
  )

  const leftVertical = _(
    dimensions.y,
    tx(-verticalX),
  )

  const rightVertical = _(
    dimensions.y,
    tx(verticalX),
  )

  return [
    top,
    bottom,
    vertical,
    leftDiagonal,
    rightDiagonal,
    leftVertical,
    rightVertical,
  ]
}

return [
  ...truss(),
]
