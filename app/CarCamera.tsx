import { Vector3 } from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useControls } from "leva";
import { setQuaternionFromDirection } from "./helpers/vectorHelpers";
import { useRef } from "react";
import { globalSettings, VIEW_MODES } from './globalSettings';

const cameraTypes = {
  fixedFollow: 'fixedFollow',
  behind: 'behind',
  topDown: 'topDown',
  free: 'free',
};

const fixedFollowCameraDirection = new Vector3(-0.5, 0, 0.75);

type CarCameraProps = {
  carPosition: Vector3;
  carDirection: Vector3;
};

const isMathMode = globalSettings.viewMode === VIEW_MODES.MATH_MODE;

export function CarCamera({ carPosition, carDirection }: CarCameraProps) {
  const main = useRef(document.querySelector('main'));
  const { cameraType } = useControls({
    cameraType: {
      label: 'Camera',
      options: {
        'Top Down': cameraTypes.topDown,
        'Fixed Follow': cameraTypes.fixedFollow,
        'Behind': cameraTypes.behind,
        'Free Cam': cameraTypes.free,
      },
      value: isMathMode ? cameraTypes.topDown : cameraTypes.fixedFollow,
      transient: false,
      onChange: () => {
        main.current?.focus();
      },
    },
  });

  return (
    <>
      {cameraType === cameraTypes.free && <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />}
      {cameraType === cameraTypes.topDown && (
        <group
          position={carPosition}
        >
          <PerspectiveCamera position={[0, 40, 0]} rotation={[-Math.PI / 2, 0, 0]} makeDefault fov={50} />
        </group>
      )}
      {cameraType === cameraTypes.fixedFollow && (
        <group
          position={carPosition}
          quaternion={setQuaternionFromDirection({ direction: fixedFollowCameraDirection } )}
        >
          <PerspectiveCamera position={[0, 0.5, 6]} makeDefault fov={50} />
        </group>
      )}
      {cameraType === cameraTypes.behind && (
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
