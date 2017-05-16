/* global THREE */
/* exported Bloom */

class Bloom {
  constructor(
    renderer,
    scene,
    camera,
    { strength = 1.5, radius = 0.4, threshold = 0.85 } = {}
  ) {
    this.scene = scene;
    this.camera = camera;

    this.renderPass = new THREE.RenderPass(scene, camera);

    this.fxaa = new THREE.ShaderPass(THREE.FXAAShader);
    this.fxaa.uniforms.resolution.value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );

    this.copy = new THREE.ShaderPass(THREE.CopyShader);
    this.copy.renderToScreen = true;

    this.bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      strength,
      radius,
      threshold
    );

    this.composer = new THREE.EffectComposer(renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.fxaa);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.copy);
  }

  setSize(width, height) {
    this.fxaa.uniforms.resolution.value.set(1 / width, 1 / height);
    this.composer.setSize(width, height);
  }

  render() {
    this.composer.render();
  }
}
