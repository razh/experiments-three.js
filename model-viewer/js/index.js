/* global THREE */

(() => {
  'use strict';

  let container;

  let scene;
  let camera;
  let controls;
  let renderer;

  const loader = new THREE.OBJLoader2();
  let group;

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    camera.position.set(0, 0, -16);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    scene.add(new THREE.AmbientLight('#777'));

    const light = new THREE.DirectionalLight();
    light.position.set(16, 16, 16);
    scene.add(light);
  }

  function render() {
    renderer.render(scene, camera);
  }

  init();
  render();

  document.addEventListener('drop', event => {
    event.stopPropagation();
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', event => {
      scene.remove(group);
      group = loader.parse(event.target.result);
      scene.add(group);
      render();
    });
    reader.readAsArrayBuffer(file);
  });

  document.addEventListener('dragover', event => {
    event.stopPropagation();
    event.preventDefault();
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  });
})();
