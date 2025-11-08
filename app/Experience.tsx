import { Suspense, useMemo } from "react";
import { Canvas } from '@react-three/fiber';
import { Environment, KeyboardControls, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Ground } from "./Ground";
import { ControllableCar } from "./ControllableCar";
import { Debug, Physics } from "@react-three/cannon";
import { Vector3 } from "three";
import { useColors } from "./useColors";
import { useControls } from "leva";
import { Fog } from './Fog';
import { WireframeToggle } from './WireframeToggle';
import { CityTileModel } from './CityTileModel';

export function Experience() {
  const carColor = useColors();

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

  const cityTiles = useMemo(() => {
    const xCols = 6;
    const zRows = 20;
    const xStart = -Math.floor(xCols / 2);
    const zStart = -Math.floor(xCols / 2);

    const tiles = [];

    for (let x = xStart; x < xCols; x++) {
      for (let z = zStart; z < zRows; z++) {
        tiles.push(
          <CityTileModel key={`x${x}_z${z}`} position={[x * 604, 0, z * 224]} />
        );
      }
    }

    return tiles;
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KeyboardControls map={map}>
        <Canvas dpr={2}>
          <Physics
            broadphase="SAP"
            defaultContactMaterial={{
              contactEquationStiffness: 10000,
            }}
          >
            {/* <Debug color="white" scale={1.1}> */}
              <color args={ [ '#ffe8e8' ] } attach="background" />
              <Environment preset="dawn" />
              <Fog color="#ffe8e8" near={200} far={2000} />
              <Ground />
              {cityTiles}
              <ControllableCar color={carColor} startingPosition={new Vector3(156, 1, -70)} />
            {/* </Debug> */}

            <WireframeToggle />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </Suspense>
  );
}
