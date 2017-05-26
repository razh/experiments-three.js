/* exported Destroy */

const Destroy = (() => {
  'use strict';

  let objects = [];

  function remove(object) {
    if (object && object.parent) {
      object.parent.remove(object);
    }
  }

  function destroy(object) {
    objects.push(object);
  }

  return Object.assign(destroy, {
    remove,

    update() {
      objects.forEach(remove);
      objects = [];
    },
  });
})();
