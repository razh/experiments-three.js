const { THREE } = window;

let container;

let scene, camera, renderer;

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
  camera.position.set(0, 1, 2);

  scene.add(new THREE.AmbientLight('#777'));

  const light = new THREE.DirectionalLight();
  light.position.set(8, 8, 8);
  scene.add(light);

  scene.add(
    new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshStandardMaterial(),
    ),
  );
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
