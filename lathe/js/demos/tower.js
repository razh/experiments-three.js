return _([1, 12, 1.1],
  $s({ top: [ 0.8, 1, 0.8] }),
  align('bottom'),
  color({ top: '#323', bottom: '#2c9' }),
  $t({
    top_right: { y: 0.3 },
    front_left: { x: 0.2 },
    left_top_front: { z: -0.3 },
    left_top_back: [0.1, -0.2, 0.3],
    px_py_pz: [-0.1, 0.4, -0.2]
  })
)
