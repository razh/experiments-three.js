/*global THREE*/
/*exported Hydra*/
var Hydra = (function() {
  'use strict';

  var vector = new THREE.Vector3();

  var v0 = new THREE.Vector3();
  var v3 = new THREE.Vector3();

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
  }

  Hydra.prototype = Object.create( THREE.Mesh.prototype );
  Hydra.prototype.constructor = Hydra;

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

  return Hydra;

})();
