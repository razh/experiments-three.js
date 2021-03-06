nemaki = _ (
  [2, 3, 2],
  $s('ny', [1.1, 1, 1.1]),
)

leftNemaki = _(
  nemaki.clone(),
  tx(-6),
)

rightNemaki = _(
  nemaki.clone(),
  tx(6),
)

hashira = _(
  [1.5, 16, 1.5],
  defaultColor('tomato'),
  relativeAlign('ny')(nemaki, 'py'),
  $s('py', [0.6, 1, 0.6]),
)

leftHashira = _(
  hashira.clone(),
  tx(-6),
)

rightHashira = _(
  hashira.clone(),
  tx(6),
)

nuki = _(
  [18, 0.6, 0.5],
  defaultColor('tomato'),
  relativeAlign('py')(hashira, 'py'),
  ty(-2),
  $tx({
    px_ny: -0.3,
    nx_ny: 0.3,
  }),
)

gakuzuka = _(
  [0.6, 2, 0.4],
  defaultColor('tomato'),
  relativeAlign('ny')(nuki, 'py'),
)

shimaki = _(
  [18, 0.6, 1],
  defaultColor('tomato'),
  relativeAlign('ny')(gakuzuka, 'py'),
  $tx({
    px_ny: -0.5,
    nx_ny: 0.5,
  }),
  $sz('ny', 0.9),
)

kasagi = _(
  [24, 1.4, 2],
  defaultColor('tomato'),
  relativeAlign('ny')(shimaki, 'py'),
  $tx({
    px_ny: -1,
    nx_ny: 1,
  }),
  $sz('ny', 0.8),
)

torii = [
  leftNemaki,
  rightNemaki,
  leftHashira,
  rightHashira,
  nuki,
  gakuzuka,
  shimaki,
  kasagi,
]

return torii
