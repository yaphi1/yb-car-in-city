import { useEffect, useState } from 'react';
import { Raycaster, Vector3 } from 'three';
import { useCarList } from './useCarList';

export function useObstacleDetection({ position, velocity } : {
  position: Vector3;
  velocity: Vector3;
}) {
  const [isObstacleDetected, setIsObstacleDetected] = useState(false);

  const carList = useCarList();

  useEffect(() => {
    const speed = velocity.length();
    const origin = position;
    const direction = velocity.clone().normalize();
    const near = 3;
    const far = speed + 5;

    const raycaster = new Raycaster(origin, direction, near, far);

    const detectedObstacles = raycaster.intersectObjects(carList);

    if (detectedObstacles.length) {
      setIsObstacleDetected(true);
    } else {
      setIsObstacleDetected(false);
    }
  }, [carList, position, velocity]);

  return {
    isObstacleDetected,
  };
}
