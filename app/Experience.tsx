import { Suspense } from "react";
import { Canvas } from '@react-three/fiber';
import { Environment, KeyboardControls, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Ground } from "./Ground";
import { ControllableCar } from "./ControllableCar";
import { Debug, Physics } from "@react-three/cannon";
import { Vector3 } from "three";
import { useColors } from "./useColors";
import { useControls } from "leva";
import { CityModel } from './CityModel';
import { Fog } from './Fog';

function CarExperience() {
  const carColor = useColors();

  return (
    <>
      {/* <Environment preset="sunset" /> */}

      {/* <Environment preset="dawn" background /> */}

      {/* <color args={[0, 0, 0]} attach="background" /> */}

      <color args={ [ '#ffe8e8' ] } attach="background" />
      <Environment preset="dawn" />
      <Fog color="#ffe8e8" near={200} far={2000} />
      <Ground />
      <CityModel />
      <ControllableCar color={carColor} startingPosition={new Vector3(156, 1, -70)} />
    </>
  );
}

export function Experience() {
  useControls(
    'Controls',
    {
      'Move': {
        value: 'Arrows or w/a/s/d',
        editable: false,
      },
      'Brake': {
        value: '"b" or space',
        editable: false,
      },
    },
  );

  const map = [
    { name: 'forward', keys: ['w', 'ArrowUp'] },
    { name: 'backward', keys: ['s', 'ArrowDown'] },
    { name: 'left', keys: ['a', 'ArrowLeft'] },
    { name: 'right', keys: ['d', 'ArrowRight'] },
    { name: 'brake', keys: ['b', ' '] },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KeyboardControls map={map}>
        <Canvas dpr={window.devicePixelRatio}>
          <Physics
            broadphase="SAP"
            defaultContactMaterial={{
              contactEquationStiffness: 10000,
            }}
          >
            {/* <Debug color="white" scale={1.1}> */}
              <CarExperience />
            {/* </Debug> */}
          </Physics>
        </Canvas>
      </KeyboardControls>
    </Suspense>
  );
}
