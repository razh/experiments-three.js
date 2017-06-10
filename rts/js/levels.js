/*
global
THREE
withEntity
predict
BallTurret
Gun
createBoxCurvePath
Drone
FollowPathComponent
*/
/* exported Levels */

const Levels = (() => {
  'use strict';

  return {
    level0(scene) {
      const turret = new BallTurret();
      turret.position.x = 72;
      turret.position.z = -72;
      turret.weapon = new Gun();
      turret.weapon.rate = 4;
      turret.weapon.parent = turret;
      turret.weapon.offset.z = 8;
      scene.add(turret);

      const boxCurvePath = createBoxCurvePath(60, 40, 240);

      const pathOffset = new THREE.Vector3(0, 30, -80);
      boxCurvePath.curves.forEach(curve => {
        curve.v1.add(pathOffset);
        curve.v2.add(pathOffset);
      });

      const spacedPoints = createBoxCurvePath(60, 40, 240).createSpacedPointsGeometry(100);
      const line = new THREE.Line(
        spacedPoints,
        new THREE.LineBasicMaterial({ color: '#f00' })
      );
      line.position.add(pathOffset);
      scene.add(line);

      const drone = new Drone(boxCurvePath);
      drone.getComponent(FollowPathComponent).speed = 20;
      scene.add(drone);

      const clock = new THREE.Clock();
      let bulletCount = 0;

      class GameComponent {
        update() {
          const time = predict(turret, drone, turret.weapon.muzzleVelocity);

          if (time) {
            const vector = new THREE.Vector3().copy( drone.position )
              .addScaledVector( drone.velocity, time );

            turret.lookAt(vector);
            if (turret.weapon.canFire(clock.getElapsedTime())) {
              bulletCount = (bulletCount + 1) % 2;
              const bulletVector = new THREE.Vector3(bulletCount === 0 ? -1 : 1)
                .applyQuaternion(turret.quaternion);
              const bullet = turret.weapon.fire();
              bullet.position.add(bulletVector);
              scene.add(bullet);
            }
          }
        }
      }

      const gameEntity = new (withEntity(THREE.Object3D))();
      gameEntity.addComponent(new GameComponent());
      scene.add(gameEntity);
    },
  };
})();
