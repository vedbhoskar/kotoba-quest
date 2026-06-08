import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Screen } from "../src/components/Screen";
import { StatCard } from "../src/components/StatCard";
import { useProgressStore } from "../src/store/progressStore";
import { useStudyStore } from "../src/store/studyStore";
import { styles } from "../src/theme/styles";
import { estimateMinutes, getChapterLabel, getDifficultyLabel, getWordsForChapters } from "../src/utils/dataset";

export default function SetupScreen() {
  const router = useRouter();
  const wordProgress = useProgressStore((state) => state.wordProgress);
  const selectedChapters = useStudyStore((state) => state.selectedChapters);
  const startSession = useStudyStore((state) => state.startSession);

  const selectedWords = getWordsForChapters(selectedChapters);
  const chapterLabel = getChapterLabel(selectedChapters);

  function handleStartSession() {
    startSession({
      chapters: [...selectedChapters].sort((a, b) => a - b),
      words: selectedWords,
      chapterLabel,
    });
    router.push("/session");
  }

  return (
    <Screen>
      <Text style={styles.screenTitle}>Session Configuration</Text>
      <Text style={styles.screenBody}>
        Review the study plan before you begin. This session stays fully offline.
      </Text>

      <View style={styles.statsGrid}>
        <StatCard label="Lessons" value={chapterLabel} />
        <StatCard label="Words" value={`${selectedWords.length}`} />
        <StatCard label="Time" value={`${estimateMinutes(selectedWords.length)} min`} />
        <StatCard
          label="Difficulty"
          value={getDifficultyLabel(selectedWords, wordProgress)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What You’ll Practice</Text>
        {selectedWords.slice(0, 5).map((word) => (
          <View key={word.uid} style={styles.listCard}>
            <Text style={styles.listTitle}>{word.japanese}</Text>
            <Text style={styles.listMeta}>
              {word.reading} • {word.meaning.join(", ")}
            </Text>
          </View>
        ))}
        {selectedWords.length > 5 ? (
          <Text style={styles.mutedText}>+ {selectedWords.length - 5} more words in this set</Text>
        ) : null}
      </View>

      <View style={styles.footerButtons}>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleStartSession}>
          <Text style={styles.primaryButtonText}>Start Session</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
