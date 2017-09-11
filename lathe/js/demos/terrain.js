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

terrain = (map, heights, scale = new THREE.Vector3(1, 1, 1)) => {
  let height = char => scale.y * heights.indexOf(char)

  let geometries = []

  map.map((row, i) =>
    row.split('').map((char, j) => {
      if (i < map.length - 1 && j < row.length - 1) {
        geometries.push(_(
          scale.toArray(),
          t(j * scale.x, 0, i * scale.z),
          $ty({
            nx_py_nz: height(char),
            px_py_nz: height(row[j + 1]),
            nx_py_pz: height(map[i + 1][j]),
            px_py_pz: height(map[i + 1][j + 1]),
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
