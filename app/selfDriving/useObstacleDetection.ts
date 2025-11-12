import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Object3D, Raycaster, Vector3 } from 'three';

export function useObstacleDetection({ position, velocity } : {
  position: Vector3;
  velocity: Vector3;
}) {
  const { scene } = useThree();
  const [isObstacleDetected, setIsObstacleDetected] = useState(false);

  useEffect(() => {
    const speed = velocity.length();
    const origin = position;
    const direction = velocity.normalize();
    const near = 3;
    const far = speed + 5;

    const raycaster = new Raycaster(origin, direction, near, far);

    const otherCars: Array<Object3D> = [];
    scene.traverse((obj: Object3D) => {
      if (obj.name === 'car') {
        otherCars.push(obj);
      }
    });

    const detectedObstacles = raycaster.intersectObjects(otherCars);

    if (detectedObstacles.length) {
      setIsObstacleDetected(true);
    } else {
      setIsObstacleDetected(false);
    }
  }, [scene, position, velocity]);

  return {
    isObstacleDetected,
  };
}
