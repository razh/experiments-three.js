(() => {
  'use strict';

  function sizeBox(geometry) {
    geometry.computeBoundingBox();
    return geometry.boundingBox.getSize();
  }

  Object.assign(window, {
    sizeBox,
    widthBox: geometry => sizeBox(geometry).x,
    heightBox: geometry => sizeBox(geometry).y,
    depthBox: geometry => sizeBox(geometry).z,
  });
})();
