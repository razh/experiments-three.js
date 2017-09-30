/* global THREE */

'use strict';

/* exported computeNeighbors */
function computeNeighbors(nodes, objects, recursive) {
  const adjacencyList = nodes.map(() => []);

  // Calculate node visibility with line-of-sight.
  const raycaster = new THREE.Raycaster();
  const { ray } = raycaster;
  for (let i = 0; i < nodes.length; i++) {
    ray.origin.copy(nodes[i]);

    for (let j = i + 1; j < nodes.length; j++) {
      ray.direction.subVectors(nodes[j], nodes[i]);
      const distance = ray.direction.length();
      ray.direction.normalize();

      const intersections = raycaster.intersectObjects(objects, recursive);

      if (!intersections.length || distance < intersections[0].distance) {
        adjacencyList[i].push(j);
        adjacencyList[j].push(i);
      }
    }
  }

  // Remove edges within a 45 degree angle.
  const tolerance = Math.cos(THREE.Math.degToRad(45) / 2);

  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();

  for (let i = 0; i < adjacencyList.length; i++) {
    const edges = adjacencyList[i];
    const edgeSet = new Set(edges);
    const a = nodes[i];

    for (let j = 0; j < edges.length; j++) {
      const b = nodes[edges[j]];

      v0.subVectors(b, a);
      const length0 = v0.length();
      v0.normalize();

      for (let k = j + 1; k < edges.length; k++) {
        const c = nodes[edges[k]];

        v1.subVectors(c, a);
        const length1 = v1.length();
        v1.normalize();

        if (v0.dot(v1) >= tolerance) {
          // Remove longer redundant edge.
          if (length0 < length1) {
            edgeSet.delete(edges[k]);
          } else {
            edgeSet.delete(edges[j]);
          }
        }
      }
    }

    adjacencyList[i] = [...edgeSet];
  }

  return adjacencyList;
}
