function sizeBox(geometry) {
  'use strict';

  geometry.computeBoundingBox();
  return geometry.boundingBox.getSize();
}

function widthBox(geometry) {
  'use strict';

  return sizeBox(geometry).x;
}

function heightBox(geometry) {
  'use strict';

  return sizeBox(geometry).y;
}

function depthBox(geometry) {
  'use strict';

  return sizeBox(geometry).z;
}

window.sizeBox = sizeBox;
window.widthBox = widthBox;
window.heightBox = heightBox;
window.depthBox = depthBox;
