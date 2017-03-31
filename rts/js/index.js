/* global THREE, Destroy */

(function() {
  'use strict';

  let container;

  let scene;
  let camera;
  let controls;
  let renderer;

  let hud;
  let selection;
  let selectableGroup;

  const clock = new THREE.Clock();
  let running = true;

  const state = {
    isMouseDown: false,
    mouse: {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
    },
  };

  function toClipSpace(vector) {
    return vector.set(
      (vector.x / renderer.domElement.width) * 2 - 1,
      -(vector.y / renderer.domElement.height) * 2 + 1
    );
  }

  class RTSControls extends THREE.Object3D {
    constructor(object, domElement = document) {
      super();

      this.object = object;
      this.domElement = domElement;

      this.keys = {};

      this.speed = 256;
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
      state.isMouseDown = true;
      state.mouse.start.x = event.clientX;
      state.mouse.start.y = event.clientY;
      state.mouse.end.x = event.clientX;
      state.mouse.end.y = event.clientY;
    }

    onMouseMove(event) {
      // console.log(event);
      if (state.isMouseDown) {
        state.mouse.end.x = event.clientX;
        state.mouse.end.y = event.clientY;
      }
    }

    onMouseUp(event) {
      console.log(event);
      state.isMouseDown = false;
      state.mouse.start.x = 0;
      state.mouse.start.y = 0;
      state.mouse.end.x = 0;
      state.mouse.end.y = 0;
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

  class Selection extends THREE.Group {
    constructor() {
      super();

      this.fill = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1)
          .rotateY(Math.PI)
          .translate(0.5, 0.5, 0),
        new THREE.MeshBasicMaterial({
          opacity: 0.1,
          transparent: true,
        })
      );

      this.stroke = new THREE.LineSegments(
        new THREE.EdgesGeometry(this.fill.geometry),
        new THREE.LineBasicMaterial()
      );

      this.add(this.fill);
      this.add(this.stroke);
    }

    rect(x = 0, y = 0, width = 0, height = 0) {
      this.visible = width && height;

      this.position.setX(x);
      this.position.setY(y);
      this.scale.setX(width || 1);
      this.scale.setY(height || 1);
    }

    contains(scene, camera) {
      const objects = [];

      camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      const viewProjectionMatrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      const selectionBox = new THREE.Box2().setFromPoints(
        [
          new THREE.Vector2().copy(state.mouse.start),
          new THREE.Vector2().copy(state.mouse.end)
        ].map(toClipSpace)
      );

      const frustum = new THREE.Frustum().setFromMatrix(viewProjectionMatrix);
      const boundingBox = new THREE.Box3();

      scene.traverseVisible(object => {
        if (!object.isMesh) {
          return;
        }

        object.material.color.set('#fff');

        // Skip objects outside of frustum.
        if (!frustum.intersectsObject(object)) {
          return;
        }

        boundingBox
          .setFromObject(object)
          .applyMatrix4(viewProjectionMatrix);

        if (selectionBox.intersectsBox(boundingBox)) {
          objects.push(object);
          object.material.color.set('#0f0');
        }
      });

      return objects;
    }
  }

  class HUD {
    constructor(width, height) {
      this.camera = new THREE.OrthographicCamera(0, width, 0, height, 0, 1);
      this.scene = new THREE.Scene();
    }

    setSize(width, height) {
      this.camera.right = width;
      this.camera.bottom = height;
      this.camera.updateProjectionMatrix();
    }

    render(renderer) {
      const { autoClear } = renderer;
      renderer.autoClear = false;
      renderer.render(this.scene, this.camera);
      renderer.autoClear = autoClear;
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

    selectableGroup = new THREE.Group;
    scene.add(selectableGroup);

    const box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(16, 16, 16),
      new THREE.MeshStandardMaterial()
    );
    box.translateY(8).rotateY(Math.PI / 2);
    selectableGroup.add(box);

    const boxGeometry = new THREE.BoxBufferGeometry(2, 2, 2);
    const boxCount = 32;
    for (var i = 0; i < boxCount; i++) {
      for (var j = 0; j < boxCount; j++) {
        const box = new THREE.Mesh(
          boxGeometry,
          new THREE.MeshStandardMaterial()
        )
          .translateY(8)
          .rotateY(Math.PI / 2)
          .translateX(4 * (i - (boxCount / 2)))
          .translateZ(4 * (j - (boxCount / 2)));

        selectableGroup.add(box);
      }
    }

    const light = new THREE.DirectionalLight();
    light.position.set(128, 48, 0);
    scene.add(light);

    hud = new HUD(window.innerWidth, window.innerHeight);

    selection = new Selection();
    selection.rect(0, 0, 128, 128);

    hud.scene.add(selection);
  }

  const update = (function() {
    const dt = 1 / 60;
    let accumulatedTime = 0;

    return () => {
      const frameTime = Math.min(clock.getDelta(), 0.1);
      accumulatedTime += frameTime;

      const { mouse } = state;

      selection.rect(
        mouse.start.x,
        mouse.start.y,
        mouse.end.x - mouse.start.x,
        mouse.end.y - mouse.start.y
      );

      if (state.isMouseDown) {
        console.log(selection.contains(selectableGroup, camera));
      }

      while (accumulatedTime >= dt) {
        controls.update(dt);

        scene.traverse(object => {
          if (typeof object.update === 'function') {
            object.update(dt);
          }
        });

        accumulatedTime -= dt;
      }

      Destroy.update();
    };
  }());

  function render() {
    update();
    renderer.render(scene, camera);
    hud.render(renderer);

    if (running) {
      requestAnimationFrame(render);
    }
  }

  init();
  render();

  document.addEventListener( 'keydown', event => {
    // Pause/play.
    if (event.code === 'KeyP') {
      running = !running;
      if (running) {
        render();
      }
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    hud.setSize(window.innerWidth, window.innerHeight);
    render();
  });
})();
