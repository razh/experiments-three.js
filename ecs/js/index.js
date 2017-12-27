/* global THREE, withEntity */

(() => {
  'use strict';

  let container;

  let scene;
  let camera;
  let renderer;

  const clock = new THREE.Clock();
  let running = true;

  const MeshEntity = withEntity(THREE.Mesh);

  class CircleMovementComponent {
    constructor(...args) {
      this.circle = new THREE.Sphere(...args);
    }

    update() {
      const time = clock.elapsedTime;

      this.parent.position.copy(this.circle.center);
      this.parent.position.x += this.circle.radius * Math.cos(time);
      this.parent.position.z += this.circle.radius * Math.sin(time);
    }
  }

  class ColorComponent {
    update() {
      const time = clock.elapsedTime;

      const hue = (Math.sin(time / 16) + 1) / 2;
      this.parent.material.color.setHSL(hue, 1, 0.5);
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
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    camera.position.set(0, 4, 12);
    camera.lookAt(new THREE.Vector3());

    new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight('#777'));

    const light = new THREE.DirectionalLight();
    light.position.set(0, 8, 8);
    scene.add(light);

    const entity = new MeshEntity(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshStandardMaterial()
    );
    entity.addComponent(
      new CircleMovementComponent(new THREE.Vector3(), 6),
      new ColorComponent()
    );
    scene.add(entity);
  }

  function update() {
    clock.getDelta();

    scene.traverse(object => {
      if (typeof object.update === 'function') {
        object.update();
      }
    });
  }

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    if (!running) {
      return;
    }

    update();
    render();
    requestAnimationFrame(animate);
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
})();
