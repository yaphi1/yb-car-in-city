import { Vector3 } from 'three';
import { useObstacleDetection } from './useObstacleDetection';

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
  const laneOffset = perpendicularToCarDirection.multiplyScalar(laneChangeDirection);

  /**
   * Use starting position of car to get position of adjacent lane
  */
  const adjacentLanePosition = position.clone().add(laneOffset);

  const { isObstacleDetected } = useObstacleDetection({
    isSelfDriving,
    position: adjacentLanePosition,
    velocity,
    desiredVelocity,
    customNear: 0,
    customFar: speed + 10,
  });

  const isLaneChangeSafe = !isObstacleDetected;

  return {
    isLaneChangeSafe,
  };
}
