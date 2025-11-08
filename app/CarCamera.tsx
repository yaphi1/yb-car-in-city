import { Vector3 } from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useControls } from "leva";
import { setQuaternionFromDirection } from "./helpers/vectorHelpers";
import { useRef } from "react";
import { CAMERA_MODES, globalSettings } from './globalSettings';

const fixedFollowCameraDirection = new Vector3(-0.5, 0, 0.75);

type CarCameraProps = {
  carPosition: Vector3;
  carDirection: Vector3;
};

export function CarCamera({ carPosition, carDirection }: CarCameraProps) {
  const main = useRef(document.querySelector('main'));
  const { cameraType } = useControls({
    cameraType: {
      label: 'Camera',
      options: {
        'Top Down': CAMERA_MODES.TOP_DOWN,
        'Fixed Follow': CAMERA_MODES.FIXED_FOLLOW,
        'Behind': CAMERA_MODES.BEHIND,
        'Free Cam': CAMERA_MODES.FREE,
      },
      value: globalSettings.cameraMode,
      transient: false,
      onChange: () => {
        main.current?.focus();
      },
    },
  });

  return (
    <>
      {cameraType === CAMERA_MODES.FREE && <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />}
      {cameraType === CAMERA_MODES.TOP_DOWN && (
        <group
          position={carPosition}
        >
          <PerspectiveCamera position={[0, 40, 0]} rotation={[-Math.PI / 2, 0, 0]} makeDefault fov={50} />
        </group>
      )}
      {cameraType === CAMERA_MODES.FIXED_FOLLOW && (
        <group
          position={carPosition}
          quaternion={setQuaternionFromDirection({ direction: fixedFollowCameraDirection } )}
        >
          <PerspectiveCamera position={[0, 0.5, 6]} makeDefault fov={50} />
        </group>
      )}
      {cameraType === CAMERA_MODES.BEHIND && (
        <group
          position={carPosition}
          quaternion={setQuaternionFromDirection({ direction: carDirection } )}
        >
          <PerspectiveCamera position={[0, 0.5, 6]} makeDefault fov={50} />
        </group>
      )}
    </>
  );
}
