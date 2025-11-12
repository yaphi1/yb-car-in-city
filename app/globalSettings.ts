export const GRAPHICS_MODES = {
  MATH_MODE: 'MATH_MODE',
  WIREFRAME_3D: 'WIREFRAME_3D',
  FULL_3D: 'FULL_3D',
} as const;

export const CAMERA_MODES = {
  FIXED_FOLLOW: 'FIXED_FOLLOW',
  BEHIND: 'BEHIND',
  TOP_DOWN: 'TOP_DOWN',
  FREE: 'FREE',
} as const;

type GraphicsModesType = keyof typeof GRAPHICS_MODES;
type CameraModesType = keyof typeof CAMERA_MODES;

type GlobalSettings = {
  graphicsMode: GraphicsModesType;
  cameraMode: CameraModesType;
  showCarDebugNumbers: boolean;
};

export const globalSettings: GlobalSettings = {
  graphicsMode: GRAPHICS_MODES.FULL_3D,
  cameraMode: CAMERA_MODES.TOP_DOWN,
  showCarDebugNumbers: true,
};
