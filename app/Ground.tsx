import { usePlane } from "@react-three/cannon";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MeshStandardMaterial, RepeatWrapping, TextureLoader, Vector2 } from 'three';

export function Ground() {

  // this hook creates the physics plane that acts as the ground
  const [ref] = usePlane(
    () => ({
      type: 'Static',
      rotation: [-Math.PI / 2, 0, 0]
    }),
    useRef(null)
  );

  const [roughness, normal] = useLoader(TextureLoader, [
    'textures/terrain-roughness.jpg',
    'textures/terrain-normal.jpg',
  ]);

  useEffect(() => {
    [normal, roughness].forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(5, 5);
    });
  }, [normal, roughness]);

  return (<></>
    // <mesh rotation-x={Math.PI * -0.5} castShadow receiveShadow>
    //   <planeGeometry args={[520, 520]} />
    //   {/* <meshStandardMaterial
    //     normalMap={normal}
    //     normalScale={new Vector2(0.15, 0.15)}
    //     roughnessMap={roughness}
    //     roughness={0.7}
    //     color={[0.015, 0.015, 0.015]}
    //   /> */}
    // </mesh>
  );
}
