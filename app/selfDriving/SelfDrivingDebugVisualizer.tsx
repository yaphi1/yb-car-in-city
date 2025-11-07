import { Vector3, ArrowHelper, Color } from 'three';
import { useMemo } from 'react';
import { setQuaternionFromDirection } from '../helpers/vectorHelpers';

function Arrow({ direction, position, length, color } : {
  direction: Vector3;
  position: Vector3;
  length: number;
  color: string;
}) {
  const arrow = useMemo(() => {
    const arrowPosition = position.clone();
    arrowPosition.y = 20;
    const headLength = 0.2 * length;
    const headWidth = 0.4 * headLength;
    return new ArrowHelper(direction, arrowPosition, length, color, headLength, headWidth);
  // depend on numeric components to avoid unstable object references
  }, [position.x, position.y, position.z, direction.x, direction.y, direction.z]);

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

  // Deliberately ignore TypeScript warnings about adding custom properties to window
  // This whole file is for debugging, not prod.
  const win = window as any;
  win.carPosition = carPosition;
  win.carDirection = carDirection;
  win.carVelocity = carVelocity;
  win.carSpeed = carVelocity.length();

  return (
    <>
      <mesh
        position={carPosition}
        quaternion={setQuaternionFromDirection({
          direction: carDirection,
        })}
      >
        <boxGeometry args={[2, 3, 4.7]} />
        <meshStandardMaterial />
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
