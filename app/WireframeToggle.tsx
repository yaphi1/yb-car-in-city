import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

type MaterialType = THREE.MeshStandardMaterial | Array<THREE.MeshStandardMaterial>;

export function WireframeToggle({ isEnabled }: { isEnabled: boolean; }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        const material: MaterialType = obj.material;

        if (Array.isArray(material)) {
          material.forEach((mat) => {
            mat.wireframe = isEnabled;
          });
        } else {
          material.wireframe = isEnabled;
        }
      }
    });
  }, [scene, isEnabled]);

  return null;
}
