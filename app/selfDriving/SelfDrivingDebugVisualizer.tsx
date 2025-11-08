import { Vector3, ArrowHelper } from 'three';
import { useMemo } from 'react';
import { setQuaternionFromDirection } from '../helpers/vectorHelpers';

function Arrow({ direction, position, length, color } : {
  direction: Vector3;
  position: Vector3;
  length: number;
  color: string;
}) {
  const arrow = useMemo(() => {
    const arrowPosition = new Vector3(position.x, 20, position.z);
    const headLength = 0.2 * length;
    const headWidth = 0.4 * headLength;
    return new ArrowHelper(direction, arrowPosition, length, color, headLength, headWidth);
  }, [position.x, position.z, direction, color, length]);

  return <primitive object={arrow} />;
}

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
