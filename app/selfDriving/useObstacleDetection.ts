import { useEffect, useState } from 'react';
import { Raycaster, Vector3 } from 'three';
import { useCarList } from './useCarList';

export function useObstacleDetection({
  isSelfDriving,
  position,
  velocity,
  desiredVelocity,
  customNear,
  customFar,
} : {
  isSelfDriving: boolean;
  position: Vector3;
  velocity: Vector3;
  desiredVelocity: Vector3;
  customNear?: number;
  customFar?: number;
}) {
  const [isObstacleDetected, setIsObstacleDetected] = useState(false);

  const carList = useCarList();

  useEffect(() => {
    if (!isSelfDriving) {
      return;
    }
    const speed = velocity.length();
    const origin = position;
    const direction = desiredVelocity.clone().normalize();
    const near = customNear ?? 3;
    const far = customFar ?? speed + 5;

    const raycaster = new Raycaster(origin, direction, near, far);

    const doRecursiveCheck = false;
    const detectedObstacles = raycaster.intersectObjects(carList, doRecursiveCheck);

    if (detectedObstacles.length) {
      setIsObstacleDetected(true);
    } else {
      setIsObstacleDetected(false);
    }
  }, [carList, position, velocity, desiredVelocity, customNear, customFar, isSelfDriving]);

  return {
    isObstacleDetected,
  };
}
