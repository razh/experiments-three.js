/*
  Facade

  ┌─────────────────────────┐
  │                         │
  ├─┬─────┬─┬─────┬─┬─────┬─┤  ─┬─
  │ │     │ │     │ │     │ │   │
  │ │     │ │     │ │     │ │   │  windowHeight
  ├─┴─────┴─┴─────┴─┴─────┴─┤  ─┴─
  │                         │
  ├─┬─────┬─┬─────┬─┬─────┬─┤
  │ │     │ │     │ │     │ │
  │ │     │ │     │ │     │ │
  ├─┴─────┴─┴─────┴─┴─────┴─┤  ─┬─
  │                         │   │  floorHeight
  └─────────────────────────┘  ─┴─
    |─────|        ▲
                   │
  windowWidth      │
              windowSpacing

  - floorCount: 2
    - floorHeight: 4

  - windowCount: 3
    - windowWidth: 6
    - windowHeight: 4
    - windowSpacing: 3
 */

const floorCount = 2
const floorHeight = 4

const windowCount = 3
const windowWidth = 7
const windowHeight = 4
const windowSpacing = 3

const thickness = 1

const facade = []

const floor = _(
  [
    ((windowWidth + windowSpacing) * windowCount) + windowSpacing,
    floorHeight,
    thickness,
  ],
  align('nx_ny'),
)

const windowSpacer = _(
  [windowSpacing, windowHeight, thickness],
  align('nx_ny'),
)

for (let y = 0; y < floorCount + 1; y++) {
  // Floors
  facade.push(
    _(
      floor.clone(),
      ty((floorHeight + windowHeight) * y),
    ),
  )

  if (y >= floorCount) {
    break
  }

  for (let x = 0; x < windowCount + 1; x++) {
    // Window spacers
    facade.push(
      _(
        windowSpacer.clone(),
        tx((windowWidth + windowSpacing) * x),
        ty(((floorHeight + windowHeight) * y) + floorHeight),
      ),
    )
  }
}

return facade
