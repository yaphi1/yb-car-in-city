import { Quaternion, Vector3 } from 'three';

/**
 * Note: `progressAmounts` should each be from 0 to 1.
 */
export function getPointsAlongVectors({ vector, startPosition, progressAmounts } : {
  vector: Vector3;
  startPosition: Vector3;
  progressAmounts: Array<number>;
}) {
  return progressAmounts.map(progress => (
    startPosition.clone().add(vector.clone().multiplyScalar(progress))
  ));
}

/**
 * `target` - `start` = vector from start to target
 */
export function getVectorFromStartToTarget({ start, target, customLength } : {
  start: Vector3;
  target: Vector3;
  customLength?: number;
}) {
  const vectorToTarget = new Vector3().subVectors(target, start);
  if (customLength) {
    vectorToTarget.setLength(customLength);
  }
  
  return vectorToTarget;
}

export function getSignedAngle(vectorA: Vector3, vectorB: Vector3) {
  const angle = vectorA.angleTo(vectorB);

  /**
   * The cross product gives a perpendicular vector
   * from a counterclockwise sweep from vectors `a` to `b`.
   * 
   * If it points up (positive), we're going counterclockwise.
   * If down (negative), we're going clockwise.
   */
  const perpendicularVector = new Vector3().crossVectors(vectorA, vectorB);
  const sign = Math.sign(perpendicularVector.y);

  /**
   * This handles an edge case where the sign of the cross
   * product is `-0` because the angle is exactly `180deg`
   */
  const isAnglePi = angle > 3 && sign === 0;

  return isAnglePi ? angle : angle * sign;
}

/**
 * Create a quaternion that rotates `startingDirection` to `direction`.
 * 
 * Note: This function normalizes inputs so you won't have to.
 */
export function setQuaternionFromDirection({
  startingDirection = new Vector3(0, 0, -1),
  direction
}: {
  startingDirection?: Vector3;
  direction: Vector3;
}) {
  const dir = direction.clone().normalize();
  const start = startingDirection.clone().normalize();

  return new Quaternion().setFromUnitVectors(start, dir);
}
