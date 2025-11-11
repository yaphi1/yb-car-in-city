import { buildJourney } from './navigation';

export const journeys = {
  clockwiseBlock: buildJourney({
    intersections: [
      { column: 0, row: 1 },
      { column: 1, row: 1 },
      { column: 1, row: 0 },
      { column: 0, row: 0 },
    ]
  }),
};
