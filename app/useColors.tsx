import { useControls, buttonGroup } from "leva";

const colorPresets: Record<string, string> = {
  lime: '#99ff44',
  purple: '#d033ef',
  orange: '#fc9118',
  red: '#f51726',
  cyan: '#33e6f5',
};

type ColorSetter = (value: { carColor?: string | undefined; }) => void;

function generatePresetControls(fn: ColorSetter) {
  const presets: Record<string, () => void> = {};
  const colors = Object.keys(colorPresets);

  colors.forEach(color => {
    const capitalizedLabel = color[0].toUpperCase() + color.slice(1);
    presets[capitalizedLabel] = () => {
      fn({ carColor: colorPresets[color] });
    };
  });

  return presets;
}

export function useColors() {
  const [{ carColor }, set] = useControls(() => ({
    carColor: {
      value: colorPresets.red,
      label: 'Car Color',
    },
    'Presets': buttonGroup(
      generatePresetControls((color) => { set(color); })
    ),
  }));

  return carColor;
}
