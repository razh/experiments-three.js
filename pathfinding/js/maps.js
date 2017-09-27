/* global minHeap */

'use strict';

// https://bl.ocks.org/mbostock/83d1073cb0a45ac158fb
/* exported generateMaze */
function generateMaze(width, height) {
  const N = 1 << 0;
  const S = 1 << 1;
  const W = 1 << 2;
  const E = 1 << 3;

  const cells = new Array(width * height);
  const frontier = minHeap((a, b) => a.weight - b.weight);
  const startIndex = (height - 1) * width;

  cells[startIndex] = 0;

  frontier.push({ index: startIndex, direction: N, weight: Math.random() });
  frontier.push({ index: startIndex, direction: E, weight: Math.random() });

  while (!frontier.empty()) {
    const edge = frontier.pop();
    const i0 = edge.index;
    const d0 = edge.direction;

    let i1 = i0;
    if (d0 === N) {
      i1 -= width;
    } else if (d0 === S) {
      i1 += width;
    } else if (d0 === W) {
      i1--;
    } else {
      i1++;
    }

    if (cells[i1] === undefined) {
      const x0 = i0 % width;
      const y0 = Math.floor(i0 / width);

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

      if (y1 > 0 && cells[i1 - width] === undefined) {
        frontier.push({ index: i1, direction: N, weight: Math.random() });
      }

      if (y1 < height - 1 && cells[i1 + width] === undefined) {
        frontier.push({ index: i1, direction: S, weight: Math.random() });
      }

      if (x1 > 0 && cells[i1 - 1] === undefined) {
        frontier.push({ index: i1, direction: W, weight: Math.random() });
      }

      if (x1 < width - 1 && cells[i1 + 1] === undefined) {
        frontier.push({ index: i1, direction: E, weight: Math.random() });
      }
    }
  }

  return cells;
}
