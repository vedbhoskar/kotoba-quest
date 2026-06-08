import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Pill } from "../src/components/Pill";
import { Screen } from "../src/components/Screen";
import { StatCard } from "../src/components/StatCard";
import { n5Dataset } from "../src/data/n5";
import { useProgressStore } from "../src/store/progressStore";
import { styles } from "../src/theme/styles";
import type { VocabularyWord } from "../src/types";
import { findWordById } from "../src/utils/session";
import { getWeakWordIds } from "../src/utils/dataset";

export default function DashboardScreen() {
  const router = useRouter();
  const streak = useProgressStore((state) => state.streak);
  const totalXp = useProgressStore((state) => state.totalXp);
  const sessions = useProgressStore((state) => state.sessions);
  const wordProgress = useProgressStore((state) => state.wordProgress);

  const weakWords = getWeakWordIds(wordProgress, 5)
    .map((wordId) => findWordById(wordId))
    .filter((word): word is VocabularyWord => Boolean(word));
  const recentSessions = sessions.slice(0, 3);

  return (
    <Screen>
      <View style={styles.hero}>
        <Pill label="Offline First" active />
        <Text style={styles.heroTitle}>Kotoba Quest</Text>
        <Text style={styles.heroBody}>
          A chapter-based Japanese vocabulary trainer with flashcards, adaptive review,
          search, streaks, and local mastery tracking.
        </Text>
        <View style={styles.heroButtonRow}>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/select")}>
            <Text style={styles.primaryButtonText}>Start Learning</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/search")}>
            <Text style={styles.secondaryButtonText}>Search Words</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <StatCard label="Total XP" value={`${totalXp}`} />
        <StatCard label="Words" value={`${n5Dataset.totalWords}`} />
        <StatCard label="Lessons" value={`${n5Dataset.totalChapters}`} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {recentSessions.length === 0 ? (
          <Text style={styles.mutedText}>
            No sessions yet. Start with Lesson 1 and build momentum.
          </Text>
        ) : (
          recentSessions.map((item) => (
            <View key={item.id} style={styles.listCard}>
              <Text style={styles.listTitle}>{item.chapterLabel}</Text>
              <Text style={styles.listMeta}>
                {item.accuracy}% accuracy • {item.xpEarned} XP • {item.wordsReviewed} words
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weak Words</Text>
        {weakWords.length === 0 ? (
          <Text style={styles.mutedText}>
            Your difficult words will show up here after a few review sessions.
          </Text>
        ) : (
          weakWords.map((word) => (
            <View key={word.uid} style={styles.listCard}>
              <Text style={styles.listTitle}>{word.japanese}</Text>
              <Text style={styles.listMeta}>
                {word.reading} • {word.meaning.join(", ")} • mastery{" "}
                {wordProgress[word.uid]?.mastery ?? 0}%
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
