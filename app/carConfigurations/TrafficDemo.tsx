import { ControllableCar } from '../ControllableCar';
import { journeys } from '../selfDriving/journeys';

export function TrafficDemo({ carColor } : { carColor: string; }) {
  return (
    <>
      <ControllableCar
        color={carColor}
        isMainCharacter={true}
        journey={journeys.clockwiseBlock}
        startingLaneIndex={1}
        startingCheckpointIndex={1}
        topSpeed={10}
      />
      <ControllableCar
        color="#00aa55"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={1}
        startingCheckpointIndex={5}
        topSpeed={5}
      />
      <ControllableCar
        color="#ddaa00"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={6}
        topSpeed={7}
      />
      <ControllableCar
        color="#0098db"
        journey={journeys.counterclockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={30}
        topSpeed={5}
      />
      <ControllableCar
        color="#ffffff"
        journey={journeys.counterclockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={2}
        topSpeed={5}
      />



      <ControllableCar
        color="#333333"
        journey={journeys.counterclockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={10}
        topSpeed={5}
      />
      <ControllableCar
        color="#0098db"
        journey={journeys.counterclockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={13}
        topSpeed={5}
      />
      <ControllableCar
        color="#858d96"
        journey={journeys.counterclockwiseBlock}
        startingLaneIndex={1}
        startingCheckpointIndex={12}
        topSpeed={7}
      />
      <ControllableCar
        color="#a79d72"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={0}
        topSpeed={5}
      />
      <ControllableCar
        color="#ffffff"
        journey={journeys.clockwiseBlock}
        startingLaneIndex={0}
        startingCheckpointIndex={1}
        topSpeed={5}
      />
    </>
  );
}
