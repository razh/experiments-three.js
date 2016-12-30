spacer = 2

foot = _(
  [3.2, 1.2, 6]
  , align('ny')
  )

footLeft = _(foot.clone(), translate(4, 0, 1.2))
footRight = _(foot.clone(), translate(-4, 0, 1.2))

lowerLeg = _(
  [1.8, 14, 1.8]
  , relativeAlign('ny')(foot, 'py')
  , translate(0, spacer, 0)
  )

lowerLegLeft = _(lowerLeg.clone(), translate(4, 0, 0))
lowerLegRight = _(lowerLeg.clone(), translate(-4, 0, 0))

upperLeg = _(
  [2, 14, 2]
  , relativeAlign('ny')(lowerLeg, 'py')
  , translate(0, spacer, 0)
  )

upperLegLeft = _(upperLeg.clone(), translate(4, 0, 0))
upperLegRight = _(upperLeg.clone(), translate(-4, 0, 0))

hips = _(
  [8, 4.8, 3.2]
  , relativeAlign('ny')(upperLeg, 'py')
  , translate(0, spacer, 0)
  )

chest = _(
  [11, 16, 4]
  , relativeAlign('ny')(hips, 'py')
  , translate(0, spacer, 0)
  )

head = _(
  [4, 6, 4]
  , relativeAlign('ny')(chest, 'py')
  , translate(0, spacer, 0)
  )

upperArm = _(
  [1.6, 12, 1.6]
  )

upperArmLeft = _(
  upperArm.clone()
  , relativeAlign('px')(chest, 'nx')
  , translate(-spacer, 0, 0)
  )

upperArmRight = _(
  upperArm.clone()
  , relativeAlign('nx')(chest, 'px')
  , translate(spacer, 0, 0)
  )

lowerArm = _(
  [1.6, 10, 1.6]
  )

lowerArmLeft = _(
  lowerArm.clone()
  , relativeAlign('py')(upperArmLeft, 'ny')
  , translate(0, -spacer, 0)
  )

lowerArmRight = _(
  lowerArm.clone()
  , relativeAlign('py')(upperArmRight, 'ny')
  , translate(0, -spacer, 0)
  )

hand = _(
  [1.6, 4, 2]
  )

handLeft = _(
  hand.clone()
  , relativeAlign('py')(lowerArmLeft, 'ny')
  , translate(0, -spacer, 0)
  )

handRight = _(
  hand.clone()
  , relativeAlign('py')(lowerArmRight, 'ny')
  , translate(0, -spacer, 0)
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
