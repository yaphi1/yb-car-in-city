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
  return angle * sign;
}

/**
 * Create a quaternion that rotates `startingDirection` to `direction`.
 * - Normalizes inputs.
 * - Handles opposite-direction (180°) edge case.
 * 
 * Note:
 * This function was generated with Copilot and lightly edited.
 * Normally, I'd investigate it in more depth, but since this
 * is peripheral to the main project and it seems to work,
 * I'll leave this as an exercise to come back to later.
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

  const dot = start.dot(dir);

  // Opposite direction -> 180deg around any orthogonal axis
  // TODO: investigate suspicious constant
  if (dot < -0.999999) {
    const ortho = new Vector3(1, 0, 0).cross(start);

    // TODO: investigate suspicious constant
    if (ortho.lengthSq() < 1e-6) {
      ortho.set(0, 1, 0).cross(start);
    }
    ortho.normalize();
    return new Quaternion().setFromAxisAngle(ortho, Math.PI);
  }

  // General case
  return new Quaternion().setFromUnitVectors(start, dir);
}
