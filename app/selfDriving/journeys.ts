import { buildJourney, LaneCheckpoints } from './navigation';

export type Journey = {
  lanes: Array<LaneCheckpoints>;
};

export const journeys = {
  clockwiseBlock: buildJourney({
    intersections: [
      { column: 0, row: 0 },
      { column: 0, row: 1 },
      { column: 1, row: 1 },
      { column: 1, row: 0 },
    ]
  }),
  counterclockwiseBlock: buildJourney({
    intersections: [
      { column: 1, row: 1 },
      { column: 0, row: 1 },
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]
  }),
};
