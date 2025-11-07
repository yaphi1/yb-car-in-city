import { useControls } from 'leva';
import { useEffect } from 'react';

export function useSelfDriving({
  setAcceleration,
  setBrake,
  updateSteering,
} : {
  setAcceleration: ({ force }: { force: number; }) => void;
  setBrake: ({ force }: { force: number; }) => void;
  updateSteering: (nextSteeringValue: number) => void;
}) {
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });

  useEffect(() => {
    if (isSelfDriving) {
      setBrake({ force: 0 });
      setAcceleration({ force: 500 });
    }
  }, [isSelfDriving, setAcceleration, setBrake]);

  return { isSelfDriving };
}
