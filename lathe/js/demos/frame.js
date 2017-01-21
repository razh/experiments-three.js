size = 8
width = 1

halfWidth = width / 2
radius = size / 2 - halfWidth

dimensions = {
  x: [width, size, width],
  y: [size, width, width],
  corner: [width, width, width],
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
