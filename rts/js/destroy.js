/* exported Destroy */

const Destroy = (() => {
  'use strict';

  let objects = [];

  function remove(object) {
    if (object && object.parent) {
      object.parent.remove(object);
    }
  }

  return {
    remove,

    destroy(object) {
      objects.push(object);
    },

    update() {
      objects.forEach(remove);
    },
  };
})();
