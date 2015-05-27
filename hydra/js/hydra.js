/*global THREE*/
/*exported Hydra*/
var Hydra = (function() {
  'use strict';

  function Hydra() {
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial();

    THREE.Mesh.call( this, geometry, material );
  }

  Hydra.prototype = Object.create( THREE.Mesh.prototype );
  Hydra.prototype.constructor = Hydra;

  return Hydra;

})();
