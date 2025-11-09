import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getVectorFromStartToTarget } from '../helpers/vectorHelpers';
import { typedWindow } from '../helpers/typedWindow';

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

  const seek = useCallback(({ delta } : { delta: number }) => {
    const angleToTarget = velocity.angleTo(desiredVelocity.current);
    typedWindow.angleToTarget = angleToTarget;

    /** perpendicular up vector from a counterclockwise sweep from vector a to b */
    const crossProduct = new Vector3().crossVectors(
      desiredVelocity.current,
      velocity
    );
    const streeringDirection = -Math.sign(crossProduct.y);

    const turnAngle = streeringDirection * maxSteeringAngle;

    const targetSteeringValue = angleToTarget > 0.05 ? turnAngle : 0;
    const lerpFactor = 6 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, lerpFactor);

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
    selfDrivingTargets,
    desiredVelocity: desiredVelocity.current,
  };
}
