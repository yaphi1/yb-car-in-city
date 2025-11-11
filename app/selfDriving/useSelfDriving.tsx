import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getSignedAngle, getVectorFromStartToTarget } from '../helpers/vectorHelpers';
import { buildTravelPath, getPathsToNextCheckpoints } from './navigation';
import { journeys } from './journeys';

const SPEED_LIMIT = 10;
const CHECKPOINT_HIT_DISTANCE = 4;

const lanes = journeys.clockwiseBlock.lanes;

function getDesiredVelocity({ position, target, speed } : {
  position: Vector3;
  target: Vector3;
  speed: number;
}) {
  const desiredVelocity = getVectorFromStartToTarget({
    start: new Vector3(position.x, 0, position.z),
    target: new Vector3(target.x, 0, target.z),
    customLength: speed,
  });
  return desiredVelocity;
}

function getTurnAngle({ velocity, desiredVelocity, maxSteeringAngle } : {
  velocity: Vector3;
  desiredVelocity: Vector3;
  maxSteeringAngle: number;
}) {
  const steeringDirection = getSignedAngle(velocity, desiredVelocity);
  const turnAngle = steeringDirection * maxSteeringAngle;
  return turnAngle;
}

/**
 * This function helps us escape situations where the car
 * approaches a checkpoint from an awkward angle, can't
 * get close enough to clear the checkpoint, and therefore
 * starts to infinitely orbit the checkpoint.
 */
function detectOrbit({ position, velocity, desiredVelocity, target } : {
  position: Vector3;
  velocity: Vector3;
  desiredVelocity: Vector3;
  target: Vector3;
}) {
  const angleToTarget = velocity.angleTo(desiredVelocity);
  const distanceToTarget = position.distanceTo(target);
  const magnitudeOfDesiredVelocity = desiredVelocity.length();
  const orbitAngleTolerance = 0.2;
  const minOrbitAngle = Math.PI/2 - orbitAngleTolerance;
  const maxOrbitAngle = Math.PI/2 + orbitAngleTolerance;
  const maxOrbitDiameter = 2 * magnitudeOfDesiredVelocity - CHECKPOINT_HIT_DISTANCE;

  const isCloseEnoughToTarget = distanceToTarget <= maxOrbitDiameter;
  const hasOrbitAngle = minOrbitAngle < angleToTarget && angleToTarget < maxOrbitAngle;

  const isOrbiting = isCloseEnoughToTarget && hasOrbitAngle;

  return isOrbiting;
}

export function useSelfDriving({
  setAcceleration,
  setBrake,
  updateSteering,
  velocity,
  position,
  steeringValue,
  maxSteeringAngle,
} : {
  setAcceleration: ({ force }: { force: number; }) => void;
  setBrake: ({ force }: { force: number; }) => void;
  updateSteering: (nextSteeringValue: number) => void;
  velocity: Vector3;
  position: Vector3;
  steeringValue: number;
  maxSteeringAngle: number;
}) {
  const [laneIndex, setLaneIndex] = useState(1);
  const checkpoints = useMemo(() => lanes[laneIndex], [laneIndex]);
  const pathsToNextCheckpoints = useMemo(() => {
    return getPathsToNextCheckpoints({ checkpoints });
  }, [checkpoints]);

  const changeLanes = () => {
    setLaneIndex((index) => (index + 1) % lanes.length);
  };

  useEffect(() => {
    setInterval(changeLanes, 4000);
  }, []);

  const desiredVelocity = useRef(velocity.clone());
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });
  const targetCheckpointIndex = useRef(0);
  const isOrbiting = useRef(false);

  const speed = velocity?.length() ?? 0;

  const autoAccelerate = useCallback(() => {
    setBrake({ force: 0 });
    if (speed < SPEED_LIMIT) {
      setAcceleration({ force: 500 });
    } else {
      setAcceleration({ force: 0 });
    }
  }, [speed, setAcceleration, setBrake]);

  const seek = useCallback(({ delta } : { delta: number }) => {
    autoAccelerate();
    const typedWindow = window as typeof window & Record<string, unknown>;
    const target = checkpoints[targetCheckpointIndex.current];

    desiredVelocity.current = getDesiredVelocity({ position, target, speed });

    const angleToTarget = velocity.angleTo(desiredVelocity.current);
    typedWindow.angleToTarget = angleToTarget;

    const turnAngle = getTurnAngle({
      velocity,
      desiredVelocity: desiredVelocity.current,
      maxSteeringAngle,
    });

    const distanceToTarget = position.distanceTo(
      checkpoints[targetCheckpointIndex.current]
    );
    typedWindow.distanceToTarget = distanceToTarget;

    isOrbiting.current = detectOrbit({
      position,
      velocity,
      desiredVelocity: desiredVelocity.current,
      target,
    });

    const hasHitCheckpoint = distanceToTarget < CHECKPOINT_HIT_DISTANCE;
    const shouldMoveToNextCheckpoint = hasHitCheckpoint || isOrbiting.current;
    if (shouldMoveToNextCheckpoint) {
      targetCheckpointIndex.current = (targetCheckpointIndex.current + 1) % checkpoints.length;
    }

    const angleTolerance = 0.01;

    const shouldTurn = angleToTarget > angleTolerance;

    const targetSteeringValue = shouldTurn ? turnAngle : 0;
    const lerpFactor = 3 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, lerpFactor);

    updateSteering(updatedSteeringValue);
  }, [
    position,
    velocity,
    speed,
    maxSteeringAngle,
    steeringValue,
    updateSteering,
    checkpoints,
    autoAccelerate,
  ]);

  useFrame((_, delta) => {
    if (isSelfDriving) {
      seek({ delta });
    }
  });

  return {
    isSelfDriving,
    checkpoints,
    pathsToNextCheckpoints,
    desiredVelocity: desiredVelocity.current,
  };
}
