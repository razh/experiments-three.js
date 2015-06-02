/*jshint bitwise:false*/
/*global THREE, interpolateCatmullRom*/
/*exported Hydra*/
var Hydra = (function() {
  'use strict';

  var vector = new THREE.Vector3();

  var v0 = new THREE.Vector3();
  var v3 = new THREE.Vector3();

  var CHAIN_LINKS = 32;

  var HYDRA_OUTWARD_BIAS = 16;
  var HYDRA_INWARD_BIAS = 30;

  var config = {
    length: 100,
    slack: 200,
    segmentLength: 30,
    bendTension: 0.4,
    bendDelta: 50,
    goalTension: 0.5,
    goalDelta: 400,
    momentum: 0.5
  };

  var Conditions = {
    HYDRA_SNAGGED:     1 << 0,
    HYDRA_STUCK:       1 << 1,
    HYDRA_OVERSHOOT:   1 << 2,
    // Longer than max distance.
    HYDRA_OVERSTRETCH: 1 << 3,
    // Head hit something.
    HYDRA_STRIKE:      1 << 4,
    // No segments are stuck.
    HYDRA_NOSTUCK:     1 << 5
  };

  function HydraBone() {
    this.position = new THREE.Vector3();
    this.delta = new THREE.Vector3();

    this.idealLength = 0;
    this.actualLength = 0;

    this.stuck = false;

    this.goalPosition = new THREE.Vector3();
    this.goalInfluence = 1;
  }

  function Hydra() {
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial();

    THREE.Mesh.call( this, geometry, material );

    this.body = [];

    this.chain = [];
    this.activeChain = 0;

    this.hasStuckSegments = false;
    this.currentLength = 0;

    this.headGoal = new THREE.Vector3();
    this.headGoalInfluence = 0;
    this.headDirection = new THREE.Vector3();

    this.relaxedLength = 0;
    this.outward = new THREE.Vector3();
    this.idealLength = 0;
    this.idealSegmentLength = 0;

    this.target = new THREE.Vector3();
    this.targetDirection = new THREE.Vector3();

    this.lastAdjustmentTime = 0;
    this.taskStartTime = 0;
    this.taskEndTime = 0;
    this.lengthTime = 0;

    this.conditions = 0;
  }

  Hydra.prototype = Object.create( THREE.Mesh.prototype );
  Hydra.prototype.constructor = Hydra;

  Hydra.prototype.update = function() {
    this.checkLength();
    this.adjustLength();

    this.think();

    this.calculateGoalForces();
    this.moveBody();

    var i;
    for ( i = 1; i < CHAIN_LINKS && i < this.body.length; i++ ) {
      this.chain[i].copy( this.body[i].position );
    }

    for ( ; i < CHAIN_LINKS; i++ ) {
      this.chain[i].copy( this.chain[ i - 1 ] );
    }
  };

  Hydra.prototype.think = function() {};

  Hydra.prototype.setCondition = function( condition ) {
    this.conditions = this.conditions | condition;
  };

  Hydra.prototype.hasCondition = function( condition ) {
    return this.conditions & condition;
  };

  Hydra.prototype.clearCondition = function( condition ) {
    this.conditions = this.conditions ^ condition;
  };

  /**
   * Calculate the bone forces based on goal positions, bending rules,
   * stretching rules, etc.
   */
  Hydra.prototype.calculateGoalForces = function() {
    var body = this.body;

    var firstIndex = 2;
    var lastIndex = body.length - 1;

    // Keep head segment straight.
    var last = body[ lastIndex ];
    last.goalPosition.copy( this.headGoal );
    last.goalInfluence = 1;

    var segment = body [ lastIndex - 1 ];
    vector.copy( this.headDirection ).multiplyScalar( this.idealSegmentLength );
    segment.goalPosition.subVectors( this.headGoal, vector );
    segment.goalInfluence = 1;

    var i;
    // Momentum.
    for ( i = firstIndex; i <= lastIndex; i++ ) {
      body[i].delta.multiplyScalar( config.momentum );
    }

    var goalSegmentLength = this.idealSegmentLength *
      ( this.idealLength / this.currentLength );

    // Goal forces.
    var influence;
    var length;
    for ( i = firstIndex; i<= lastIndex; i++ ) {
      influence = body[i].goalInfluence;
      if ( influence > 0 ) {
        body[i].goalInfluence = 0;

        v0.subVectors( body[i].goalPosition, body[i].position );
        length = v0.length();
        if ( length > config.goalDelta ) {
          v0.setLength( config.goalDelta );
        }

        body[i].delta.add(
          v0.multiplyScalar( influence * config.goalTension )
        );
      }
    }

    // Bending forces.
    var delta;
    for ( i = firstIndex - 1; i <= lastIndex - 1; i++ ) {
      v3.subVectors( body[ i + 1 ].position, body[ i - 1 ].position )
        .setLength( goalSegmentLength );

      // Towards head.
      if ( i + 1 <= lastIndex ) {
        delta = vector.copy( body[i].position )
          .add( v3 )
          .sub( body[ i + 1 ].position )
          .multiplyScalar( config.goalTension );

        length = delta.length();
        if ( length > config.bendDelta ) {
          delta.setLength( config.bendDelta );
        }

        body[ i + 1 ].delta.add( delta );
      }

      // Towards tail.
      if ( i - 1 >= firstIndex ) {
        delta = vector.copy( body[i].position )
          .sub( v3 )
          .sub( body[ i - 1 ].position )
          .multiplyScalar( config.goalTension );

        length = delta.length();
        if ( length > config.bendDelta ) {
          delta.setLength( config.bendDelta );
        }

        body[ i + 1 ].delta.add( delta.multiplyScalar( 0.8 ) );
      }
    }

    body[0].delta.set( 0, 0, 0 );
    body[1].delta.set( 0, 0, 0 );

    // Normal gravity forces.
    for ( i = firstIndex; i <= lastIndex; i++ ) {
      if ( !body[i].stuck ) {
        body[i].delta.z -= 3.84 * 0.2;
      }
    }

    // Prevent stretching.
    var maxChecks = body.length * 4;
    var didStretch;
    var stretch;
    var f0;
    var f1;
    var limit;
    i = lastIndex;
    while ( i > firstIndex && maxChecks > 0 ) {
      didStretch = false;
      stretch = vector.copy( body[i].position )
        .add( body[i].delta )
        .sub( body[ i - 1 ].position )
        .sub( body[ i - 1 ].delta );

      length = vector.length();
      vector.normalize();

      if ( length > goalSegmentLength ) {
        f0 = body[ i     ].delta.dot( stretch );
        f1 = body[ i - 1 ].delta.dot( stretch );

        if ( f0 > 0 && f0 > f1 ) {
          // Half limit.
          limit = stretch.multiplyScalar(
            0.5 * ( length - goalSegmentLength )
          );

          // Propagate pulling back down the chain.
          body[ i     ].delta.sub( limit );
          body[ i - 1 ].delta.add( limit );
          didStretch = true;
        }
      }

      if ( didStretch ) {
        if ( i < lastIndex ) {
          i++;
        }
      } else {
        i--;
      }

      maxChecks--;
    }
  };

  /**
   * Calculate the actual hydra length.
   */
  Hydra.prototype.checkLength = function() {};

  /**
   * Grow or shrink the hydra, as needed.
   */
  Hydra.prototype.adjustLength = function() {
    vector.copy( this.outward ).multiplyScalar( this.idealSegmentLength );
    this.body[0].position.copy( this.body[1].position ).sub( vector );

    this.calculateRelaxedLength();

    var adjustFailed = false;
    var shouldAdjust = false;

    if ( this.currentLength < this.idealLength ) {
      if ( this.relaxedLength + this.idealSegmentLength * 0.5 < this.idealLength ) {
        shouldAdjust = true;
        if ( !this.growFromVirtualRoot() ) {
          adjustFailed = true;
        }
      }
    } else if ( this.checkLength > this.idealLength ) {
      if ( this.relaxedLength - this.idealSegmentLength * 0.5 > this.idealLength ) {
        shouldAdjust = true;
        if ( !this.contractFromRoot() ||
             !this.contractBetweenStuckSegments() ||
             !this.contractFromHead() ) {
          adjustFailed = true;
        }
      } else if ( Date.now() - this.lastAdjustmentTime > 1000 ) {
        shouldAdjust = true;
        // Start to panic.
        if ( !this.growFromMostStretched() ) {
          adjustFailed = true;
        }
      } else {
        adjustFailed = true;
      }

      if ( !adjustFailed ) {
        this.lastAdjustmentTime = Date.now();
      }
    }

    this.calculateRelaxedLength();
  };

  /**
   * Remove nodes, starting at the end, regardless of length.
   */
  Hydra.prototype.contractFromHead = function() {
    if ( this.body.length <= 2 ) {
      return false;
    }

    var i = this.body.length - 1;

    if ( this.body[i].stuck &&
         this.body[ i - 1 ].actualLength > this.idealSegmentLength * 2 ) {
      this.addNodeBefore( i );
      i = this.body.length - 1;
    }

    if ( this.body.length <= 3 ) {
      return false;
    }

    // Always legal since no new link is being formed.
    this.body.splice( i, 1 );

    this.calculateRelaxedLength();

    return true;
  };

  /**
   * Starting at the first stuck node back from the head, find a node to remove
   * between it and the actual root who is part of a chain that isn't too long.
   */
  Hydra.prototype.contractBetweenStuckSegments = function() {
    if ( this.body.length <= 3 ) {
      return false;
    }

    // First stuck segment closest to head.
    var stuckHeadIndex = this.virtualRoot();
    if ( stuckHeadIndex < 3 ) {
      return false;
    }

    // Find a non-stuck node with the shortest distance between its neighbors.
    var shortest = -1;
    var distance = this.idealSegmentLength * 2;
    var length;
    for ( var i = stuckHeadIndex - 1; i > 2; i-- ) {
      if ( !this.body[i].stuck ) {
        length = this.body[ i - 1 ].distanceTo( this.body[ i + 1 ].position );
        // Check segment length.
        if ( length < distance ) {
          if ( this.isValidConnection( i - 1, i + 1 ) ) {
            distance = length;
            shortest = i;
          }
        }
      }
    }

    if ( shortest === -1 ) {
      return false;
    }

    // FIXME: Check for tunneling.
    this.body.splice( shortest, 1 );

    this.calculateRelaxedLength();

    return true;
  };

  /**
   * Try to remove segment closest to root.
   */
  Hydra.prototype.contractFromRoot = function() {
    if ( this.body.length <= 3 ) {
      return false;
    }

    // Don't contract overly long segments.
    if ( this.body[2].actualLength > this.idealSegmentLength * 2 ) {
      return false;
    }

    if ( !this.isValidConnection( 1, 3 ) ) {
      return false;
    }

    this.body.splice( 2, 1 );

    this.calculateRelaxedLength();

    return true;
  };

  /**
   * Find the first stuck node that's closest to the head.
   */
  Hydra.prototype.virtualRoot = function() {
    // First stuck segment closest to head.
    for ( var i = this.body.length - 2; i > 1; i-- ) {
      if ( this.body[i].stuck ) {
        return i;
      }
    }

    return 1;
  };

  /**
   * Insert a node before the given node.
   */
  Hydra.prototype.addNodeBefore = function( i ) {
    if ( i < 1 ) {
      return false;
    }

    var body = this.body;

    var bone = new HydraBone();
    bone.position.lerpVectors( body[i].position, body[ i - 1 ].position, 0.5 );
    bone.delta.lerpVectors( body[i].delta, body[ i - 1 ].delta, 0.5 );

    bone.actualLength = bone.position.distanceTo( body[i].position );
    bone.idealLength = this.idealSegmentLength;

    body[ i - 1 ].actualLength = bone.actualLength;
    body.splice( i - 1, 0, bone );

    return true;
  };


  Hydra.prototype.addNodeAfter = function( i ) {
    this.addNodeBefore( i + 1 );
    return false;
  };

  Hydra.prototype.growFromVirtualRoot = function() {
    if ( this.body[1].actualLength < this.idealSegmentLength * 0.5 ) {
      return false;
    }

    return this.addNodeAfter( 1 );
  };

  Hydra.prototype.growFromMostStretched = function() {
    var i = this.virtualRoot();

    var longest = i;
    var distance = this.idealSegmentLength * 0.5;

    for ( ; i < this.body.length - 1; i++ ) {
      if ( this.body[i].actualLength > distance ) {
        longest = i;
        distance = this.body[i].actualLength;
      }
    }

    if ( this.body[ longest ].actualLength <= distance ) {
      return this.addNodeAfter( longest );
    }

    return false;
  };

  Hydra.prototype.calculateRelaxedLength = function() {
    this.relaxedLength = this.idealSegmentLength *
      ( this.body.length - 2 ) +
      HYDRA_OUTWARD_BIAS;
  };

  // Original code uses a hull trace to detect collisions.
  Hydra.prototype.isValidConnection = function() { return true; };

  // Client-side hydra methods.

  /**
   * Fits skeleton of hydra to the variable segment length "chain" array.
   * Adjusts overall hydra so that "relaxedLength" of texture fits over
   * the actual length of the chain.
   */
  Hydra.prototype.calculateBoneChain = function( positions, chain ) {
    // Find the last chain link that's not zero length.
    var i = CHAIN_LINKS - 1;
    while ( i > 0 ) {
      if ( chain[i].distanceToSquared( chain[ i - 1 ] ) ) {
        break;
      }

      i--;
    }

    // Initialize the last bone to the last bone.
    var j = this.hydraBoneCount - 1;

    // Clamp length.
    var totalLength = 0;
    for ( var k = i; k > 0; k-- ) {
      totalLength += chain[k].distanceTo( chain[ k - 1 ] );
    }
    totalLength = THREE.Math.clamp( totalLength, 1, this.maxPossibleLength );
    var scale = this.relaxedLength / totalLength;

    // Starting from the head, fit the hydra skeleton on to the chain spline.
    var distance = -16;
    var dt, dx, s;
    while ( j >= 0 && i > 0 ) {
      dt = chain[i].distanceTo( chain[ i - 1 ] ) * scale;
      dx = dt;
      while ( j >= 0 && distance + dt >= this.boneLength[j] ) {
        s = ( dx - ( dt - ( this.boneLength[i] - distance ) ) ) / dx;

        if ( 0 > s || s > 1 ) {
          s = 0;
        }

        interpolateCatmullRom(
          [
            chain[ i < CHAIN_LINKS - 1 ? i + 1 : CHAIN_LINKS - 1 ],
            chain[i],
            chain[ i > 0 ? i - 1 : 0 ],
            chain[ i > 1 ? i - 2 : 0 ]
          ],
          scale,
          positions[j]
        );

        dt = dt - ( this.boneLength[j] - distance );
        j--;
        distance = 0;
      }

      distance += dt;
      i--;
    }

    while ( j >= 0 ) {
      positions[i] = chain[0];
      j--;
    }
  };

  return Hydra;

})();
