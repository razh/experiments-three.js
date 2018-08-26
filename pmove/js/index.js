import { Player } from './player.js';

const { THREE } = window;

const keys = {};

let container;

let scene, camera, renderer;

let player, playerMesh;

const clock = new THREE.Clock();

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
  camera.position.set(0, 64, 128);

  scene.add(new THREE.AmbientLight('#777'));

  const light = new THREE.DirectionalLight();
  light.position.set(128, 128, 128);
  scene.add(light);

  // Plane
  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(512, 512),
    new THREE.MeshStandardMaterial(),
  );
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  const playerDimensions = new THREE.Vector3(30, 56, 30);

  player = new Player();
  playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(...playerDimensions.toArray()).translate(
      0,
      playerDimensions.y / 2,
      0,
    ),
    new THREE.MeshStandardMaterial({ color: '#0f0' }),
  );
  scene.add(playerMesh);
}

function update(dt) {
  player.command.forwardmove = 0;
  player.command.rightmove = 0;

  if (keys.KeyW || keys.ArrowUp) player.command.forwardmove += 127;
  if (keys.KeyS || keys.ArrowDown) player.command.forwardmove -= 127;
  if (keys.KeyA || keys.ArrowLeft) player.command.rightmove -= 127;
  if (keys.KeyD || keys.ArrowRight) player.command.rightmove += 127;

  player.viewForward.set(0, 0, -1);
  player.viewRight.set(1, 0, 0);

  player.frametime = dt;
  player.update();

  playerMesh.position.copy(player.current.position);
  camera.position.x = playerMesh.position.x;
  camera.position.z = playerMesh.position.z;
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  const dt = clock.getDelta();
  update(dt);
  render();
  requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

document.addEventListener('keydown', event => (keys[event.code] = true));
document.addEventListener('keyup', event => (keys[event.code] = false));
