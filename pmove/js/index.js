import { Player } from './player.js';

const { THREE } = window;

const keys = {};

let container;

let scene, camera, renderer;

const playerDimensions = new THREE.Vector3(30, 56, 30);
let player, playerMesh;

const clock = new THREE.Clock();
let running = true;

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

const update = (() => {
  const dt = 1 / 60;
  let accumulatedTime = 0;

  return () => {
    const frameTime = Math.min(clock.getDelta(), 0.1);
    accumulatedTime += frameTime;

    player.command.forwardmove = 0;
    player.command.rightmove = 0;
    player.command.upmove = 0;

    if (keys.KeyW || keys.ArrowUp) player.command.forwardmove += 127;
    if (keys.KeyS || keys.ArrowDown) player.command.forwardmove -= 127;
    if (keys.KeyA || keys.ArrowLeft) player.command.rightmove -= 127;
    if (keys.KeyD || keys.ArrowRight) player.command.rightmove += 127;
    if (keys.Space) player.command.upmove += 127;

    player.viewForward.set(0, 0, -1);
    player.viewRight.set(1, 0, 0);

    player.frametime = dt;

    while (accumulatedTime >= dt) {
      player.update();

      accumulatedTime -= dt;
    }

    playerMesh.position.copy(player.current.position);
    camera.position.copy(playerMesh.position);
    camera.position.y += playerDimensions.y;
  };
})();

function render() {
  renderer.render(scene, camera);
}

function animate() {
  update();
  render();

  if (running) {
    requestAnimationFrame(animate);
  }
}

init();
animate();

document.addEventListener('keydown', event => {
  // Pause/play.
  if (event.code === 'KeyP') {
    running = !running;
    if (running) {
      animate();
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

document.addEventListener('keydown', event => (keys[event.code] = true));
document.addEventListener('keyup', event => (keys[event.code] = false));
