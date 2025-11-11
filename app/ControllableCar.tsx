import { ColorRepresentation, Group, MathUtils, Mesh, Object3DEventMap, Quaternion, Vector3 } from "three";
import { useKeyboardControls } from "@react-three/drei";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { WheelInfoOptions, useBox, useRaycastVehicle } from "@react-three/cannon";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import { CarCamera } from "./CarCamera";
import { PolestarCar } from "./PolestarCar";
import { useSelfDriving } from './selfDriving/useSelfDriving';
import { SelfDrivingDebugVisualizer } from './selfDriving/SelfDrivingDebugVisualizer';
import { globalSettings, GRAPHICS_MODES } from './globalSettings';
import { getSignedAngle } from "./helpers/vectorHelpers";
import { Journey, journeys } from "./selfDriving/journeys";
import { getOrientationAtJourneyStart } from "./selfDriving/navigation";

const maxSteeringAngle = 0.35;
const startingVelocity = new Vector3(0, 0, 0);
const north = new Vector3(0, 0, -1);

export function ControllableCar({
  color = 0x5500aa,
  manualStartingPosition,
  manualStartingDirection,
  isMainCharacter = false,
  journey = journeys.clockwiseBlock,
  startingLaneIndex = 0,
  startingCheckpointIndex = 0,
  topSpeed = 10,
} : {
  color?: ColorRepresentation;
  manualStartingPosition?: Vector3;
  manualStartingDirection?: Vector3;
  isMainCharacter?: boolean;
  journey?: Journey;
  startingLaneIndex?: number;
  startingCheckpointIndex?: number;
  topSpeed?: number;
}) {
  const speed = useRef(0);
  const velocity = useRef(startingVelocity);

  const orientationAtJourneyStart = useMemo(() => {
    return getOrientationAtJourneyStart({
      journey, startingLaneIndex, startingCheckpointIndex
    });
  }, [journey, startingLaneIndex, startingCheckpointIndex]);

  const startingPosition = manualStartingPosition || orientationAtJourneyStart.position;
  const startingDirection = manualStartingDirection || orientationAtJourneyStart.direction;

  const [position, setPosition] = useState(startingPosition);
  const [horizontalDirection, setHorizontalDirection] = useState(startingDirection);
  const steeringValue = useRef(0);

  const forwardPressed = useKeyboardControls(state => state.forward);
  const backwardPressed = useKeyboardControls(state => state.backward);
  const leftPressed = useKeyboardControls(state => state.left);
  const rightPressed = useKeyboardControls(state => state.right);
  const brakePressed = useKeyboardControls(state => state.brake);
  const isAntiLockBrakeClamped = useRef(false);

  const startingRotation = useMemo(() => {
    const angle = getSignedAngle(north, startingDirection);
    const rotation = [0, angle, 0] as [number, number, number];
    return rotation;
  }, [startingDirection]);

  const width = 1.8;
  const height = 0.85;
  const front = 1.96;
  const wheelRadius = 0.7;

  const chassisBodyArgs: [number, number, number] = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(
    () => ({
      args: chassisBodyArgs,
      mass: 150,
      position: [startingPosition.x, startingPosition.y, startingPosition.z],
      rotation: startingRotation,
    }),
    useRef<Group>(null)
  );

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius) as [
    Array<RefObject<Group<Object3DEventMap>>>,
    Array<WheelInfoOptions>
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef<Group>(null)
  );

  const setAcceleration = useCallback(({ force }: { force: number; }) => {
    vehicleApi.applyEngineForce(force, 2);
    vehicleApi.applyEngineForce(force, 3);
  }, [vehicleApi]);

  const setBrake = useCallback(({ force }: { force: number; }) => {
    vehicleApi.setBrake(force, 2);
    vehicleApi.setBrake(force, 3);
  }, [vehicleApi]);

  const updateSteering = useCallback((nextSteeringValue: number) => {
    vehicleApi.setSteeringValue(nextSteeringValue, 0);
    vehicleApi.setSteeringValue(nextSteeringValue, 1);
    steeringValue.current = nextSteeringValue;
  }, [vehicleApi]);

  const {
    isSelfDriving,
    checkpoints,
    pathsToNextCheckpoints,
    desiredVelocity,
  } = useSelfDriving({
    setAcceleration,
    setBrake,
    updateSteering,
    velocity: velocity.current,
    position,
    steeringValue: steeringValue.current,
    maxSteeringAngle,
    journey,
    startingLaneIndex,
    startingCheckpointIndex,
    topSpeed,
  });

  const runAntiLockBrakes = useCallback(() => {
    isAntiLockBrakeClamped.current = !isAntiLockBrakeClamped.current;
    const brakeForce = isAntiLockBrakeClamped.current ? 10 : 0;
    setBrake({ force: brakeForce });
  }, [setBrake]);

  const tryToCoast = useCallback(() => {
    const isNotAccelerating = !forwardPressed && !backwardPressed;
    const shouldCarRest = speed.current < 0.5 && isNotAccelerating;
    if (shouldCarRest) {
      isAntiLockBrakeClamped.current = true;
      setBrake({ force: 10 });
    } else {
      isAntiLockBrakeClamped.current = false;
      setBrake({ force: 0 });
    }
  }, [forwardPressed, backwardPressed, setBrake]);

  const steerWhenPressed = useCallback(({ delta } : { delta: number }) => {
    let targetSteeringValue = 0;
    const lerpFactor = 10 * delta;
    if (leftPressed && !rightPressed) {
      targetSteeringValue = MathUtils.lerp(steeringValue.current, maxSteeringAngle, lerpFactor);
    } else if (rightPressed && !leftPressed) {
      targetSteeringValue = MathUtils.lerp(steeringValue.current, -maxSteeringAngle, lerpFactor);
    } else {
      targetSteeringValue = MathUtils.lerp(steeringValue.current, 0, lerpFactor);
    }
    updateSteering(targetSteeringValue);
  }, [leftPressed, rightPressed, updateSteering]);

  useFrame((_, delta) => {
    if (isSelfDriving || !isMainCharacter) { return; }
    steerWhenPressed({ delta });
    if (brakePressed) { runAntiLockBrakes(); }
    if (!brakePressed) { tryToCoast(); }
  });

  useEffect(() => {
    if (isSelfDriving || !isMainCharacter) {
      return;
    }
    if (forwardPressed && !backwardPressed) {
      setBrake({ force: 0 });
      setAcceleration({ force: 500 });
    }
    if (backwardPressed && !forwardPressed) {
      setBrake({ force: 0 });
      setAcceleration({ force: -500 });
    }
    if (!forwardPressed && !backwardPressed) {
      setAcceleration({ force: 0 });
    }
  }, [setAcceleration, setBrake, forwardPressed, backwardPressed, brakePressed, isSelfDriving, isMainCharacter]);

  useEffect(() => {
    chassisApi.velocity.subscribe((newVelocity) => {
      velocity.current = new Vector3(...newVelocity);
      const newSpeed = velocity.current.length();
      speed.current = newSpeed;
    });

    chassisApi.position.subscribe((position) => {
      const positionVector = new Vector3(...position);
      setPosition(positionVector);
    });

    chassisApi.quaternion.subscribe((quaternion) => {
      // To get direction from quatnerion:
      // "just rotate your initial forward direction around the current rotation axis"
      // https://www.gamedev.net/forums/topic/56471-extracting-direction-vectors-from-quaternion/
      setHorizontalDirection(() => {
        const updatedDirection = north.clone();
        updatedDirection.applyQuaternion(new Quaternion(...quaternion));
        updatedDirection.y = 0;
        return updatedDirection;
      });
    });
  }, [chassisApi]);

  // Deliberately ignore TypeScript warnings about adding custom properties to window
  // This is for debugging, not prod.
  if (globalSettings.showCarDebugNumbers) {
    const typedWindow = window as typeof window & Record<string, unknown>;
    typedWindow.carPosition = position;
    typedWindow.carDirection = horizontalDirection;
    typedWindow.carVelocity = velocity.current;
    typedWindow.carSpeed = speed.current;
    typedWindow.desiredVelocity = desiredVelocity;
  }

  return (
    <>
      {isMainCharacter && (
        <CarCamera carPosition={position} carDirection={horizontalDirection} />
      )}

      {globalSettings.graphicsMode === GRAPHICS_MODES.MATH_MODE && (
        <SelfDrivingDebugVisualizer
          carPosition={position}
          carDirection={horizontalDirection}
          carVelocity={velocity.current}
          desiredVelocity={desiredVelocity}
          checkpoints={checkpoints}
          pathsToNextCheckpoints={pathsToNextCheckpoints}
        />
      )}

      <group ref={vehicle} name="vehicle">

        {/* <mesh ref={chassisBody}>
          <meshStandardMaterial />
          <boxGeometry args={chassisBodyArgs} />
        </mesh> */}

        {/* <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} /> */}

        <group>
          <PolestarCar
            color={color}
            steeringValue={steeringValue.current}
            position={position}
            chassisBodyRef={chassisBody}
            // rotation-y={Math.PI}
            wheelRefs={wheels}
          />
        </group>
      </group>
    </>
  );
}
