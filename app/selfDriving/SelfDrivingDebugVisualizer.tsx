import { Vector3 } from 'three';
import { setQuaternionFromDirection } from '../helpers/vectorHelpers';
import { Arrow } from './Arrow';

export function SelfDrivingDebugVisualizer({
  carPosition,
  carDirection,
  carVelocity,
  desiredVelocity,
  checkpoints,
} : {
  carPosition: Vector3;
  carDirection: Vector3;
  carVelocity: Vector3;
  desiredVelocity: Vector3;
  checkpoints?: Array<Vector3>;
}) {
  return (
    <>
      <mesh
        position={carPosition}
        quaternion={setQuaternionFromDirection({
          direction: carDirection,
        })}
      >
        <boxGeometry args={[2, 3, 4.7]} />
        <meshStandardMaterial name="car_box_template" />
      </mesh>

      <Arrow
        direction={carDirection}
        position={carPosition}
        length={3}
        color="#0098db"
      />
      <Arrow
        direction={carVelocity}
        position={carPosition}
        length={carVelocity.length()}
        color="red"
      />
      <Arrow
        direction={desiredVelocity}
        position={carPosition}
        length={desiredVelocity.length()}
        color="lightgreen"
      />

      {checkpoints?.map((selfDrivingTarget, index) => {
        return (
          <mesh key={index} position={selfDrivingTarget}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial name="self_driving_targets" color="#0098db" />
          </mesh>
        );
      })}
    </>
  );
}
