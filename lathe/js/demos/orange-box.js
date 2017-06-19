const tileSize = 16

const orange = defaultColor('orange')
const grey = defaultColor('lightgrey')

const alignBottom = align('ny')

const empty = () => new THREE.Geometry()

const tile = () => _([tileSize, 1, tileSize], alignBottom)
const orangeTile = () => orange(tile())
const greyTile = () => grey(tile())

const box = () => _([tileSize, tileSize, tileSize], alignBottom);
const orangeBox = () => orange(box())
const greyBox = () => grey(box())

return [
  [greyBox(), orangeBox(), orangeTile()],
  [greyTile(), greyTile(), orangeTile()],
  [empty(), greyTile(), orangeTile()],
]
  .map((row, rowIndex) =>
    row.map((geometry, colIndex) =>
      t(colIndex * tileSize, 0, rowIndex * tileSize)(geometry),
    ),
  )
  .reduce((a, b) => a.concat(b), [])
