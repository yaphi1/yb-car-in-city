import { Vector3 } from 'three';
import { useObstacleDetection } from './useObstacleDetection';
import { LANE_WIDTH } from './laneMeasurements';

const UP_VECTOR = new Vector3(0, 1, 0);

export function useLaneChangeSafety({
  isSelfDriving,
  laneIndex,
  targetLaneIndex,
  position,
  velocity,
  desiredVelocity,
} : {
  isSelfDriving: boolean;
  laneIndex: number;
  targetLaneIndex: number;
  position: Vector3;
  velocity: Vector3;
  desiredVelocity: Vector3;
}) {
  const speed = velocity.length();
  const laneChangeDirection = targetLaneIndex - laneIndex;
  const perpendicularToCarDirection = new Vector3().crossVectors(velocity, UP_VECTOR).normalize();

  const laneOffset = perpendicularToCarDirection.multiplyScalar(laneChangeDirection * LANE_WIDTH);
  const backwardOffset = -7;
  const backwardOffsetVector = velocity.clone().normalize().multiplyScalar(backwardOffset);

  /**
   * Use starting position of car to get position of adjacent lane.
   * The backwards offset is to detect cars in the blind spot.
  */
  const adjacentLanePosition = position.clone()
    .add(laneOffset)
    .add(backwardOffsetVector)
  ;

  const { isObstacleDetected } = useObstacleDetection({
    isSelfDriving,
    position: adjacentLanePosition,
    velocity,
    desiredVelocity,
    customNear: 0,
    customFar: speed + 10 + -backwardOffset,
  });

  const isLaneChangeSafe = !isObstacleDetected;

  return {
    isLaneChangeSafe,
  };
}
