heights = '0123456789abcdef'

map = [
  '  110000',
  '00110225',
  '00000346',
  ' 0000320',
  ' 000000 ',
  '   0    ',
  '    0   ',
  '00000110',
  '00001110',
  '        ',
]

terrain = (map, heights, scale = 1) => {
  getHeight = char => scale * heights.indexOf(char)

  let geometries = []

  map.map((row, i) =>
    row.split('').map((height, j) => {
      if (i < map.length - 1 && j < row.length - 1) {
        geometries.push(_(
          [1, 1, 1],
          t(j, 0, i),
          $ty({
            nx_py_nz: getHeight(height),
            px_py_nz: getHeight(row[j + 1]),
            nx_py_pz: getHeight(map[i + 1][j]),
            px_py_pz: getHeight(map[i + 1][j + 1]),
          }),
        ));
      }
    }),
  )

  return geometries
}

return [
  ...terrain(map, heights)
    .map(color({
      py: '#0af',
      ny: '#000',
    })),
]
