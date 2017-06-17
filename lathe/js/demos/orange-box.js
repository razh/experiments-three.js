const tileSize = 16

const orange = defaultColor('orange')
const grey = defaultColor('lightgrey')

const empty = () => new THREE.Geometry()

const orangeTile = () => _(
  [tileSize, 1, tileSize],
  orange,
)

const greyTile = () => _(
  [tileSize, 1, tileSize],
  grey,
)

return [
  [orangeTile(), empty(), greyTile()],
]
  .map((row, rowIndex) =>
    row.map((geometry, colIndex) =>
      t(colIndex * tileSize, 0, rowIndex * tileSize)(geometry),
    ),
  )
  .reduce((a, b) => a.concat(b), [])
