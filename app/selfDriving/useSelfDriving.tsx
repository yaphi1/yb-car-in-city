import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getVectorFromStartToTarget } from '../helpers/vectorHelpers';
import { getPathsToNextCheckpoints, makeRoadCheckpoints } from './navigation';

const speedLimit = 10;

// vertical
// const checkpoints = makeRoadCheckpoints({
//   startingIntersection: { column: 0, row: 1 },
//   endingIntersection: { column: 0, row: 2 },
//   laneIndex: 1,
// });

// horizontal
const checkpoints = makeRoadCheckpoints({
  startingIntersection: { column: 0, row: 1 },
  endingIntersection: { column: 1, row: 1 },
  laneIndex: 1,
});

const pathsToNextCheckpoints = getPathsToNextCheckpoints({ checkpoints });

function getDesiredVelocity({ position, target, speed } : {
  position: Vector3;
  target: Vector3;
  speed: number;
}) {
  const desiredVelocity = getVectorFromStartToTarget({
    start: new Vector3(position.x, 0, position.z),
    target: new Vector3(target.x, 0, target.z),
    customLength: speed,
  });
  return desiredVelocity;
}

/**
 * This function helps us escape situations where the car
 * approaches a checkpoint from an awkward angle, can't
 * get close enough to clear the checkpoint, and therefore
 * starts to infinitely orbit the checkpoint.
 */
function detectOrbit({ position, velocity, desiredVelocity, target } : {
  position: Vector3;
  velocity: Vector3;
  desiredVelocity: Vector3;
  target: Vector3;
}) {
  const angleToTarget = velocity.angleTo(desiredVelocity);
  const distanceToTarget = position.distanceTo(target);
  const magnitudeOfDesiredVelocity = desiredVelocity.length();
  const orbitAngleTolerance = 0.2;
  const minOrbitAngle = Math.PI/2 - orbitAngleTolerance;
  const maxOrbitAngle = Math.PI/2 + orbitAngleTolerance;

  const isCloseEnoughToTarget = distanceToTarget <= magnitudeOfDesiredVelocity;
  const hasOrbitAngle = minOrbitAngle < angleToTarget && angleToTarget < maxOrbitAngle;

  const isOrbiting = isCloseEnoughToTarget && hasOrbitAngle;

  return isOrbiting;
}

export function useSelfDriving({
  setAcceleration,
  setBrake,
  updateSteering,
  velocity,
  position,
  steeringValue,
  maxSteeringAngle,
} : {
  setAcceleration: ({ force }: { force: number; }) => void;
  setBrake: ({ force }: { force: number; }) => void;
  updateSteering: (nextSteeringValue: number) => void;
  velocity: Vector3;
  position: Vector3;
  steeringValue: number;
  maxSteeringAngle: number;
}) {
  const desiredVelocity = useRef(velocity.clone());
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });
  const targetCheckpointIndex = useRef(0);
  const isOrbiting = useRef(false);

  const speed = velocity?.length() ?? 0;

  const autoAccelerate = useCallback(() => {
    setBrake({ force: 0 });
    if (speed < speedLimit) {
      setAcceleration({ force: 500 });
    } else {
      setAcceleration({ force: 0 });
    }
  }, [speed, setAcceleration, setBrake]);

  const seek = useCallback(({ delta } : { delta: number }) => {
    const typedWindow = window as typeof window & Record<string, unknown>;
    const target = checkpoints[targetCheckpointIndex.current];

    desiredVelocity.current = getDesiredVelocity({ position, target, speed });

    const angleToTarget = velocity.angleTo(desiredVelocity.current);
    typedWindow.angleToTarget = angleToTarget;

    /** perpendicular up vector from a counterclockwise sweep from vector a to b */
    const crossProduct = new Vector3().crossVectors(
      desiredVelocity.current,
      velocity
    );
    const streeringDirection = -Math.sign(crossProduct.y);

    const turnAngle = streeringDirection * maxSteeringAngle;

    const distanceToTarget = position.distanceTo(
      checkpoints[targetCheckpointIndex.current]
    );
    typedWindow.distanceToTarget = distanceToTarget;

    isOrbiting.current = detectOrbit({
      position,
      velocity,
      desiredVelocity: desiredVelocity.current,
      target,
    });

    const shouldMoveToNextCheckpoint = distanceToTarget < 2 || isOrbiting.current;
    if (shouldMoveToNextCheckpoint) {
      targetCheckpointIndex.current = (targetCheckpointIndex.current + 1) % checkpoints.length;
    }

    /**
     * The closer we are to the target, the more tolerant the angle gets.
     * Otherwise the wheels will jitter. The 1.5 factor was just based on
     * what looked good in practical tests.
     */
    const angleTolerance = MathUtils.clamp(1.5 / distanceToTarget, 0.01, 0.2);
    typedWindow.angleTolerance = angleTolerance;

    const shouldTurn = angleToTarget > angleTolerance;

    const targetSteeringValue = shouldTurn ? turnAngle : 0;
    const lerpFactor = 6 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, lerpFactor);

    updateSteering(updatedSteeringValue);
  }, [
    position,
    velocity,
    speed,
    maxSteeringAngle,
    steeringValue,
    updateSteering,
  ]);

  useFrame((_, delta) => {
    if (isSelfDriving) {
      seek({ delta });
    }
  });

  useEffect(() => {
    if (isSelfDriving) {
      autoAccelerate();
    }
  }, [isSelfDriving, autoAccelerate, seek]);

  return {
    isSelfDriving,
    checkpoints,
    pathsToNextCheckpoints,
    desiredVelocity: desiredVelocity.current,
  };
}
