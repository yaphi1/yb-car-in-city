import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathUtils, Vector3 } from 'three';
import { getSignedAngle, getVectorFromStartToTarget } from '../helpers/vectorHelpers';
import { getPathsToNextCheckpoints } from './navigation';
import { Journey } from './navigation';
import { useObstacleDetection } from './useObstacleDetection';
import { useLaneChangeSafety } from './useLaneChangeSafety';

const CHECKPOINT_HIT_DISTANCE = 5;

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
  journey,
  startingLaneIndex,
  startingCheckpointIndex,
  topSpeed,
} : {
  setAcceleration: ({ force }: { force: number; }) => void;
  setBrake: ({ force }: { force: number; }) => void;
  updateSteering: (nextSteeringValue: number) => void;
  velocity: Vector3;
  position: Vector3;
  steeringValue: number;
  maxSteeringAngle: number;
  journey: Journey;
  startingLaneIndex: number;
  startingCheckpointIndex: number;
  topSpeed: number;
}) {
  const { isSelfDriving } = useControls({
    isSelfDriving: {
      label: 'Self-driving',
      value: false,
    },
  });

  const [laneIndex, setLaneIndex] = useState(startingLaneIndex);
  const checkpoints = useMemo(() => journey.lanes[laneIndex], [journey, laneIndex]);
  const pathsToNextCheckpoints = useMemo(() => getPathsToNextCheckpoints({ checkpoints }), [checkpoints]);
  const [isChangingLanes, setIsChangingLanes] = useState(false);
  const isBraking = useRef(false);
  const targetSpeed = useRef(topSpeed);
  const indexOfLastLaneChange = useRef<number | null>(null);
  const isOrbiting = useRef(false);
  const desiredVelocity = useRef(velocity.clone());
  const { isObstacleDetected } = useObstacleDetection({
    isSelfDriving,
    position,
    velocity,
    desiredVelocity: desiredVelocity.current,
  });
  const { isLaneChangeSafe } = useLaneChangeSafety({
    isSelfDriving,
    laneIndex,
    targetLaneIndex: (laneIndex + 1) % 2,
    position,
    velocity,
    desiredVelocity: desiredVelocity.current,
  });
  const [targetCheckpointIndex, setTargetCheckpointIndex] = useState(
    (startingCheckpointIndex + 1) % checkpoints.length
  );

  const speed = velocity?.length() ?? 0;

  const changeLanes = useCallback(() => {
    setLaneIndex((index) => (index + 1) % journey.lanes.length);
  }, [journey.lanes.length]);

  const avoidObstacles = useCallback(() => {
    // console.log('yaphi - speed', speed);
    if (!isChangingLanes) {
      if (isObstacleDetected) {
        console.log('yaphi - isObstacleDetected', isObstacleDetected);
        // changeLanes();
        // indexOfLastLaneChange.current = targetCheckpointIndex;
        // setIsChangingLanes(true);

        console.log('yaphi - isLaneChangeSafe', isLaneChangeSafe);

        // if target lane is also blocked
        // setBrake({force: 10});
        // isBraking.current = true;
        // targetSpeed.current = speed;
      } else if (!isObstacleDetected) {
        isBraking.current = false;
      }
    }
    const hasReachedNextCheckpoint = isChangingLanes &&
      indexOfLastLaneChange.current !== targetCheckpointIndex
    ;
    if (hasReachedNextCheckpoint) {
      setIsChangingLanes(false);
    }
  // }, [
  //   speed,
  //   setBrake,
  //   changeLanes,
  //   isChangingLanes,
  //   isObstacleDetected,
  //   targetCheckpointIndex,
  //   runAntiLockBrakes,
  // ]);
  }, [isChangingLanes, targetCheckpointIndex, isObstacleDetected, isLaneChangeSafe]);

  useEffect(() => {
    avoidObstacles();
  }, [avoidObstacles]);

  const autoAccelerate = useCallback(() => {
    if (isBraking.current) {
      return;
    }
    setBrake({ force: 0 });
    if (speed < targetSpeed.current) {
      setAcceleration({ force: 500 });
    } else {
      setAcceleration({ force: 0 });
    }
  }, [speed, setAcceleration, setBrake]);

  const seek = useCallback(({ delta } : { delta: number }) => {
    autoAccelerate();
    const typedWindow = window as typeof window & Record<string, unknown>;
    const target = checkpoints[targetCheckpointIndex];

    desiredVelocity.current = getDesiredVelocity({ position, target, speed });

    const angleToTarget = velocity.angleTo(desiredVelocity.current);
    typedWindow.angleToTarget = angleToTarget;

    const turnAngle = getTurnAngle({
      velocity,
      desiredVelocity: desiredVelocity.current,
      maxSteeringAngle,
    });

    const distanceToTarget = position.distanceTo(
      checkpoints[targetCheckpointIndex]
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
      setTargetCheckpointIndex(targetCheckpointIndex => {
        return (targetCheckpointIndex + 1) % checkpoints.length;
      });
    }

    const angleTolerance = 0.01;

    const shouldTurn = angleToTarget > angleTolerance;

    const targetSteeringValue = shouldTurn ? turnAngle : 0;
    const lerpFactor = 5 * delta;
    const updatedSteeringValue = MathUtils.lerp(steeringValue, targetSteeringValue, lerpFactor);

    updateSteering(updatedSteeringValue);
  }, [
    autoAccelerate,
    checkpoints,
    targetCheckpointIndex,
    position,
    speed,
    velocity,
    maxSteeringAngle,
    steeringValue,
    updateSteering,
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
