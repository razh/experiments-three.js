/* global THREE */

(() => {
  'use strict';

  let container;

  let scene, camera, renderer;

  let geometry, material, mesh;

  // Must be odd integers.
  const mazeOptions = {
    xCount: 11,
    zCount: 11,
  };

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
    );
    camera.position.set(
      Math.floor(mazeOptions.xCount / 2),
      Math.max(mazeOptions.xCount, mazeOptions.zCount),
      mazeOptions.zCount,
    );

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.target.set(
      camera.position.x,
      0,
      Math.floor(mazeOptions.zCount / 2),
    );
    controls.update();

    scene.add(new THREE.AmbientLight('#777'));

    const light = new THREE.DirectionalLight();
    light.position.set(8, 8, 8);
    scene.add(light);

    const maze = createMazeGeometry(mazeOptions.xCount, mazeOptions.zCount);

    const wallMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.2,
    });

    const walls = maze.geometries.map(geometry => {
      const mesh = new THREE.Mesh(geometry, wallMaterial);
      scene.add(mesh);
      return mesh;
    });

    const nodeGeometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    const nodeMaterial = new THREE.MeshStandardMaterial({ emissive: '#0f0' });

    const nodes = findExteriorCorners(
      maze.grid,
      mazeOptions.xCount,
      mazeOptions.zCount,
    ).map(([x, z]) => {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.set(x, 0, z);
      scene.add(mesh);

      return mesh.position.clone();
    });

    const adjacencyList = computeNeighbors(nodes, walls);
    const delta = new THREE.Vector3();

    adjacencyList.map((edges, sourceIndex) => {
      const source = nodes[sourceIndex];

      edges.map(targetIndex => {
        const target = nodes[targetIndex];
        delta.subVectors(target, source);
        const arrow = new THREE.ArrowHelper(
          delta,
          source,
          0.4 * delta.length(),
        );
        scene.add(arrow);
      });
    });
  }

  function render() {
    renderer.render(scene, camera);
  }

  init();
  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  });
})();
