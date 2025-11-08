import { Vector3 } from 'three';
import { setQuaternionFromDirection } from '../helpers/vectorHelpers';
import { Arrow } from './Arrow';

export function SelfDrivingDebugVisualizer({
  carPosition,
  carDirection,
  carVelocity,
} : {
  carPosition: Vector3;
  carDirection: Vector3;
  carVelocity: Vector3;
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
    </>
  );
}
