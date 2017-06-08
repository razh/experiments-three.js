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
    - windowWidth: 7
    - windowHeight: 4
    - windowSpacing: 3
 */

facade = ({
  floorCount = 2,
  floorHeight = 4,

  windowCount = 3,
  windowWidth = 7,
  windowHeight = 4,
  windowSpacing = 3,

  thickness = 1,
} = {}) => {
  const geometries = []

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
    geometries.push(
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
      geometries.push(
        _(
          windowSpacer.clone(),
          tx((windowWidth + windowSpacing) * x),
          ty(((floorHeight + windowHeight) * y) + floorHeight),
        ),
      )
    }
  }

  return geometries
}

return facade()
