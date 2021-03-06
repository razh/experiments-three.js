import { minHeap } from './heap.js';

const { THREE } = window;

// https://bl.ocks.org/mbostock/83d1073cb0a45ac158fb
function generateMaze(cellWidth, cellHeight) {
  const N = 1 << 0;
  const S = 1 << 1;
  const W = 1 << 2;
  const E = 1 << 3;

  const cells = new Array(cellWidth * cellHeight);
  const frontier = minHeap((a, b) => a.weight - b.weight);
  const startIndex = (cellHeight - 1) * cellWidth;

  cells[startIndex] = 0;

  frontier.push({ index: startIndex, direction: N, weight: Math.random() });
  frontier.push({ index: startIndex, direction: E, weight: Math.random() });

  while (!frontier.empty()) {
    const edge = frontier.pop();
    const i0 = edge.index;
    const d0 = edge.direction;

    let i1 = i0;
    if (d0 === N) {
      i1 -= cellWidth;
    } else if (d0 === S) {
      i1 += cellWidth;
    } else if (d0 === W) {
      i1--;
    } else {
      i1++;
    }

    if (cells[i1] === undefined) {
      const x0 = i0 % cellWidth;
      const y0 = Math.floor(i0 / cellWidth);

      let x1;
      let y1;
      let d1;

      if (d0 === N) {
        x1 = x0;
        y1 = y0 - 1;
        d1 = S;
      } else if (d0 === S) {
        x1 = x0;
        y1 = y0 + 1;
        d1 = N;
      } else if (d0 === W) {
        x1 = x0 - 1;
        y1 = y0;
        d1 = E;
      } else {
        x1 = x0 + 1;
        y1 = y0;
        d1 = W;
      }

      cells[i0] |= d0;
      cells[i1] |= d1;

      if (y1 > 0 && cells[i1 - cellWidth] === undefined) {
        frontier.push({ index: i1, direction: N, weight: Math.random() });
      }

      if (y1 < cellHeight - 1 && cells[i1 + cellWidth] === undefined) {
        frontier.push({ index: i1, direction: S, weight: Math.random() });
      }

      if (x1 > 0 && cells[i1 - 1] === undefined) {
        frontier.push({ index: i1, direction: W, weight: Math.random() });
      }

      if (x1 < cellWidth - 1 && cells[i1 + 1] === undefined) {
        frontier.push({ index: i1, direction: E, weight: Math.random() });
      }
    }
  }

  return cells;
}

function fillMaze(cells, width, cellWidth, cellDepth) {
  const grid = [];

  function fill(x, z) {
    // Add border-width of 1.
    grid[(z + 1) * width + (x + 1)] = 1;
  }

  const S = 1 << 1;
  const E = 1 << 3;

  for (let z = 0, i = 0; z < cellDepth; z++) {
    for (let x = 0; x < cellWidth; x++, i++) {
      fill(2 * x, 2 * z);
      if (cells[i] & S) fill(2 * x, 2 * z + 1);
      if (cells[i] & E) fill(2 * x + 1, 2 * z);
    }
  }

  return grid;
}

export function createMazeGeometry(
  width,
  depth,
  scale = new THREE.Vector3(1, 1, 1),
) {
  const geometries = [];

  const cellWidth = Math.floor((width - 1) / 2);
  const cellDepth = Math.floor((depth - 1) / 2);

  const cells = generateMaze(cellWidth, cellDepth);
  const grid = fillMaze(cells, width, cellWidth, cellDepth);

  function createBox(x, z, w = 1, d = 1) {
    geometries.push(
      new THREE.BoxBufferGeometry(w, 1, d)
        // Reset origin.
        .translate((w - 1) / 2, 0, (d - 1) / 2)
        // Position.
        .translate(x, 0, z)
        .scale(...scale.toArray()),
    );
  }

  // Invert grid to create mask.
  const mask = new Int8Array(width * depth).fill(1);
  for (let i = 0; i < grid.length; i++) {
    mask[i] = !grid[i];
  }

  // Greedy meshing.
  // https://0fps.net/2012/06/30/meshing-in-a-minecraft-game/
  for (let z = 0, n = 0; z < depth; z++) {
    // eslint-disable-next-line no-empty
    for (let x = 0; x < width; ) {
      if (mask[n]) {
        let w;

        // Compute width.
        for (w = 1; mask[n + w] && x + w < width; w++) {}

        // Compute depth.
        let done = false;
        let d;
        for (d = 1; z + d < depth; d++) {
          for (let i = 0; i < w; i++) {
            if (!mask[n + i + d * width]) {
              done = true;
              break;
            }
          }
          if (done) {
            break;
          }
        }

        createBox(x, z, w, d);

        // Zero-out mask.
        for (let j = 0; j < d; j++) {
          for (let i = 0; i < w; i++) {
            mask[n + i + j * width] = false;
          }
        }

        // Increment counters and continue.
        x += w;
        n += w;
      } else {
        x++;
        n++;
      }
    }
  }

  return {
    grid,
    geometries,
  };
}

// http://www.redblobgames.com/pathfinding/visibility-graphs/analyze.js
export function findExteriorCorners(grid, width, depth) {
  const corners = [];

  // Is empty?
  const get = (x, z) => grid[z * width + x] === 1;

  for (let z = 1; z < depth - 1; z++) {
    for (let x = 1; x < width - 1; x++) {
      if (get(x, z)) {
        const NW = get(x - 1, z - 1);
        const N  = get(x,     z - 1);
        const NE = get(x + 1, z - 1);
        const W  = get(x - 1, z    );
        const E  = get(x + 1, z    );
        const SW = get(x - 1, z + 1);
        const S  = get(x,     z + 1);
        const SE = get(x + 1, z + 1);

        if (
          /*
            Corners:

              ┌──┐
              │NW│ N
              └──┘
               W
           */
          (!NW && N && W) ||
          (!NE && N && E) ||
          (!SW && S && W) ||
          (!SE && S && E) ||
          /*
            Dead-ends:

              ┌──┐   ┌──┐
              │NW│ N │NE│
              ├──┤   ├──┤
              │W │   │E │
              ├──┼───┼──┤
              │SW│ S │SE│
              └──┴───┴──┘
           */
          (N && !NW && !NE && !W && !E && !SW && !S && !SE) ||
          (S && !NW && !N && !NE && !W && !E && !SW && !SE) ||
          (W && !NW && !N && !NE && !E && !SW && !S && !SE) ||
          (E && !NW && !N && !NE && !W && !SW && !S && !SE)
        ) {
          corners.push([x, z]);
        }
      }
    }
  }
  return corners;
}
