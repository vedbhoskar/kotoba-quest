import { Pressable, Text } from "react-native";

import { styles } from "../theme/styles";

type PillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Pill({ label, active = false, onPress }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillMuted]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextMuted]}>
        {label}
      </Text>
    </Pressable>
  );
}
