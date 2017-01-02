/* eslint-env es6 */
/* global THREE */
'use strict';

// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_postprocessing_ssao.html
/*
  <script src="js/shaders/SSAOShader.js"></script>
  <script src="js/shaders/CopyShader.js"></script>

  <script src="js/postprocessing/EffectComposer.js"></script>
  <script src="js/postprocessing/RenderPass.js"></script>
  <script src="js/postprocessing/ShaderPass.js"></script>
  <script src="js/postprocessing/MaskPass.js"></script>
 */
class SSAORenderer {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Setup render pass.
    this.renderPass = new THREE.RenderPass(scene, camera);

    // Setup depth pass.
    this.depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial.depthPicking = THREE.RGBADepthPacking;
    this.depthMaterial.blending = THREE.NoBlending;

    this.depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    // Setup SSAO pass.
    this.ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
    this.ssaoPass.renderToScreen = true;

    this.ssaoPass.uniforms.tDepth.value = this.depthRenderTarget.texture;
    this.ssaoPass.uniforms.size.value.set(window.innerWidth, window.innerHeight);
    this.ssaoPass.uniforms.cameraNear.value = camera.near;
    this.ssaoPass.uniforms.cameraFar.value = camera.far;
    this.ssaoPass.uniforms.aoClamp.value = 0.3;
    this.ssaoPass.uniforms.lumInfluence.value = 0.5;

    // Add pass to effect composer.
    this.effectComposer = new THREE.EffectComposer(renderer);
    this.effectComposer.addPass(this.renderPass);
    this.effectComposer.addPass(this.ssaoPass);
  }

  render() {
    // Render depth into depthRenderTarget.
    this.scene.overrideMaterial = this.depthMaterial;
    this.renderer.render(this.scene, this.camera, this.depthRenderTarget, true);

    // Render renderPass and SSAO shaderPass.
    this.scene.overrideMaterial = null;
    this.effectComposer.render();
  }

  resize(width, height) {
    // Resize render targets.
    this.ssaoPass.uniforms.size.value.set(width, height);

    const pixelRatio = this.renderer.getPixelRatio();
    const newWidth = Math.floor(width / pixelRatio) || 1;
    const newHeight = Math.floor(height / pixelRatio) || 1;
    this.depthRenderTarget.setSize(newWidth, newHeight);
    this.effectComposer.setSize(newWidth, newHeight);
  }
}

window.SSAORenderer = SSAORenderer;
