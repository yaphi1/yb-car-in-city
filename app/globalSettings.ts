export const VIEW_MODES = {
  MATH_MODE: 'MATH_MODE',
  WIREFRAME_3D: 'WIREFRAME_3D',
  FULL_3D: 'FULL_3D',
} as const;

type ViewModesType = keyof typeof VIEW_MODES;

type GlobalSettings = {
  viewMode: ViewModesType;
};

export const globalSettings: GlobalSettings = {
  viewMode: VIEW_MODES.WIREFRAME_3D,
};
