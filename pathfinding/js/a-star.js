import { minHeap } from './heap.js';

function reconstructPath(parents, node) {
  const path = [];

  while (node) {
    path.unshift(node);
    node = parents.get(node);
  }

  return path;
}

export function aStar(start, target, nodes, network) {
  // Distances from start to node.
  const g = new Map();
  g.set(start, 0);

  // Distances from node to target.
  const f = new Map();
  f.set(start, start.distanceTo(target));

  const closedSet = new Set();
  const openSet = minHeap((a, b) => f.get(a) - f.get(b));
  openSet.push(start);

  const parents = new Map();

  while (!openSet.empty()) {
    const node = openSet.pop();
    closedSet.add(node);

    if (node === target) {
      return reconstructPath(parents, node);
    }

    const neighbors = network[nodes.indexOf(node)].map(index => nodes[index]);

    neighbors.forEach(neighbor => {
      if (closedSet.has(neighbor)) {
        return;
      }

      const distance = g.get(node) + node.distanceTo(neighbor);
      if (!g.has(neighbor) || distance < g.get(neighbor)) {
        g.set(neighbor, distance);
        f.set(neighbor, distance + neighbor.distanceTo(target));

        openSet.push(neighbor);
        parents.set(neighbor, node);
      }
    });
  }
}
