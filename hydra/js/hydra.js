/* global THREE, interpolateCatmullRom, currentTime */
/* exported Hydra */

const Hydra = (() => {
  'use strict';

  const vector = new THREE.Vector3();
  const vector2 = new THREE.Vector3();

  const v0 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  const right = new THREE.Vector3();
  const up = new THREE.Vector3();

  const HYDRA_MAX_LENGTH = 500;

  const CHAIN_LINKS = 32;

  const HYDRA_OUTWARD_BIAS = 16;
  const HYDRA_INWARD_BIAS = 30;

  const config = {
    length: 100,
    slack: 200,
    segmentLength: 30,
    bendTension: 0.4,
    bendDelta: 50,
    goalTension: 0.5,
    goalDelta: 400,
    momentum: 0.5,
  };

  const Condition = {
    HYDRA_SNAGGED:     1 << 0,
    HYDRA_STUCK:       1 << 1,
    HYDRA_OVERSHOOT:   1 << 2,
    // Longer than max distance.
    HYDRA_OVERSTRETCH: 1 << 3,
    // Head hit something.
    HYDRA_STRIKE:      1 << 4,
    // No segments are stuck.
    HYDRA_NOSTUCK:     1 << 5,
  };

  const Task = {
    HYDRA_RETRACT:           1 << 0,
    HYDRA_DEPLOY:            1 << 1,
    HYDRA_GET_OBJECT:        1 << 2,
    HYDRA_THROW_OBJECT:      1 << 3,
    HYDRA_PREP_STAB:         1 << 4,
    HYDRA_STAB:              1 << 5,
    HYDRA_PULLBACK:          1 << 6,
    HYDRA_SET_MAX_TENSION:   1 << 7,
    HYDRA_SET_BLEND_TENSION: 1 << 8,
  };

  class HydraBone {
    constructor() {
      this.position = new THREE.Vector3();
      this.delta = new THREE.Vector3();

      this.idealLength = 0;
      this.actualLength = 0;

      this.stuck = false;

      this.goalPosition = new THREE.Vector3();
      this.goalInfluence = 1;
    }
  }

  class Hydra extends THREE.Mesh {
    constructor() {
      const geometry = new THREE.Geometry();
      const material = new THREE.MeshBasicMaterial();

      super( geometry, material );

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

    update() {
      this.checkLength();
      this.adjustLength();

      this.think();

      this.calculateGoalForces();
      this.moveBody();

      let i;
      for ( i = 1; i < CHAIN_LINKS && i < this.body.length; i++ ) {
        this.chain[i].copy( this.body[i].position );
      }

      for ( ; i < CHAIN_LINKS; i++ ) {
        this.chain[i].copy( this.chain[ i - 1 ] );
      }
    }

    think() {}

    setCondition( condition ) {
      this.conditions = this.conditions | condition;
    }

    hasCondition( condition ) {
      return this.conditions & condition;
    }

    clearCondition( condition ) {
      this.conditions = this.conditions ^ condition;
    }

    /**
     * Calculate the bone forces based on goal positions, bending rules,
     * stretching rules, etc.
     */
    calculateGoalForces() {
      const { body } = this;

      const firstIndex = 2;
      const lastIndex = body.length - 1;

      // Keep head segment straight.
      const last = body[ lastIndex ];
      last.goalPosition.copy( this.headGoal );
      last.goalInfluence = 1;

      const segment = body [ lastIndex - 1 ];
      vector.copy( this.headDirection ).multiplyScalar( this.idealSegmentLength );
      segment.goalPosition.subVectors( this.headGoal, vector );
      segment.goalInfluence = 1;

      // Momentum.
      for ( let i = firstIndex; i <= lastIndex; i++ ) {
        body[i].delta.multiplyScalar( config.momentum );
      }

      const goalSegmentLength = this.idealSegmentLength *
        ( this.idealLength / this.currentLength );

      // Goal forces.
      for ( let i = firstIndex; i <= lastIndex; i++ ) {
        const influence = body[i].goalInfluence;
        if ( influence > 0 ) {
          body[i].goalInfluence = 0;

          v0.subVectors( body[i].goalPosition, body[i].position )
            .clampLength( 0, config.goalDelta );

          body[i].delta.add(
            v0.multiplyScalar( influence * config.goalTension )
          );
        }
      }

      // Bending forces.
      let delta;
      for ( let i = firstIndex - 1; i <= lastIndex - 1; i++ ) {
        v3.subVectors( body[ i + 1 ].position, body[ i - 1 ].position )
          .setLength( goalSegmentLength );

        // Towards head.
        if ( i + 1 <= lastIndex ) {
          delta = vector.copy( body[i].position )
            .add( v3 )
            .sub( body[ i + 1 ].position )
            .multiplyScalar( config.goalTension )
            .clampLength( 0, config.bendDelta );

          body[ i + 1 ].delta.add( delta );
        }

        // Towards tail.
        if ( i - 1 >= firstIndex ) {
          delta = vector.copy( body[i].position )
            .sub( v3 )
            .sub( body[ i - 1 ].position )
            .multiplyScalar( config.goalTension )
            .clampLength( 0, config.bendDelta );

          body[ i + 1 ].delta.add( delta.multiplyScalar( 0.8 ) );
        }
      }

      body[0].delta.set( 0, 0, 0 );
      body[1].delta.set( 0, 0, 0 );

      // Normal gravity forces.
      for ( let i = firstIndex; i <= lastIndex; i++ ) {
        if ( !body[i].stuck ) {
          body[i].delta.z -= 3.84 * 0.2;
        }
      }

      // Prevent stretching.
      let maxChecks = body.length * 4;
      let i = lastIndex;
      while ( i > firstIndex && maxChecks > 0 ) {
        let didStretch = false;
        const stretch = vector.copy( body[i].position )
          .add( body[i].delta )
          .sub( body[ i - 1 ].position )
          .sub( body[ i - 1 ].delta );

        const length = vector.length();
        vector.normalize();

        if ( length > goalSegmentLength ) {
          const f0 = body[ i     ].delta.dot( stretch );
          const f1 = body[ i - 1 ].delta.dot( stretch );

          if ( f0 > 0 && f0 > f1 ) {
            // Half limit.
            const limit = stretch.multiplyScalar(
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
    }

    /**
     * Calculate the actual hydra length.
     */
    checkLength() {}

    /**
     * Grow or shrink the hydra, as needed.
     */
    adjustLength() {
      vector.copy( this.outward ).multiplyScalar( this.idealSegmentLength );
      this.body[0].position.copy( this.body[1].position ).sub( vector );

      this.calculateRelaxedLength();

      let adjustFailed = false;
      let shouldAdjust = false;

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
    }

    /**
     * Remove nodes, starting at the end, regardless of length.
     */
    contractFromHead() {
      if ( this.body.length <= 2 ) {
        return false;
      }

      let i = this.body.length - 1;

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
    }

    /**
     * Starting at the first stuck node back from the head, find a node to remove
     * between it and the actual root who is part of a chain that isn't too long.
     */
    contractBetweenStuckSegments() {
      if ( this.body.length <= 3 ) {
        return false;
      }

      // First stuck segment closest to head.
      const stuckHeadIndex = this.virtualRoot();
      if ( stuckHeadIndex < 3 ) {
        return false;
      }

      // Find a non-stuck node with the shortest distance between its neighbors.
      let shortest = -1;
      let distance = this.idealSegmentLength * 2;
      for ( let i = stuckHeadIndex - 1; i > 2; i-- ) {
        if ( !this.body[i].stuck ) {
          const length = this.body[ i - 1 ].distanceTo( this.body[ i + 1 ].position );
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
    }

    /**
     * Try to remove segment closest to root.
     */
    contractFromRoot() {
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
    }

    /**
     * Find the first stuck node that's closest to the head.
     */
    virtualRoot() {
      // First stuck segment closest to head.
      for ( let i = this.body.length - 2; i > 1; i-- ) {
        if ( this.body[i].stuck ) {
          return i;
        }
      }

      return 1;
    }

    /**
     * Insert a node before the given node.
     */
    addNodeBefore( i ) {
      if ( i < 1 ) {
        return false;
      }

      const { body } = this;

      const bone = new HydraBone();
      bone.position.lerpVectors( body[i].position, body[ i - 1 ].position, 0.5 );
      bone.delta.lerpVectors( body[i].delta, body[ i - 1 ].delta, 0.5 );

      bone.actualLength = bone.position.distanceTo( body[i].position );
      bone.idealLength = this.idealSegmentLength;

      body[ i - 1 ].actualLength = bone.actualLength;
      body.splice( i - 1, 0, bone );

      return true;
    }

    addNodeAfter( i ) {
      this.addNodeBefore( i + 1 );
      return false;
    }

    growFromVirtualRoot() {
      if ( this.body[1].actualLength < this.idealSegmentLength * 0.5 ) {
        return false;
      }

      return this.addNodeAfter( 1 );
    }

    growFromMostStretched() {
      let i = this.virtualRoot();

      let longest = i;
      let distance = this.idealSegmentLength * 0.5;

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
    }

    calculateRelaxedLength() {
      this.relaxedLength = this.idealSegmentLength *
        ( this.body.length - 2 ) +
        HYDRA_OUTWARD_BIAS;
    }

    // Original code uses a hull trace to detect collisions.
    isValidConnection() { return true; }

    // Tasks.
    startTask( task ) {
      switch ( task.task ) {
        case Task.HYDRA_DEPLOY:
          this.headGoalInfluence = 1;
          this.idealLength = 100;
          this.headDirection.copy( this.outward );
          return;

        case Task.HYDRA_PREP_STAB:
          this.taskEndTime = currentTime + task.taskData;

          // Go outward.
          this.updateMatrixWorld();
          this.headGoal.copy( this.outward ).multiplyScalar( 100 )
            .add( vector.setFromMatrixPosition( this.matrixWorld ) );

          // TODO: Missing setTarget().
          return;

        case Task.HYDRA_STAB:
          this.taskEndTime = currentTime + 0.5;
          return;

        case Task.HYDRA_PULLBACK:
          this.updateMatrixWorld();
          this.headGoal.copy( this.outward ).multiplyScalar( task.taskData )
            .add( vector.setFromMatrixPosition( this.matrixWorld ) );
          this.idealLength = task.taskData * 1.1;
          return;
      }
    }

    runTask( task ) {
      switch( task.task ) {
        case Task.HYDRA_DEPLOY: {
          this.headGoalInfluence = 1;
          const distance = this.eyePosition().distanceTo( this.headGoal );

          if ( distance < this.idealSegmentLength ) {
            this.completeTask();
          }

          this.aimHeadInTravelDirection( 0.2 );
          return;
        }

        case Task.HYDRA_PREP_STAB: {
          if ( this.body.length < 2 ) {
            this.failTask( 'Hydra is too short to begin stab.' );
            return;
          }

          this.updateMatrixWorld();
          const distanceToTarget = this.target.distanceTo( this.headGoal );
          const distanceToBase = this.headGoal.distanceTo(
            vector.setFromMatrixPosition( this.matrixWorld )
          );
          this.idealSegmentLength = distanceToTarget + distanceToBase * 0.5;

          if ( this.idealLength > HYDRA_MAX_LENGTH ) {
            this.idealLength = HYDRA_MAX_LENGTH;
          }

          if ( distanceToTarget < 100 ) {
            this.targetDirection.subVectors( this.target, this.headGoal )
              .normalize();

            vector.copy( this.targetDirection )
              .multiplyScalar( ( 100 - distanceToTarget ) * 0.5 );

            this.headGoal.sub( vector );

          } else if ( distanceToTarget > 200 ) {
            this.targetDirection.subVectors( this.target, this.headGoal )
              .normalize();

            vector.copy( this.targetDirection )
              .multiplyScalar( ( 200 - distanceToTarget ) * 0.5 );

            this.headGoal.sub( vector );
          }

          // Face enemy.
          this.targetDirection.subVectors(
            this.target,
            this.body[ this.body.length - 1 ].position
          ).normalize();

          this.headDirection.lerp( this.taskDirection, 0.4 ).normalize();

          // Build tension towards strike time.
          let influence = 1 - ( this.taskEndTime - currentTime ) / task.taskData;
          if ( influence > 1 ) {
            influence = 1;
          }

          influence = influence * influence * influence;
          this.headGoalInfluence = influence;

          // Keep head segment straight.
          let i = this.body.length - 1;
          this.body[i].goalPosition.subVectors(
            this.headGoal,
            vector.copy( this.headDirection )
              .multiplyScalar( this.body[i].actualLength )
          );
          this.body[i].goalInfluence = influence;

          // Curve neck into spiral.
          let distanceBackFromHead = this.body[i].actualLength;
          vectorVectors( this.headDirection, right, up );

          for ( i = i - 1; i > 1 && distanceBackFromHead < distanceToTarget; i-- ) {
            distanceBackFromHead += this.body[i].actualLength;

            let r = ( distanceBackFromHead / 200 ) * 2 * Math.PI;

            // Spiral.
            const p0 = vector.copy( this.headGoal )
              .sub(
                vector2.copy( this.headDirection )
                  .multiplyScalar( distanceBackFromHead * 0.5 )
              )
              .add(
                vector2.copy( right )
                  .multiplyScalar( Math.cos( r ) * this.body[i].actualLength )
              )
              .add(
                vector2.copy( up )
                  .multiplyScalar( Math.sin( r ) * this.body[i].actualLength )
              );

            // Base.
            r = ( distanceBackFromHead / this.idealLength ) * Math.PI * 0.2;
            r = Math.sin( r );

            p0.lerp( vector.setFromMatrixPosition( this.matrixWorld ), r );

            this.body[i].goalPosition.copy( p0 );
            this.body[i].goalInfluence = influence *
              ( 1 - ( distanceBackFromHead / distanceToTarget ) );
          }

          // Look to see if any of the goal positions are stuck.
          let delta;
          for ( ; i < this.body.length - 1; i++ ) {
            if ( this.body[i].stuck ) {
              delta = vector.copy( this.headDirection )
                .multiplyScalar(
                  vector2.subVectors(
                    this.body[i].goalPosition,
                    this.body[i].position
                  )
                  .dot( this.headDirection )
                );

              this.headGoal.sub(
                delta.multiplyScalar( this.body[i].goalInfluence )
              );
            }
          }

          if ( currentTime >= this.taskEndTime ) {
            if ( distanceToTarget < 500 ) {
              this.completeTask();
              return;
            } else {
              this.failTask( 'Target is too far away.' );
              return;
            }
          }

          return;
        }

        case Task.HYDRA_STAB: {
          if ( this.body.length < 2 ) {
            this.failTask( 'Hydra is too short to begin stab.' );
            return;
          }

          if ( this.taskEndTime <= currentTime ) {
            this.completeTask();
            return;
          }

          this.headGoalInfluence = 1;

          // Keep head segment straight.
          let i = this.body.length - 2;
          this.body[i].goalPosition.copy( this.headDirection )
            .multiplyScalar( this.body[i].actualLength )
            .add( this.headGoal );
          this.body[i].goalInfluence = 1;

          const vectorToTarget = vector.subVectors(
            this.target,
            this.eyePosition()
          );

          // Check to see if we went past target.
          if ( vectorToTarget.dot( this.headDirection ) < 0 ) {
            this.completeTask();
            return;
          }

          this.updateMatrixWorld();

          const distanceToTarget = vectorToTarget.length();
          const distanceToBase = this.eyePosition().distanceTo(
            vector.setFromMatrixPosition( this.matrixWorld )
          );
          this.idealLength = distanceToTarget + distanceToBase;

          // Hit enemy.
          this.headGoal.copy( this.headDirection ).multiplyScalar( 300 )
            .add( this.target );

          if ( this.idealLength > HYDRA_MAX_LENGTH ) {
            this.idealLength = HYDRA_MAX_LENGTH;
          }

          // Curve neck into spiral.
          let distanceBackFromHead = this.body[i].actualLength;
          vectorVectors( this.headDirection, right, up );

          for ( i = i - 1; i > 1 && distanceBackFromHead < distanceToTarget; i-- ) {
            const p0 = vector.copy( this.headGoal )
              .sub(
                vector2.copy( this.headDirection )
                  .multiplyScalar( distanceBackFromHead )
              );

            this.body[i].goalPosition.copy( p0 );

            if ( this.target.distanceTo( this.body[i].position ) <=
                 ( distanceToTarget + distanceBackFromHead ) ) {
              this.body[i].goalPosition.subVectors(
                this.eyePosition(),
                vector.copy( this.headDirection )
                  .multiplyScalar( distanceBackFromHead )
              );
            }

            this.body[i].goalInfluence = 1 -
              ( distanceBackFromHead / distanceToTarget );

            distanceBackFromHead += this.body[i].actualLength;
          }

          return;
        }

        case Task.HYDRA_PULLBACK:
          if ( this.body.length < 2 ) {
            this.failTask( 'Hydra is too short to begin stab.' );
          }

          // TODO: Missing getEnemy().
          this.aimHeadInTravelDirection( 0.2 );

          if ( this.currentLength < this.idealLength + this.idealSegmentLength ) {
            this.completeTask();
          }

          return;
      }
    }

    completeTask() {}
    failTask() {}

    eyePosition() {
      const i = this.body.length - 1;
      if ( i >= 0 ) {
        return this.body[i].position;
      }

      return this.position;
    }

    aimHeadInTravelDirection( influence ) {
      // Aim in the direction of movement enemy.
      const delta = vector.copy( this.body[ this.body.length - 1 ].delta )
        .normalize();

      if ( delta.dot( this.headDirection ) < 0 ) {
        delta.negate();
      }

      this.headDirection
        .lerp( delta, influence )
        .normalize();
    }

    // Client-side hydra methods.

    /**
     * Fits skeleton of hydra to the variable segment length "chain" array.
     * Adjusts overall hydra so that "relaxedLength" of texture fits over
     * the actual length of the chain.
     */
    calculateBoneChain( positions, chain ) {
      // Find the last chain link that's not zero length.
      let i = CHAIN_LINKS - 1;
      while ( i > 0 ) {
        if ( chain[i].distanceToSquared( chain[ i - 1 ] ) ) {
          break;
        }

        i--;
      }

      // Initialize the last bone to the last bone.
      let j = this.hydraBoneCount - 1;

      // Clamp length.
      let totalLength = 0;
      for ( let k = i; k > 0; k-- ) {
        totalLength += chain[k].distanceTo( chain[ k - 1 ] );
      }
      totalLength = THREE.Math.clamp( totalLength, 1, this.maxPossibleLength );
      const scale = this.relaxedLength / totalLength;

      // Starting from the head, fit the hydra skeleton on to the chain spline.
      let distance = -16;
      while ( j >= 0 && i > 0 ) {
        let dt = chain[i].distanceTo( chain[ i - 1 ] ) * scale;
        let dx = dt;
        while ( j >= 0 && distance + dt >= this.boneLength[j] ) {
          let s = ( dx - ( dt - ( this.boneLength[i] - distance ) ) ) / dx;

          if ( 0 > s || s > 1 ) {
            s = 0;
          }

          interpolateCatmullRom(
            chain[ i < CHAIN_LINKS - 1 ? i + 1 : CHAIN_LINKS - 1 ],
            chain[i],
            chain[ i > 0 ? i - 1 : 0 ],
            chain[ i > 1 ? i - 2 : 0 ],
            s,
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
    }
  }

  const vectorVectors = (() => {
    const temp = new THREE.Vector3();

    return ( forward, right, up ) => {
      if ( !forward.x && !forward.y ) {
        // Pitch 90 degrees up/down from identity.
        right.set( 0, -1, 0 );
        up.set( -forward.x, 0, 0 );
      } else {
        temp.set( 0, 0, 1 );
        right.crossVectors( forward, temp ).normalize();
        up.crossVectors( right, forward ).normalize();
      }
    };
  })();

  // Similar to THREE.Matrix4.prototype.lookAt().
  const vectorMatrix = (() => {
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    return ( forward, matrix ) => {
      vectorVectors( forward, right, up );
      right.negate();

      forward.toArray( matrix.elements, 0 );
      right.toArray( matrix.elements, 4 );
      up.toArray( matrix.elements, 8 );

      return matrix;
    };
  })();

  /**
   * Minimize the amount of twist between bone segments.
   */
  Hydra.prototype.calculateBoneAngles = (() => {
    const boneMatrix = new THREE.Matrix4();

    const forward = new THREE.Vector3();
    const left2 = new THREE.Vector3();

    const up = new THREE.Vector3();
    const left = new THREE.Vector3();

    return ( positions, quaternions ) => {
      for ( let i = this.hydraBoneCount - 1; i >= 0; i-- ) {
        if ( i !== this.hydraBoneCount - 1 ) {
          boneMatrix.makeFromQuaternion( quaternions[ i + 1 ] );
          left2.setFromMatrixColumn( 1, boneMatrix );

          forward.subVectors( positions[ i + 1 ], positions[i] );
          const length = forward.length();
          if ( !length ) {
            quaternions[i].copy( quaternions[ i + 1 ] );
            continue;
          }
        } else {
          forward.copy( this.headDirection ).normalize();

          vectorMatrix( forward, boneMatrix );
          left2.setFromMatrixColumn( 1, boneMatrix );
        }

        left.crossVectors( forward, left2 );

        forward.toArray( boneMatrix.elements, 0 );
        left.toArray( boneMatrix.elements, 4 );
        up.toArray( boneMatrix.elements, 8 );

        quaternions[i].setFromRotationMatrix( boneMatrix );
      }
    };
  })();

  return Hydra;
})();
