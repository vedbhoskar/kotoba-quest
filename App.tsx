import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { n5Dataset } from "./src/data/n5";
import { useSessionController } from "./src/hooks/useSessionController";
import { useProgressStore } from "./src/store/progressStore";
import type { SessionHistoryEntry, VocabularyWord } from "./src/types";
import {
  estimateMinutes,
  getChapterLabel,
  getDifficultyLabel,
  getWeakWordIds,
  getWordsForChapters,
} from "./src/utils/dataset";

type Screen = "dashboard" | "select" | "setup" | "session" | "search";

type SessionConfig = {
  chapters: number[];
  words: VocabularyWord[];
  chapterLabel: string;
};

function findWordById(wordId: string) {
  return n5Dataset.chapters.flatMap((chapter) => chapter.vocabulary).find((word) => word.uid === wordId);
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
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

function StatCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger"; }) {
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1]);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordedSessionId, setRecordedSessionId] = useState<string | null>(null);

  const streak = useProgressStore((state) => state.streak);
  const totalXp = useProgressStore((state) => state.totalXp);
  const sessions = useProgressStore((state) => state.sessions);
  const wordProgress = useProgressStore((state) => state.wordProgress);
  const recordReview = useProgressStore((state) => state.recordReview);
  const recordSession = useProgressStore((state) => state.recordSession);

  const activeWords = sessionConfig?.words ?? [];
  const session = useSessionController(activeWords);

  useEffect(() => {
    if (!session.summary || !sessionConfig) {
      return;
    }
    const sessionId = `${sessionConfig.chapterLabel}-${session.summary.durationSeconds}-${session.summary.reviews.length}`;
    if (recordedSessionId === sessionId) {
      return;
    }
    const historyEntry: SessionHistoryEntry = {
      id: sessionId,
      completedAt: new Date().toISOString(),
      chapterLabel: sessionConfig.chapterLabel,
      wordsReviewed: session.summary.totalWords,
      correctAnswers: session.summary.correctAnswers,
      incorrectAnswers: session.summary.incorrectAnswers,
      accuracy: session.summary.accuracy,
      durationSeconds: session.summary.durationSeconds,
      xpEarned: session.summary.xpEarned,
      difficultWordIds: session.summary.difficultWordIds,
    };
    recordSession(historyEntry);
    setRecordedSessionId(sessionId);
  }, [recordSession, recordedSessionId, session.summary, sessionConfig]);

  const selectedWords = getWordsForChapters(selectedChapters);
  const chapterLabel = getChapterLabel(selectedChapters);
  const searchResults = n5Dataset.chapters
    .flatMap((chapter) => chapter.vocabulary)
    .filter((word) => {
      if (!searchQuery.trim()) {
        return false;
      }
      const query = searchQuery.trim().toLowerCase();
      return (
        word.japanese.includes(searchQuery.trim()) ||
        word.reading.includes(searchQuery.trim()) ||
        word.romaji.toLowerCase().includes(query) ||
        word.meaning.some((meaning) => meaning.toLowerCase().includes(query))
      );
    })
    .slice(0, 20);
  const weakWords = getWeakWordIds(wordProgress, 5)
    .map((wordId) => findWordById(wordId))
    .filter((word): word is VocabularyWord => Boolean(word));
  const recentSessions = sessions.slice(0, 3);

  function toggleChapter(chapter: number) {
    setSelectedChapters((current) => {
      if (current.includes(chapter)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== chapter);
      }
      return [...current, chapter].sort((a, b) => a - b);
    });
  }

  function applyPreset(type: "all" | "first5" | "clear") {
    if (type === "all") {
      setSelectedChapters(n5Dataset.chapters.map((chapter) => chapter.chapter));
      return;
    }
    if (type === "first5") {
      setSelectedChapters([1, 2, 3, 4, 5]);
      return;
    }
    setSelectedChapters([1]);
  }

  function startSession() {
    const chapters = [...selectedChapters].sort((a, b) => a - b);
    const words = getWordsForChapters(chapters);
    setSessionConfig({
      chapters,
      words,
      chapterLabel: getChapterLabel(chapters),
    });
    setRecordedSessionId(null);
    setScreen("session");
  }

  function handleAnswer(result: "correct" | "wrong") {
    if (!session.currentWord) {
      return;
    }
    const firstAttempt = !session.reviews.some((review) => review.wordId === session.currentWord?.uid);
    recordReview({
      wordId: session.currentWord.uid,
      result,
      firstAttempt,
    });
    session.answer(result);
  }

  function renderDashboard() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Pill label="Offline First" active />
          <Text style={styles.heroTitle}>Kotoba Quest</Text>
          <Text style={styles.heroBody}>
            A chapter-based Japanese vocabulary trainer with flashcards, adaptive review,
            search, streaks, and local mastery tracking.
          </Text>
          <View style={styles.heroButtonRow}>
            <Pressable style={styles.primaryButton} onPress={() => setScreen("select")}>
              <Text style={styles.primaryButtonText}>Start Learning</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setScreen("search")}>
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
            <Text style={styles.mutedText}>No sessions yet. Start with Lesson 1 and build momentum.</Text>
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
            <Text style={styles.mutedText}>Your difficult words will show up here after a few review sessions.</Text>
          ) : (
            weakWords.map((word) => (
              <View key={word.uid} style={styles.listCard}>
                <Text style={styles.listTitle}>{word.japanese}</Text>
                <Text style={styles.listMeta}>
                  {word.reading} • {word.meaning.join(", ")} • mastery {wordProgress[word.uid]?.mastery ?? 0}%
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  function renderSelection() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
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
          <Text style={styles.summaryLine}>Estimated Time: {estimateMinutes(selectedWords.length)} min</Text>
          <Text style={styles.summaryLine}>
            Difficulty: {getDifficultyLabel(selectedWords, wordProgress)}
          </Text>
        </View>

        <View style={styles.footerButtons}>
          <Pressable style={styles.secondaryButton} onPress={() => setScreen("dashboard")}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => setScreen("setup")}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderSetup() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
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
              <Text style={styles.listMeta}>{word.reading} • {word.meaning.join(", ")}</Text>
            </View>
          ))}
          {selectedWords.length > 5 ? (
            <Text style={styles.mutedText}>+ {selectedWords.length - 5} more words in this set</Text>
          ) : null}
        </View>

        <View style={styles.footerButtons}>
          <Pressable style={styles.secondaryButton} onPress={() => setScreen("select")}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={startSession}>
            <Text style={styles.primaryButtonText}>Start Session</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderSession() {
    if (session.summary && sessionConfig) {
      const difficultWords = session.summary.difficultWordIds
        .map((wordId) => findWordById(wordId))
        .filter((word): word is VocabularyWord => Boolean(word));
      return (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.screenTitle}>Session Complete</Text>
          <Text style={styles.screenBody}>
            {sessionConfig.chapterLabel} finished. Your progress has been saved locally.
          </Text>
          <View style={styles.statsGrid}>
            <StatCard label="Words" value={`${session.summary.totalWords}`} />
            <StatCard label="Correct" value={`${session.summary.correctAnswers}`} tone="success" />
            <StatCard label="Wrong" value={`${session.summary.incorrectAnswers}`} tone="danger" />
            <StatCard label="Accuracy" value={`${session.summary.accuracy}%`} />
            <StatCard label="Time" value={`${session.summary.durationSeconds}s`} />
            <StatCard label="XP" value={`${session.summary.xpEarned}`} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Difficult Words</Text>
            {difficultWords.length === 0 ? (
              <Text style={styles.mutedText}>Perfect run. No difficult words this time.</Text>
            ) : (
              difficultWords.map((word) => (
                <View key={word.uid} style={styles.listCard}>
                  <Text style={styles.listTitle}>{word.japanese}</Text>
                  <Text style={styles.listMeta}>{word.reading} • {word.meaning.join(", ")}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.footerButtons}>
            <Pressable style={styles.secondaryButton} onPress={() => setScreen("select")}>
              <Text style={styles.secondaryButtonText}>New Session</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => setScreen("dashboard")}>
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    if (!session.currentWord || !sessionConfig) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.screenTitle}>No session ready</Text>
          <Pressable style={styles.primaryButton} onPress={() => setScreen("select")}>
            <Text style={styles.primaryButtonText}>Choose Lessons</Text>
          </Pressable>
        </View>
      );
    }

    const progressValue = `${Math.min(session.currentIndex + 1, session.queueLength)} / ${session.queueLength}`;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.progressText}>{progressValue} Words</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(Math.min(session.currentIndex, session.queueLength) / session.queueLength) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Correct" value={`${session.correctAnswers}`} tone="success" />
          <StatCard label="Wrong" value={`${session.incorrectAnswers}`} tone="danger" />
          <StatCard label="Accuracy" value={`${session.accuracy}%`} />
          <StatCard label="XP" value={`${session.xpEarned}`} />
        </View>

        <Pressable style={styles.flashcard} onPress={session.flipCard}>
          {!session.flipped ? (
            <>
              <Text style={styles.flashcardLabel}>Front</Text>
              <Text style={styles.flashcardWord}>{session.currentWord.japanese}</Text>
              <Text style={styles.flashcardHint}>Tap to reveal reading and meaning</Text>
            </>
          ) : (
            <>
              <Text style={styles.flashcardLabel}>Back</Text>
              <Text style={styles.flashcardWord}>{session.currentWord.reading}</Text>
              <Text style={styles.flashcardMeta}>{session.currentWord.romaji}</Text>
              <Text style={styles.flashcardMeaning}>{session.currentWord.meaning.join(", ")}</Text>
              {session.currentWord.verb_group ? (
                <Text style={styles.flashcardTag}>Verb Group {session.currentWord.verb_group}</Text>
              ) : null}
            </>
          )}
        </Pressable>

        <View style={styles.footerButtons}>
          <Pressable style={styles.dangerButton} onPress={() => handleAnswer("wrong")}>
            <Text style={styles.primaryButtonText}>Need Review</Text>
          </Pressable>
          <Pressable style={styles.successButton} onPress={() => handleAnswer("correct")}>
            <Text style={styles.primaryButtonText}>Got It</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderSearch() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Search Vocabulary</Text>
        <Text style={styles.screenBody}>
          Search by Japanese, reading, romaji, or meaning across the full N5 set.
        </Text>
        <TextInput
          placeholder="Try tabemasu, たべます, 食べます, or eat"
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <View style={styles.section}>
          {searchResults.length === 0 ? (
            <Text style={styles.mutedText}>No matches yet. Start typing to search the dataset.</Text>
          ) : (
            searchResults.map((word) => (
              <View key={word.uid} style={styles.listCard}>
                <Text style={styles.listTitle}>{word.japanese}</Text>
                <Text style={styles.listMeta}>
                  {word.reading} • {word.romaji} • {word.meaning.join(", ")}
                </Text>
              </View>
            ))
          )}
        </View>
        <Pressable style={styles.secondaryButton} onPress={() => setScreen("dashboard")}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {screen === "dashboard" && renderDashboard()}
        {screen === "select" && renderSelection()}
        {screen === "setup" && renderSetup()}
        {screen === "session" && renderSession()}
        {screen === "search" && renderSearch()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },
  heroBody: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 24,
  },
  heroButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  successButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  dangerButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    minWidth: "47%",
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 6,
  },
  statCardSuccess: {
    borderColor: "#166534",
  },
  statCardDanger: {
    borderColor: "#7F1D1D",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  mutedText: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
  },
  listCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  listTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  listMeta: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  screenBody: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#3B82F6",
  },
  pillMuted: {
    backgroundColor: "#111827",
    borderColor: "#334155",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextMuted: {
    color: "#CBD5E1",
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 22,
    padding: 20,
    gap: 10,
  },
  summaryLine: {
    color: "#E2E8F0",
    fontSize: 15,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  progressText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#172033",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 999,
  },
  flashcard: {
    minHeight: 360,
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
    justifyContent: "center",
    gap: 14,
  },
  flashcardLabel: {
    color: "#60A5FA",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  flashcardWord: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  flashcardHint: {
    color: "#94A3B8",
    fontSize: 16,
  },
  flashcardMeta: {
    color: "#CBD5E1",
    fontSize: 20,
  },
  flashcardMeaning: {
    color: "#94A3B8",
    fontSize: 18,
    lineHeight: 26,
  },
  flashcardTag: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "700",
  },
  searchInput: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 18,
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 20,
  },
});
