import { useControls } from 'leva';
import { useCallback, useEffect } from 'react';
import { MathUtils, Vector3 } from 'three';

const speedLimit = 5;

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

  const turn = useCallback((targetSteeringValue: number) => {
    // this needs a time delta; otherwise it'll look instant anyway
    // before touching this, go to ControllableCar and use refs instead of state
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, 0.2);

    updateSteering(updatedSteeringValue);
  }, [updateSteering, steeringValue]);

  const autoTurn = useCallback(() => {
    const isAtBoundary = position.z < -120 ||
      position.z > -60 ||
      position.x > 170 ||
      position.x < 135
    ;
    if (isAtBoundary) {
      turn(maxSteeringAngle);
    } else {
      turn(0);
    }
  }, [position.x, position.z, turn]);

  useEffect(() => {
    if (isSelfDriving) {
      autoAccelerate();
      autoTurn();
    }
  }, [isSelfDriving, autoAccelerate, autoTurn]);

  return { isSelfDriving };
}
