import { Vector3 } from 'three';
import { setQuaternionFromDirection } from '../helpers/vectorHelpers';
import { Arrow } from './Arrow';

const carVectorPosition = new Vector3();

export function SelfDrivingDebugVisualizer({
  carPosition,
  carDirection,
  carVelocity,
  desiredVelocity,
  checkpoints,
  pathsToNextCheckpoints,
} : {
  carPosition: Vector3;
  carDirection: Vector3;
  carVelocity: Vector3;
  desiredVelocity: Vector3;
  checkpoints: Array<Vector3>;
  pathsToNextCheckpoints: Array<Vector3>;
}) {
  carVectorPosition.set(carPosition.x, 3, carPosition.z);

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
        position={carVectorPosition}
        length={4}
        color="#0098db"
      />
      <Arrow
        direction={carVelocity}
        position={carVectorPosition}
        length={carVelocity.length()}
        color="red"
      />
      <Arrow
        direction={desiredVelocity}
        position={carVectorPosition}
        length={desiredVelocity.length()}
        color="lightgreen"
      />

      {checkpoints.map((checkpoint, index) => {
        const pathToNextCheckpoint = pathsToNextCheckpoints[index];
        return (
          <mesh key={`checkpoint_${index}`} position={checkpoint}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial name="checkpoint" color="#0098db" />
          </mesh>
        );
      })}

      {pathsToNextCheckpoints.map((pathToNextCheckpoint, index) => {
        const checkpoint = checkpoints[index];
        return (
          <Arrow
            key={`pathToNextCheckpoint_${index}`}
            direction={pathToNextCheckpoint}
            position={new Vector3(checkpoint.x, 1, checkpoint.z)}
            length={pathToNextCheckpoint.length()}
            color="gold"
          />
        );
      })}
    </>
  );
}
