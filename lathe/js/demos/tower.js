return _([10, 120, 11],
  $s({ top: [0.8, 1, 0.8] }),
  align('bottom'),
  color({ top: '#323', bottom: '#2c9' }),
  $t({
    top_right: { y: 3 },
    front_left: { x: 2 },
    left_top_front: { z: -3 },
    left_top_back: [1, -2, 3],
    px_py_pz: [-1, 4, -2],
  })
)
