import { ControllableCar } from '../ControllableCar';
import { journeys } from '../selfDriving/journeys';

export function LaneSafetyExample({ carColor } : { carColor: string; }) {
  return (
    <>
      <ControllableCar
        color={carColor}
        isMainCharacter={true}
        journey={journeys.clockwiseBlock}
        startingLaneIndex={1}
        startingCheckpointIndex={6}
        topSpeed={10}
      />
      <ControllableCar
        color="blue"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={1}
        startingCheckpointIndex={7}
        topSpeed={5}
      />
      <ControllableCar
        color="green"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={7}
        topSpeed={6}
      />
    </>
  );
}
