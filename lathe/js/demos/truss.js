const thickness = 1
const outerHeight = 8
const innerHeight = outerHeight - (2 * thickness)
const outerWidth = 16
const innerWidth = outerWidth - (2 * thickness)

const dimensions = {
  x: [outerWidth, thickness, thickness],
  y: [thickness, innerHeight, thickness],
}

const horizontalY = (outerHeight - thickness) / 2
const diagonalX = ((innerWidth - thickness) / 2) - thickness
const verticalX = (innerWidth + thickness) / 2

const top = _(
  dimensions.x,
  ty(horizontalY)
)

const bottom = _(
  dimensions.x,
  ty(-horizontalY)
)

const vertical = _(dimensions.y)

const leftDiagonal = _(
  dimensions.y,
  tx(-thickness),
  $tx('py', -diagonalX)
)

const rightDiagonal = _(
  dimensions.y,
  tx(thickness),
  $tx('py', diagonalX)
)

const leftVertical = _(
  dimensions.y,
  tx(-verticalX)
)

const rightVertical = _(
  dimensions.y,
  tx(verticalX)
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
