import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { globalSettings, GRAPHICS_MODES } from './globalSettings';

type MaterialType = THREE.MeshStandardMaterial | Array<THREE.MeshStandardMaterial>;

const roadMaterialNames = [
  'sidewalk_efficient',
  'sidewalk_corner',
  'road',
  'road_crosswalk',
  'pavement',
];
const visualizerMaterialNames = [
  'car_box_template',
];
const nonWireframesInMathMode = [
  ...roadMaterialNames,
  ...visualizerMaterialNames,
];

const isMathMode = globalSettings.viewMode === GRAPHICS_MODES.MATH_MODE;
const isWireframeMode = globalSettings.viewMode === GRAPHICS_MODES.WIREFRAME_3D;

function setWireframe({ material } : { material: THREE.MeshStandardMaterial }) {

  if (isWireframeMode) {
    material.wireframe = true;
  } else if (isMathMode) {
    const shouldBeWireframe = !nonWireframesInMathMode.includes(material.name);
    material.wireframe = shouldBeWireframe;
  }
}

export function WireframeToggle() {
  const { scene } = useThree();

  const isEnabled = globalSettings.viewMode === GRAPHICS_MODES.MATH_MODE ||
    globalSettings.viewMode === GRAPHICS_MODES.WIREFRAME_3D
  ;

  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        const material: MaterialType = obj.material;

        if (Array.isArray(material)) {
          material.forEach((mat) => {
            mat.wireframe = isEnabled;
            setWireframe({ material: mat });
          });
        } else {
          setWireframe({ material });
        }
      }
    });
  }, [scene, isEnabled]);

  return null;
}
