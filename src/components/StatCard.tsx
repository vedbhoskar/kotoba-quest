import { Text, View } from "react-native";

import { styles } from "../theme/styles";

type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        tone === "success" && styles.statCardSuccess,
        tone === "danger" && styles.statCardDanger,
      ]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
