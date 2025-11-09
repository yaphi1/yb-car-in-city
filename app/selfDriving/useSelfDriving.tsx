import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getVectorFromStartToTarget } from '../helpers/vectorHelpers';

const speedLimit = 5;

const selfDrivingTargets = [
  new Vector3(147, 0, -122),
];

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
    const target = selfDrivingTargets[0].clone();

    const vectorToTarget = getVectorFromStartToTarget({
      start: position,
      target,
      customLength: speed,
    });
    desiredVelocity.current.copy(vectorToTarget);
  }, [position]);

  useEffect(() => {
    updateDesiredVelocity();
  }, [updateDesiredVelocity]);

  const autoTurn = useCallback(({ delta } : { delta: number }) => {
    const isAtBoundary = position.z < -120 ||
      position.z > -60 ||
      position.x > 170 ||
      position.x < 135
    ;
    const selfDrivingTargetSteeringValue = isAtBoundary ? maxSteeringAngle : 0;
    const lerpFactor = 6 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, selfDrivingTargetSteeringValue, lerpFactor);

    updateSteering(updatedSteeringValue);
  }, [
    position.x,
    position.z,
    maxSteeringAngle,
    steeringValue,
    updateSteering,
  ]);

  useFrame((_, delta) => {
    if (isSelfDriving) {
      autoTurn({ delta });
    }
  });

  useEffect(() => {
    if (isSelfDriving) {
      autoAccelerate();
    }
  }, [isSelfDriving, autoAccelerate, autoTurn]);

  return {
    isSelfDriving,
    selfDrivingTargets,
    desiredVelocity: desiredVelocity.current,
  };
}
