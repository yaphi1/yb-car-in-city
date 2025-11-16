import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Object3D } from 'three';

export function useCarList() {
  const { scene } = useThree();
  const [carList, setCarList] = useState<Array<Object3D>>([]);

  useEffect(() => {
    const cars: Array<Object3D> = [];
    scene.traverse((obj: Object3D) => {
      if (obj.name === 'car_body_mesh') {
        cars.push(obj);
      }
    });
    setCarList(cars);
  }, [scene]);
  
  return carList;
}
