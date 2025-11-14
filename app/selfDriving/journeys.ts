import { buildJourneyFromDirections, DIRECTIONS } from './navigation';

export const journeys = {
  clockwiseBlock: buildJourneyFromDirections({
    startingIntersection: { column: 0, row: 0 },
    directions: [
      DIRECTIONS.NORTH,
      DIRECTIONS.EAST,
      DIRECTIONS.SOUTH,
      DIRECTIONS.WEST,
    ],
  }),
  counterclockwiseBlock: buildJourneyFromDirections({
    startingIntersection: { column: 1, row: 1 },
    directions: [
      DIRECTIONS.WEST,
      DIRECTIONS.SOUTH,
      DIRECTIONS.EAST,
      DIRECTIONS.NORTH,
    ],
  }),
};
