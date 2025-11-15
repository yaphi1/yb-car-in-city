import { Vector3 } from 'three';
import { getPointsAlongVectors, getVectorFromStartToTarget } from '../helpers/vectorHelpers';
import { isDeepStrictEqual } from 'util';

const UP_VECTOR = new Vector3(0, 1, 0);

export type NavIntersection = {
  column: number;
  row: number;
};

export type LaneCheckpoints = Array<Vector3>;

export type Journey = {
  lanes: Array<LaneCheckpoints>;
};

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

function getIntersectionPosition({ column, row }: NavIntersection) {
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
 * to your center coordinates and get the correct position
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
  const laneDirection = (new Vector3()).crossVectors(roadVector, UP_VECTOR).normalize();

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
  startingIntersection: NavIntersection;
  endingIntersection: NavIntersection;
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

  /** Distance from center of intersection to lane entrance */
  const entranceDistance = 18;

  /**
   * The stabilizer is a checkpoint right after the lane entrance
   * whose goal is to stabilize the steering.
  */
  const stabilizerDistance = 30;
  
  const laneEntrance = laneStart.clone()
    .add(laneVector.clone().setLength(entranceDistance))
  ;
  const laneEntranceStabilizer = laneStart.clone()
    .add(laneVector.clone().setLength(stabilizerDistance))
  ;
  const laneExitStabilizer = laneStart.clone()
    .add(laneVector.clone().setLength(laneVector.length() - stabilizerDistance))
  ;
  const laneExit = laneStart.clone()
    .add(laneVector.clone().setLength(laneVector.length() - entranceDistance))
  ;

  const laneInnerDistance = laneEntranceStabilizer.distanceTo(laneExitStabilizer);
  const desiredSegmentLength = 32;
  const numberOfSegments = Math.floor(laneInnerDistance / desiredSegmentLength);

  const laneInnerVector = getVectorFromStartToTarget({
    start: laneEntranceStabilizer,
    target: laneExitStabilizer,
  });

  const evenlyDistributedPointsFrom0To1 = new Array(numberOfSegments).fill(0)
    .map((_, i) => i / numberOfSegments).slice(1)
  ;
  const laneInnerCheckpoints = getPointsAlongVectors({
    vector: laneInnerVector,
    startPosition: laneEntranceStabilizer,
    progressAmounts: evenlyDistributedPointsFrom0To1,
  });

  const checkpoints = [
    laneEntrance,
    laneEntranceStabilizer,
    ...laneInnerCheckpoints,
    laneExitStabilizer,
    laneExit,
  ];

  return checkpoints;
}

function getTurnControlPoint({ turnStart, turnEnd, directionOfTurnStart } : {
  turnStart: Vector3;
  turnEnd: Vector3;
  directionOfTurnStart: Vector3;
}) {
  const vectorFromStartToEnd = getVectorFromStartToTarget({
    start: turnStart,
    target: turnEnd,
  });

  const vectorInDirectionOfTurnStart = vectorFromStartToEnd.clone().projectOnVector(
    directionOfTurnStart
  );

  const vectorInDirectionOfTurnEnd = getVectorFromStartToTarget({
    start: turnStart.clone().add(vectorInDirectionOfTurnStart),
    target: turnEnd,
  });

  /**
   * `1` is square, `0.5` is flat, `0` is a concave square.
   * Anything between is a curve.
   */
  const turnSharpness = 0.7;

  const goThisFarInDirectionOfTurnStart = vectorInDirectionOfTurnStart.clone()
    .multiplyScalar(turnSharpness)
  ;
  const goThisFarInDirectionOfTurnEnd = vectorInDirectionOfTurnEnd.clone()
    .multiplyScalar(1 - turnSharpness)
  ;
  const controlPoint = turnStart.clone()
    .add(goThisFarInDirectionOfTurnStart)
    .add(goThisFarInDirectionOfTurnEnd)
  ;

  return controlPoint;
}

/**
 * This tells you what direction the car is going in
 * at the end of a set of road checkpoints.
 */
function getLatestDirection({ roadCheckpoints } : {
  roadCheckpoints: Array<Vector3>;
}) {
  const lastTwoCheckpoints = roadCheckpoints.slice(-2);
  const currentDirection = getVectorFromStartToTarget({
    start: lastTwoCheckpoints[0],
    target: lastTwoCheckpoints[1],
  }).normalize();

  return currentDirection;
}

/**
 * Takes in a sequence of intersections and returns
 * a sequence of self-driving checkpoints.
 */
export function buildTravelPath({ laneIndex, intersections } : {
  laneIndex: number;
  intersections: Array<NavIntersection>;
}) {
  const checkpoints = intersections.flatMap((intersection, i) => {
    const nextIntersection = intersections[(i + 1) % intersections.length];
    const lookAheadIntersection = intersections[(i + 2) % intersections.length];

    const roadCheckpoints: LaneCheckpoints = makeRoadCheckpoints({
      startingIntersection: intersection,
      endingIntersection: nextIntersection,
      laneIndex,
    });

    const directionOfTurnStart = getLatestDirection({ roadCheckpoints });

    const turnStart = roadCheckpoints[roadCheckpoints.length - 1];
    const turnEnd = makeRoadCheckpoints({
      startingIntersection: nextIntersection,
      endingIntersection: lookAheadIntersection,
      laneIndex,
    })[0];

    const turnControlPoint = getTurnControlPoint({
      turnStart, turnEnd, directionOfTurnStart
    });

    roadCheckpoints.push(turnControlPoint);

    return roadCheckpoints;
  });

  return checkpoints;
}

export const DIRECTIONS = {
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST',
} as const;

export type Direction = keyof typeof DIRECTIONS;

/**
 * Takes in a sequence of directions and returns
 * a sequence of intersections.
 */
export function convertDirectionsToIntersections({
  startingIntersection,
  directions,
} : {
  startingIntersection: NavIntersection;
  directions: Array<Direction>;
}) {
  const intersections: Array<NavIntersection> = [{ ...startingIntersection }];

  directions.forEach(direction => {
    const nextIntersection = { ...intersections[intersections.length - 1] };
    if (direction === DIRECTIONS.NORTH) {
      nextIntersection.row++;
    }
    if (direction === DIRECTIONS.SOUTH) {
      nextIntersection.row--;
    }
    if (direction === DIRECTIONS.EAST) {
      nextIntersection.column++;
    }
    if (direction === DIRECTIONS.WEST) {
      nextIntersection.column--;
    }
    if (JSON.stringify(nextIntersection) !== JSON.stringify(startingIntersection)) {
      intersections.push(nextIntersection);
    }
  });

  return intersections;
}

/**
 * Takes in a sequence of `intersections` and returns
 * a sequence of self-driving checkpoints arranged
 * into multiple lanes.
 */
export function buildJourneyFromIntersections({ intersections, laneCount = 2 } : {
  intersections: Array<NavIntersection>;
  laneCount?: number;
}) {
  const lanes: Array<LaneCheckpoints> = Array(laneCount).fill(null).map((_, laneIndex) => (
    buildTravelPath({ laneIndex, intersections })
  ));
  const journey: Journey = { lanes };

  return journey;
}

/**
 * Takes in a sequence of `directions` and returns
 * a sequence of self-driving checkpoints arranged
 * into multiple lanes.
 */
export function buildJourneyFromDirections({
  startingIntersection,
  directions,
  laneCount = 2,
} : {
  startingIntersection: NavIntersection;
  directions: Array<Direction>;
  laneCount?: number;
}) {
  const intersections = convertDirectionsToIntersections({
    startingIntersection,
    directions,
  });
  const journey = buildJourneyFromIntersections({ intersections, laneCount });

  return journey;
}

export function getOrientationAtJourneyStart({
  journey, startingLaneIndex, startingCheckpointIndex
} : {
  journey: Journey;
  startingLaneIndex: number;
  startingCheckpointIndex: number;
}) {
  const laneCheckpoints = journey.lanes[startingLaneIndex];
  const checkpointStart = laneCheckpoints[startingCheckpointIndex];
  const checkpointNext = laneCheckpoints[
    (startingCheckpointIndex + 1) % laneCheckpoints.length
  ];

  const position = checkpointStart.clone();
  position.y = 1;
  const direction = getVectorFromStartToTarget({
    start: checkpointStart,
    target: checkpointNext,
  }).normalize();

  return { position, direction };
}
