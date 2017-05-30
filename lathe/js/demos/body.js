spacer = 2

foot = _(
  [3.2, 1.2, 6],
  align('ny'),
)

footLeft = _(foot.clone(), translate(4, 0, 1.2))
footRight = _(foot.clone(), translate(-4, 0, 1.2))

lowerLeg = _(
  [1.8, 14, 1.8],
  relativeAlign('ny')(foot, 'py'),
  translateY(spacer),
)

lowerLegLeft = _(lowerLeg.clone(), translateX(4))
lowerLegRight = _(lowerLeg.clone(), translateX(-4))

upperLeg = _(
  [2, 14, 2],
  relativeAlign('ny')(lowerLeg, 'py'),
  translateY(spacer),
)

upperLegLeft = _(upperLeg.clone(), translateX(4))
upperLegRight = _(upperLeg.clone(), translateX(-4))

hips = _(
  [8, 4.8, 3.2],
  relativeAlign('ny')(upperLeg, 'py'),
  translateY(spacer),
)

chest = _(
  [11, 16, 4],
  relativeAlign('ny')(hips, 'py'),
  translateY(spacer),
)

head = _(
  [4, 6, 4],
  relativeAlign('ny')(chest, 'py'),
  translateY(spacer),
)

upperArm = _(
  [1.6, 12, 1.6],
)

upperArmLeft = _(
  upperArm.clone(),
  relativeAlign('px')(chest, 'nx'),
  translateX(-spacer),
)

upperArmRight = _(
  upperArm.clone(),
  relativeAlign('nx')(chest, 'px'),
  translateX(spacer),
)

lowerArm = _(
  [1.6, 10, 1.6],
)

lowerArmLeft = _(
  lowerArm.clone(),
  relativeAlign('py')(upperArmLeft, 'ny'),
  translateY(-spacer),
)

lowerArmRight = _(
  lowerArm.clone(),
  relativeAlign('py')(upperArmRight, 'ny'),
  translateY(-spacer),
)

hand = _(
  [1.6, 4, 2],
)

handLeft = _(
  hand.clone(),
  relativeAlign('py')(lowerArmLeft, 'ny'),
  translateY(-spacer),
)

handRight = _(
  hand.clone(),
  relativeAlign('py')(lowerArmRight, 'ny'),
  translateY(-spacer),
)

body = [
  head,
  chest,
  hips,
  footLeft,
  footRight,
  lowerLegLeft,
  upperLegLeft,
  lowerLegRight,
  upperLegRight,
  upperArmLeft,
  upperArmRight,
  lowerArmLeft,
  lowerArmRight,
  handLeft,
  handRight,
]

console.log(size($$([_(), ...body])))

return body
