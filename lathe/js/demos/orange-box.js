const tileWidth = 16
const tileDepth = 16

const orange = defaultColor('orange')
const grey = defaultColor('lightgrey')

const orangeTile = _(
  [tileWidth, 1, tileDepth],
  orange,
  tx(-tileWidth),
)

const greyTile = _(
  [tileWidth, 1, tileDepth],
  grey,
  tx(tileWidth),
)

return [orangeTile, greyTile]
