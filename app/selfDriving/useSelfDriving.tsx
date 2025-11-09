import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getVectorFromStartToTarget } from '../helpers/vectorHelpers';

const speedLimit = 10;

const checkpoints = [
  new Vector3(156, 0, -80),
  new Vector3(160, 0, -89),
  new Vector3(170, 0, -91),
  new Vector3(180, 0, -91),
  new Vector3(240, 0, -91),
  new Vector3(230, 0, -102),
  new Vector3(200, 0, -102),
  new Vector3(160, 0, -102),
  new Vector3(144, 0, -82),
];

const pathsToNextCheckpoints = checkpoints.map((checkpoint, i) => {
  const nextCheckpoint = checkpoints[(i + 1) % checkpoints.length];
  const pathToNextCheckpoint = getVectorFromStartToTarget({
    start: checkpoint,
    target: nextCheckpoint,
  });
  return pathToNextCheckpoint;
});

function detectOrbit({ position, velocity, desiredVelocity, target } : {
  position: Vector3;
  velocity: Vector3;
  desiredVelocity: Vector3;
  target: Vector3;
}) {
  const angleToTarget = velocity.angleTo(desiredVelocity);
  const distanceToTarget = position.distanceTo(target);
  const magnitudeOfDesiredVelocity = desiredVelocity.length();

  const isCloseEnoughToTarget = distanceToTarget <= magnitudeOfDesiredVelocity;
  const hasOrbitAngle = Math.PI - 0.1 < angleToTarget && angleToTarget < Math.PI + 0.1;

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
  const desiredVelocity = useRef(new Vector3().copy(velocity));
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });
  const targetIndex = useRef(0);
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

  const updateDesiredVelocity = useCallback(() => {
    const targetCheckpoint = checkpoints[targetIndex.current];
    const vectorToTarget = getVectorFromStartToTarget({
      start: new Vector3(position.x, 0, position.z),
      target: new Vector3(targetCheckpoint.x, 0, targetCheckpoint.z),
      customLength: speed,
    });
    desiredVelocity.current.copy(vectorToTarget);
  }, [position, speed]);

  useEffect(() => {
    updateDesiredVelocity();
  }, [updateDesiredVelocity]);

  const seek = useCallback(({ delta } : { delta: number }) => {
    const typedWindow = window as typeof window & Record<string, unknown>;

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
      checkpoints[targetIndex.current]
    );
    typedWindow.distanceToTarget = distanceToTarget;
    if (distanceToTarget < 2) {
      targetIndex.current = (targetIndex.current + 1) % checkpoints.length;
    }

    /**
     * The closer we are to the target, the more tolerant the angle gets.
     * Otherwise the wheels will jitter. The 1.5 factor was just based on
     * what looked good in practical tests.
     */
    const angleTolerance = MathUtils.clamp(1.5 / distanceToTarget, 0.01, 0.4);
    typedWindow.angleTolerance = angleTolerance;

    const shouldTurn = angleToTarget > angleTolerance;

    const targetSteeringValue = shouldTurn ? turnAngle : 0;
    const lerpFactor = 6 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, lerpFactor);

    updateSteering(updatedSteeringValue);
  }, [
    position,
    velocity,
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
