const thickness = 1
const outerHeight = 8
const innerHeight = outerHeight - (2 * thickness)
const outerWidth = 16
const innerWidth = outerWidth - (2 * thickness)

const dimensions = {
  x: [outerWidth, thickness, thickness],
  y: [thickness, innerHeight, thickness],
}

const top = _(dimensions.x, ty((outerHeight - thickness) / 2))
const bottom = _(dimensions.x, ty(-(outerHeight - thickness) / 2))
const vertical = _(dimensions.y)

const leftDiagonal = _(
  dimensions.y,
  tx(-thickness),
  $tx('py', -(((innerWidth - thickness) / 2) - thickness))
)

const rightDiagonal = _(
  dimensions.y,
  tx(thickness),
  $tx('py', ((innerWidth - thickness) / 2) - thickness)
)

const leftVertical = _(
  dimensions.y,
  tx((innerWidth + thickness) / 2)
)

const rightVertical = _(
  dimensions.y,
  tx(-(innerWidth + thickness) / 2)
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
