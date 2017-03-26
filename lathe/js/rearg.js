/*
global
THREE
sizeBox
widthBox
heightBox
depthBox
getBoxVertex
setBoxVertices
setXBoxVertices
setYBoxVertices
setZBoxVertices
copyBoxVertices
centroidBox
alignBox
relativeAlignBox
lerpBoxVertices
relativeLerpBoxVertices
applyBoxVertexColors
applyBoxFaceVertexColors
defaultVertexColors
translateBoxVertices
scaleBoxVertices
translateXBoxVertices
translateYBoxVertices
translateZBoxVertices
scaleXBoxVertices
scaleYBoxVertices
scaleZBoxVertices
*/
/* exported geometryArguments */

const geometryArguments = (function() {
  'use strict';

  function reargMethod( method ) {
    return ( ...args ) => {
      return geometry => {
        geometry[ method ]( ...args );
        return geometry;
      };
    };
  }

  const geometryMethods = [
    'rotateX',
    'rotateY',
    'rotateZ',
    'translate',
    'scale',
  ];

  const shorthandGeometryMethods = [ 'rx', 'ry', 'rz', 't', 's' ];

  const reargGeometryMethods = geometryMethods.map( reargMethod );

  function reargAxisMethod( method, identity = new THREE.Vector3() ) {
    const vector = new THREE.Vector3();

    return axis => {
      return ( value = identity.getComponent( axis ) ) => {
        return geometry => {
          vector
            .copy( identity )
            .setComponent( axis, value );

          geometry[ method ]( ...vector.toArray() );
          return geometry;
        };
      };
    };
  }

  const geometryAxisMethods = [
    'translateX',
    'translateY',
    'translateZ',
    'scaleX',
    'scaleY',
    'scaleZ',
  ];

  const shorthandGeometryAxisMethods = [ 'tx', 'ty', 'tz', 'sx', 'sy', 'sz' ];

  const translateGeometryAxis = reargAxisMethod( 'translate' );
  const scaleGeometryAxis = reargAxisMethod( 'scale', new THREE.Vector3( 1, 1, 1 ) );

  const reargGeometryAxisMethods = [
    translateGeometryAxis( 0 ),
    translateGeometryAxis( 1 ),
    translateGeometryAxis( 2 ),
    scaleGeometryAxis( 0 ),
    scaleGeometryAxis( 1 ),
    scaleGeometryAxis( 2 ),
  ];

  function rearg( fn ) {
    return ( ...args ) => geometry => fn( geometry, ...args );
  }

  const reargGetVertex = rearg( getBoxVertex );
  const reargSet = rearg( setBoxVertices );
  const reargSetX = rearg( setXBoxVertices );
  const reargSetY = rearg( setYBoxVertices );
  const reargSetZ = rearg( setZBoxVertices );
  const reargCopy = rearg( copyBoxVertices );
  const reargCentroid = rearg( centroidBox );
  const reargAlign = rearg( alignBox );
  const reargColors = rearg( applyBoxVertexColors );
  const reargFaceColors = rearg( applyBoxFaceVertexColors );
  const reargDefaultColors = rearg( defaultVertexColors );
  const reargTranslateVertices = rearg( translateBoxVertices );
  const reargScaleVertices = rearg( scaleBoxVertices );
  const reargLerp = rearg( lerpBoxVertices );

  const reargTranslateXVertices = rearg( translateXBoxVertices );
  const reargTranslateYVertices = rearg( translateYBoxVertices );
  const reargTranslateZVertices = rearg( translateZBoxVertices );
  const reargScaleXVertices = rearg( scaleXBoxVertices );
  const reargScaleYVertices = rearg( scaleYBoxVertices );
  const reargScaleZVertices = rearg( scaleZBoxVertices );

  function reargRelativeAlign( alignmentA ) {
    return ( geometryB, alignmentB ) => {
      return rearg( relativeAlignBox )( alignmentA, geometryB, alignmentB );
    };
  }

  function reargRelativeLerp( verticesA, t ) {
    return ( geometryB, verticesB ) => {
      return rearg( relativeLerpBoxVertices )( verticesA, geometryB, verticesB, t );
    };
  }

  return {
    keys: [
      'THREE',
      'size',
      'width',
      'height',
      'depth',
      'vertex',
      'set',
      'setX',
      'setY',
      'setZ',
      'copy',
      'centroid',
      'align',
      'relativeAlign',
      'lerp',
      'relativeLerp',
      'color',
      'faceColor',
      'defaultColor',
      '$translate',
      '$t',
      '$scale',
      '$s',
      '$translateX',
      '$tx',
      '$translateY',
      '$ty',
      '$translateZ',
      '$tz',
      '$scaleX',
      '$sx',
      '$scaleY',
      '$sy',
      '$scaleZ',
      '$sz',
    ]
      .concat( geometryMethods )
      .concat( shorthandGeometryMethods )
      .concat( geometryAxisMethods )
      .concat( shorthandGeometryAxisMethods ),
    values: [
      THREE,
      sizeBox,
      widthBox,
      heightBox,
      depthBox,
      reargGetVertex,
      reargSet,
      reargSetX,
      reargSetY,
      reargSetZ,
      reargCopy,
      reargCentroid,
      reargAlign,
      reargRelativeAlign,
      reargLerp,
      reargRelativeLerp,
      reargColors,
      reargFaceColors,
      reargDefaultColors,
      reargTranslateVertices,
      reargTranslateVertices,
      reargScaleVertices,
      reargScaleVertices,
      reargTranslateXVertices,
      reargTranslateXVertices,
      reargTranslateYVertices,
      reargTranslateYVertices,
      reargTranslateZVertices,
      reargTranslateZVertices,
      reargScaleXVertices,
      reargScaleXVertices,
      reargScaleYVertices,
      reargScaleYVertices,
      reargScaleZVertices,
      reargScaleZVertices,
    ]
      .concat( reargGeometryMethods )
      .concat( reargGeometryMethods )
      .concat( reargGeometryAxisMethods )
      .concat( reargGeometryAxisMethods ),
  };
}());
