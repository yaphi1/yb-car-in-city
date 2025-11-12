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
import { journeys } from "./selfDriving/journeys";
import { RaycastTest } from "./experiments/RaycastTest";

const startingPosition = new Vector3(156, 1, -80);
// const startPositionToTestOrbit = new Vector3(148, 1, -80);
const car2StartingPosition = new Vector3(148, 1, -70);
const car2StartingDirection = new Vector3(0.5, 0, -1);

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
              <ControllableCar
                color={carColor}
                isMainCharacter={true}
                journey={journeys.clockwiseBlock}
                startingLaneIndex={1}
                startingCheckpointIndex={1}
                topSpeed={10}
              />
              <ControllableCar
                color="#00aa55"
                journey={journeys.clockwiseBlock}
                startingLaneIndex={1}
                // startingCheckpointIndex={2}
                startingCheckpointIndex={5}
                topSpeed={5}
              />
              <ControllableCar
                color="#ddaa00"
                journey={journeys.clockwiseBlock}
                startingLaneIndex={0}
                // startingCheckpointIndex={3}
                startingCheckpointIndex={6}
                topSpeed={7}
              />
              <ControllableCar
                color="#0098db"
                journey={journeys.counterclockwiseBlock}
                startingLaneIndex={0}
                // startingCheckpointIndex={0}
                startingCheckpointIndex={30}
                topSpeed={5}
              />
              <ControllableCar
                color="#ffffff"
                journey={journeys.counterclockwiseBlock}
                startingLaneIndex={0}
                // startingCheckpointIndex={4}
                startingCheckpointIndex={2}
                topSpeed={5}
              />
              
              {/* Additional traffic */}
              <ControllableCar
                color="#333333"
                journey={journeys.counterclockwiseBlock}
                startingLaneIndex={0}
                startingCheckpointIndex={10}
                topSpeed={5}
              />
              <ControllableCar
                color="#0098db"
                journey={journeys.counterclockwiseBlock}
                startingLaneIndex={0}
                startingCheckpointIndex={13}
                topSpeed={5}
              />
              <ControllableCar
                color="#858d96"
                journey={journeys.counterclockwiseBlock}
                startingLaneIndex={1}
                startingCheckpointIndex={12}
                topSpeed={7}
              />
              <ControllableCar
                color="#a79d72"
                journey={journeys.clockwiseBlock}
                startingLaneIndex={0}
                startingCheckpointIndex={0}
                topSpeed={5}
              />
              <ControllableCar
                color="#ffffff"
                journey={journeys.clockwiseBlock}
                startingLaneIndex={0}
                startingCheckpointIndex={1}
                topSpeed={5}
              />

            {/* </Debug> */}

            <WireframeToggle />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </Suspense>
  );
}
