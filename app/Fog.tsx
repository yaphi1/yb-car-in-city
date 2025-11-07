import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export function Fog({ color = '#ffffff', near = 200, far = 2000 } : {
  color?: THREE.ColorRepresentation;
  near?: number;
  far?: number;
}) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(color, near, far);
  }, [scene, color, near, far]);

  return null;
}
