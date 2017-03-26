/* global VertexIndices, computeCentroid */

function centroidBox( geometry, key ) {
  'use strict';

  const indices = VertexIndices[ key.toUpperCase() ];
  return computeCentroid( geometry, indices );
}

window.centroidBox = centroidBox;
