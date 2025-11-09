import { useMemo } from 'react';
import { Vector3, ArrowHelper } from 'three';

export function Arrow({ direction, position, length, color }: {
  direction: Vector3;
  position: Vector3;
  length: number;
  color: string;
}) {
  const arrow = useMemo(() => {
    const arrowPosition = position;
    const headLength = 0.2 * length;
    const headWidth = 0.4 * headLength;
    return new ArrowHelper(direction, arrowPosition, length, color, headLength, headWidth);
  }, [position, direction, color, length]);

  return <primitive object={arrow} />;
}
