/* eslint-env es6 */
/* global THREE */
(function() {
  'use strict';

  let container;

  let scene;
  let camera;
  let controls;
  let renderer;

  class RTSControls {
    constructor(object) {
      this.object = object;

      this.keys = {};

      this.speed = 128;
      this.direction = new THREE.Vector3();

      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);

      this.addEventListeners();
    }

    onKeyDown(event) {
      this.keys[event.code] = true;
    }

    onKeyUp(event) {
      this.keys[event.code] = false;
    }

    addEventListeners() {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
    }

    removeEventListeners() {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
    }

    update(dt) {
      const { keys } = this;

      let x = 0;
      let z = 0;

      if (keys.KeyW || keys.ArrowUp) { z--; }
      if (keys.KeyS || keys.ArrowDown) { z++; }
      if (keys.KeyA || keys.ArrowLeft) { x--; }
      if (keys.KeyD || keys.ArrowRight) { x++; }

      if (!x && !z) {
        return;
      }

      this.direction
        .set(x, 0, z)
        .applyQuaternion(this.object.quaternion)
        .setY(0)
        .normalize();

      this.object.position.addScaledVector(this.direction, this.speed * dt);
    }
  }

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    camera.position.set(64, 64, 64);
    camera.lookAt(new THREE.Vector3());

    controls = new RTSControls(camera);

    scene.add(new THREE.AmbientLight('#777'));

    const planeGeometry = new THREE.PlaneBufferGeometry(256, 256);
    const planeMaterial = new THREE.MeshStandardMaterial();
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);

    scene.add(plane);
  }

  const update = (function() {
    const dt = 1 / 60;
    let accumulatedTime = 0;
    let previousTime;

    return () => {
      const time = (performance.now() || 0) * 1e-3;
      if (!previousTime) {
        previousTime = time;
      }

      const frameTime = Math.min(time - previousTime, 0.1);
      accumulatedTime += frameTime;
      previousTime = time;

      while (accumulatedTime >= dt) {
        controls.update(dt);

        scene.traverse(object => {
          if (typeof object.update === 'function') {
            object.update(dt);
          }
        });

        accumulatedTime -= dt;
      }
    };
  }());

  function render() {
    update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
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
