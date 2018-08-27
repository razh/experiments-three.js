import { Player } from './player.js';

const { THREE } = window;

const keys = {};

let container;

let scene, camera, renderer;

const playerDimensions = new THREE.Vector3(30, 56, 30);
let player, playerMesh;

const clock = new THREE.Clock();
let running = true;

function pointerLock(controls, element) {
  const hasPointerLock = 'pointerLockElement' in document;

  if (!hasPointerLock) {
    controls.enabled = true;
    return;
  }

  function onPointerLockChange() {
    controls.enabled = element === document.pointerLockElement;
  }

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('click', () => element.requestPointerLock());
}

const Controls = (() => {
  const pitchQuat = new THREE.Quaternion();
  const yawQuat = new THREE.Quaternion();

  return class Controls {
    constructor(object) {
      this.object = object;
      this.sensitivity = 0.002;
      this.enabled = false;

      this.onMouseMove = this.onMouseMove.bind(this);
      document.addEventListener('mousemove', this.onMouseMove);
    }

    onMouseMove(event) {
      if (!this.enabled) {
        return;
      }

      const { movementX, movementY } = event;

      const pitch = -movementY * this.sensitivity;
      const yaw = -movementX * this.sensitivity;

      pitchQuat.set(pitch, 0, 0, 1).normalize();
      yawQuat.set(0, yaw, 0, 1).normalize();

      // pitch * object * yaw
      this.object.quaternion.multiply(pitchQuat).premultiply(yawQuat);
    }

    dispose(document) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }
  };
})();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    90,
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

  // Walls
  const walls = [
    [[-16, 0, -129], [16, 56, -128]],
    [[-64, 0, -129], [-32, 116, -128]],
  ];

  const min = new THREE.Vector3();
  const max = new THREE.Vector3();
  const dimensions = new THREE.Vector3();

  walls.forEach(wall => {
    min.fromArray(wall[0]);
    max.fromArray(wall[1]);

    dimensions.subVectors(max, min);

    const wallMesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(...dimensions.toArray()),
      new THREE.MeshStandardMaterial(),
    );

    wallMesh.position
      .copy(dimensions)
      .multiplyScalar(0.5)
      .add(min);

    scene.add(wallMesh);
  });

  player = new Player();
  playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(...playerDimensions.toArray()).translate(
      0,
      playerDimensions.y / 2,
      0,
    ),
    new THREE.MeshStandardMaterial({ color: '#0f0' }),
  );
  player.mesh = playerMesh;
  scene.add(playerMesh);

  const controls = new Controls(camera);
  pointerLock(controls, renderer.domElement);
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

    if (keys.KeyW || keys.ArrowUp) player.command.forwardmove++;
    if (keys.KeyS || keys.ArrowDown) player.command.forwardmove--;
    if (keys.KeyA || keys.ArrowLeft) player.command.rightmove--;
    if (keys.KeyD || keys.ArrowRight) player.command.rightmove++;
    if (keys.Space) player.command.upmove++;

    const movespeed = 127;
    player.command.forwardmove *= movespeed;
    player.command.rightmove *= movespeed;
    player.command.upmove *= movespeed;

    player.viewForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    player.viewRight
      .set(0, -1, 0)
      .cross(player.viewForward)
      .normalize();

    player.frametime = dt;

    while (accumulatedTime >= dt) {
      player.update();

      accumulatedTime -= dt;
    }

    const DEFAULT_VIEWHEIGHT = 26;

    playerMesh.position.copy(player.current.position);
    camera.position.copy(playerMesh.position);
    camera.position.y += DEFAULT_VIEWHEIGHT;
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
