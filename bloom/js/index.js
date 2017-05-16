/* global THREE, Bloom */

(() => {
  'use strict';

  let container;

  let scene;
  let camera;
  let renderer;

  let geometry;
  let material;
  let mesh;

  let bloom;

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    camera.position.set(0, 0, 16);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    const light = new THREE.DirectionalLight();
    light.position.set(8, 8, 8);
    scene.add(light);

    geometry = new THREE.IcosahedronBufferGeometry(4, 1);
    material = new THREE.MeshStandardMaterial({
      color: 'lightsteelblue',
      shading: THREE.FlatShading,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    bloom = new Bloom(renderer, scene, camera);
  }

  function render() {
    bloom.render();
  }

  init();
  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    bloom.setSize(window.innerWidth, window.innerHeight);
    render();
  });
})();
