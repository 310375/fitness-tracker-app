import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

type TabIconName = "home" | "workouts" | "progress" | "profile";

const ICONS: Record<TabIconName, string> = {
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  workouts: "M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z",
  progress: "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
  profile: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
};

export function TabIcon({
  name,
  color,
  size = 24,
}: {
  name: TabIconName;
  color: string;
  size?: number;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d={ICONS[name]} />
      </Svg>
    </View>
  );
}
