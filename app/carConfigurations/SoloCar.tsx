import { ControllableCar } from '../ControllableCar';
import { journeys } from '../selfDriving/journeys';

export function SoloCar({ carColor } : { carColor: string; }) {
  return (
    <ControllableCar
      color={carColor}
      isMainCharacter={true}
      journey={journeys.clockwiseBlock}
      startingLaneIndex={1}
      startingCheckpointIndex={1}
      topSpeed={10}
    />
  );
}
