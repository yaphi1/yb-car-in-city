import { useRef, useEffect } from "react";
import { Mesh, Group } from "three";
import { Raycaster } from "three/src/Three.js";
import { getVectorFromStartToTarget } from "../helpers/vectorHelpers";

export function RaycastTest() {
  const redRef = useRef<Mesh>(null);
  const blueRef = useRef<Group>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!redRef.current || !blueRef.current) {
        return;
      }
      const origin = redRef.current.position;
      console.log('yaphi - redRef.current.position', redRef.current.position);
      const direction = getVectorFromStartToTarget({
        start: origin,
        target: blueRef.current.position,
      }).normalize();

      const near = 0;
      const far = 10;
      const raycaster = new Raycaster(origin, direction, near, far);

      const result = raycaster.intersectObject(blueRef.current);
      console.log('yaphi - result', result);
    }, 1000);
  }, []);

  return (
    <>
      <mesh ref={redRef} position={[175, 5, -94]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial name="raycast_test" color="red" />
      </mesh>
      <group ref={blueRef} position={[185, 5, -94]}>
        {/* <mesh position={[185, 5, -94]} > */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 2, 2]} />
          <meshStandardMaterial name="raycast_test" color="#0098db" />
        </mesh>
      </group>
    </>
  );
}
