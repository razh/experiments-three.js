/*global THREE*/
/*exported Agent*/
var Agent = (function() {
  'use strict';

  var geometry = new THREE.SphereBufferGeometry( 1, 1 );
  var material = new THREE.MeshBasicMaterial();

  function Agent() {
    THREE.Mesh.call( this, geometry, material );
  }

  Agent.prototype = Object.create( THREE.Mesh.prototype );
  Agent.prototype.constructor = Agent;

  return Agent;

})();
