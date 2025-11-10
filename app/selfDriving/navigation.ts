import { Vector3 } from 'three';
import { getPointsAlongVectors, getVectorFromStartToTarget } from '../helpers/vectorHelpers';

const upVector = new Vector3(0, 1, 0);

export function getPathsToNextCheckpoints({ checkpoints } : {
  checkpoints: Array<Vector3>;
}) {
  const pathsToNextCheckPoints = checkpoints.map((checkpoint, i) => {
    const nextCheckpoint = checkpoints[(i + 1) % checkpoints.length];
    const pathToNextCheckpoint = getVectorFromStartToTarget({
      start: checkpoint,
      target: nextCheckpoint,
    });
    return pathToNextCheckpoint;
  });

  return pathsToNextCheckPoints;
};

type Intersection = {
  column: number;
  row: number;
};

function getIntersectionPosition({ column, row } : Intersection) {
  const centralIntersection = { x: 151, z: 16 };
  const blockWidth = 302;
  const blockLength = 112;

  const x = blockWidth * column + centralIntersection.x;
  const z = -blockLength * row + centralIntersection.z; // negative because -z is north

  return new Vector3(x, 0, z);
}

/**
 * This tells you how far the center of your lane is from
 * the center line. It accounts for the direction from
 * your starting intersection to your ending intersection.
 * 
 * This gives `x` and `z` offsets, so you can freely add these
 * to your center coordinates and get the correct posiiton
 * without worrying about the orientation, which is already
 * handled for you here.
 */
function getLaneOffsetFromCenter({ startingIntersectionPosition, endingIntersectionPosition, laneIndex } : {
  startingIntersectionPosition: Vector3;
  endingIntersectionPosition: Vector3;
  laneIndex: number;
}) {
  const roadVector = getVectorFromStartToTarget({
    start: startingIntersectionPosition,
    target: endingIntersectionPosition,
  });
  const laneDirection = (new Vector3()).crossVectors(roadVector, upVector).normalize();

  const laneStartingOffset = 1.925;
  const laneWidth = 3.325;
  const laneDistanceFromMiddle = laneStartingOffset + laneWidth * laneIndex;

  const laneOffset = laneDirection.clone().multiplyScalar(laneDistanceFromMiddle);

  return laneOffset;
}

/**
 * This generates self-driving checkpoints along
 * a single stretch of road between intersections
 */
export function makeRoadCheckpoints({
  startingIntersection,
  endingIntersection,
  laneIndex,
} : {
  startingIntersection: Intersection;
  endingIntersection: Intersection;
  laneIndex: number;
}) {
  const startingIntersectionPosition = getIntersectionPosition(startingIntersection);
  const endingIntersectionPosition = getIntersectionPosition(endingIntersection);

  const laneOffset = getLaneOffsetFromCenter({
    startingIntersectionPosition,
    endingIntersectionPosition,
    laneIndex,
  });

  const laneStart = (new Vector3()).addVectors(startingIntersectionPosition, laneOffset);
  const laneEnd = (new Vector3()).addVectors(endingIntersectionPosition, laneOffset);
  const laneVector = getVectorFromStartToTarget({ start: laneStart, target: laneEnd });

  const laneCheckpoints = getPointsAlongVectors({
    vector: laneVector,
    startPosition: laneStart,
    progressAmounts: [0.3, 0.4, 0.5, 0.6, 0.7],
  });

  const checkpoints = [
    laneStart.clone().add(laneVector.clone().setLength(15)),
    laneStart.clone().add(laneVector.clone().setLength(22)),
    ...laneCheckpoints,
    laneStart.clone().add(laneVector.clone().setLength(laneVector.length() - 22)),
    laneStart.clone().add(laneVector.clone().setLength(laneVector.length() - 15)),
  ];

  return checkpoints;
}

/**
 * Takes in a sequence of intersections and returns
 * a sequence of self-driving checkpoints.
 */
export function buildTravelPath({ laneIndex, intersections } : {
  laneIndex: number;
  intersections: Array<Intersection>;
}) {
  const checkpoints = intersections.flatMap((intersection, i) => {
    const nextIntersection = intersections[(i + 1) % intersections.length];
    const roadCheckpoints = makeRoadCheckpoints({
      startingIntersection: intersection,
      endingIntersection: nextIntersection,
      laneIndex,
    });
    return roadCheckpoints;
  });

  return checkpoints;
}
