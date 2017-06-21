const tileSize = 16

const orange = defaultColor('orange')
const grey = defaultColor('lightgrey')

const alignBottom = align('ny')

const empty = () => new THREE.Geometry()

const tile = () => _([tileSize, 1, tileSize], alignBottom)
const orangeTile = () => orange(tile())
const greyTile = () => grey(tile())

const boxLarge = () => _([tileSize, tileSize, tileSize], alignBottom);
const orangeBoxLarge = () => orange(boxLarge())
const greyBoxLarge = () => grey(boxLarge())

const boxMedium = () => _([0.5 * tileSize, 0.5 * tileSize, 0.5 * tileSize], alignBottom);
const orangeBoxMedium = () => orange(boxMedium())
const greyBoxMedium = () => grey(boxMedium())

const boxSmall = () => _([0.25 * tileSize, 0.25 * tileSize, 0.25 * tileSize], alignBottom);
const orangeBoxSmall = () => orange(boxSmall())
const greyBoxSmall = () => grey(boxSmall())

return [
  [
    $$([
      greyBoxLarge(),
      _(greyBoxMedium(), ty(tileSize)),
      _(greyBoxSmall(), ty(1.5 * tileSize)),
    ]),
    orangeBoxLarge(),
    $$([orangeTile(), _(orangeBoxMedium(), tx(0.2 * tileSize))]),
  ],
  [greyTile(), greyTile(), $$([orangeTile(), _(orangeBoxSmall(), tx(0.3 * tileSize))])],
  [empty(), greyTile(), orangeTile()],
]
  .map((row, rowIndex) =>
    row.map((geometry, colIndex) =>
      t(colIndex * tileSize, 0, rowIndex * tileSize)(geometry),
    ),
  )
  .reduce((a, b) => a.concat(b), [])
