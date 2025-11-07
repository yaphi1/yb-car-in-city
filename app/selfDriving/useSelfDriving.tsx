import { useControls } from 'leva';
import { useEffect } from 'react';
import { Vector3 } from 'three';

const speedLimit = 5;

export function useSelfDriving({
  setAcceleration,
  setBrake,
  updateSteering,
  velocity,
} : {
  setAcceleration: ({ force }: { force: number; }) => void;
  setBrake: ({ force }: { force: number; }) => void;
  updateSteering: (nextSteeringValue: number) => void;
  velocity: Vector3;
}) {
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });

  const speed = velocity?.length() ?? 0;

  useEffect(() => {
    if (isSelfDriving) {
      setBrake({ force: 0 });
      if (speed < speedLimit) {
        setAcceleration({ force: 500 });
      } else {
        setAcceleration({ force: 0 });
      }
    }
  }, [isSelfDriving, setAcceleration, setBrake, speed]);

  return { isSelfDriving };
}
