/* eslint-env es6 */
/* global THREE */
(function() {
  'use strict';

  let container;

  let scene;
  let camera;
  let controls;
  let renderer;

  class RTSControls extends THREE.Object3D {
    constructor(object, domElement = document) {
      super();

      this.object = object;
      this.domElement = domElement;

      this.keys = {};

      this.speed = 128;
      this.direction = new THREE.Vector3();
      this.offset = new THREE.Vector3();

      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);

      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onContextMenu = this.onContextMenu.bind(this);
      this.onWheel = this.onWheel.bind(this);

      this.addEventListeners();
    }

    onKeyDown(event) {
      this.keys[event.code] = true;
    }

    onKeyUp(event) {
      this.keys[event.code] = false;
    }

    onMouseDown(event) {
      console.log(event);
    }

    onMouseMove(event) {
      // console.log(event);
    }

    onMouseUp(event) {
      console.log(event);
    }

    onContextMenu(event) {
      event.preventDefault();
      console.log(event);
    }

    onWheel() {
      console.log(event);
    }

    addEventListeners() {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);

      this.domElement.addEventListener('mousedown', this.onMouseDown);
      this.domElement.addEventListener('mousemove', this.onMouseMove);
      this.domElement.addEventListener('mouseup', this.onMouseUp);
      this.domElement.addEventListener('contextmenu', this.onContextMenu);
      this.domElement.addEventListener('wheel', this.onWheel);
    }

    removeEventListeners() {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);

      this.domElement.removeEventListener('mousedown', this.onMouseDown);
      this.domElement.removeEventListener('mousemove', this.onMouseMove);
      this.domElement.removeEventListener('mouseup', this.onMouseUp);
      this.domElement.removeEventListener('contextmenu', this.onContextMenu);
      this.domElement.removeEventListener('wheel', this.onWheel);
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

      this.position.addScaledVector(this.direction, this.speed * dt);
      this.object.position.addVectors(this.position, this.offset);
      this.object.lookAt(this.position);
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

    controls = new RTSControls(camera, renderer.domElement);
    controls.offset.copy(camera.position);

    scene.add(new THREE.AmbientLight('#777'));

    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(256, 256),
      new THREE.MeshStandardMaterial()
    );
    plane.rotateX(-Math.PI / 2);
    scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(16, 16, 16),
      new THREE.MeshStandardMaterial()
    );
    box.translateY(8).rotateY(Math.PI / 2);
    scene.add(box);

    const light = new THREE.DirectionalLight();
    light.position.set(128, 48, 0);
    scene.add(light);
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
