export const VIEW_MODES = {
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

type ViewModesType = keyof typeof VIEW_MODES;
type CameraModesType = keyof typeof CAMERA_MODES;

type GlobalSettings = {
  viewMode: ViewModesType;
  cameraMode: CameraModesType;
};

export const globalSettings: GlobalSettings = {
  viewMode: VIEW_MODES.FULL_3D,
  cameraMode: CAMERA_MODES.BEHIND,
};
