import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Pill } from "../src/components/Pill";
import { Screen } from "../src/components/Screen";
import { n5Dataset } from "../src/data/n5";
import { useProgressStore } from "../src/store/progressStore";
import { useStudyStore } from "../src/store/studyStore";
import { styles } from "../src/theme/styles";
import { estimateMinutes, getChapterLabel, getDifficultyLabel, getWordsForChapters } from "../src/utils/dataset";

export default function SelectScreen() {
  const router = useRouter();
  const wordProgress = useProgressStore((state) => state.wordProgress);
  const selectedChapters = useStudyStore((state) => state.selectedChapters);
  const toggleChapter = useStudyStore((state) => state.toggleChapter);
  const setSelectedChapters = useStudyStore((state) => state.setSelectedChapters);
  const resetSelection = useStudyStore((state) => state.resetSelection);

  const selectedWords = getWordsForChapters(selectedChapters);
  const chapterLabel = getChapterLabel(selectedChapters);

  function applyPreset(type: "all" | "first5" | "clear") {
    if (type === "all") {
      setSelectedChapters(n5Dataset.chapters.map((chapter) => chapter.chapter));
      return;
    }
    if (type === "first5") {
      setSelectedChapters([1, 2, 3, 4, 5]);
      return;
    }
    resetSelection();
  }

  return (
    <Screen>
      <Text style={styles.screenTitle}>Choose Lessons</Text>
      <Text style={styles.screenBody}>
        Build a custom study set from one chapter, a range, or the full N5 pack.
      </Text>

      <View style={styles.row}>
        <Pill label="Lesson 1-5" onPress={() => applyPreset("first5")} />
        <Pill label="All Lessons" onPress={() => applyPreset("all")} />
        <Pill label="Reset" onPress={() => applyPreset("clear")} />
      </View>

      <View style={styles.chapterGrid}>
        {n5Dataset.chapters.map((chapter) => (
          <Pill
            key={chapter.chapter}
            label={`${chapter.chapter}`}
            active={selectedChapters.includes(chapter.chapter)}
            onPress={() => toggleChapter(chapter.chapter)}
          />
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Selection Summary</Text>
        <Text style={styles.summaryLine}>Selected: {chapterLabel}</Text>
        <Text style={styles.summaryLine}>Words: {selectedWords.length}</Text>
        <Text style={styles.summaryLine}>
          Estimated Time: {estimateMinutes(selectedWords.length)} min
        </Text>
        <Text style={styles.summaryLine}>
          Difficulty: {getDifficultyLabel(selectedWords, wordProgress)}
        </Text>
      </View>

      <View style={styles.footerButtons}>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/setup")}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
