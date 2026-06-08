import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";

import { Screen } from "../src/components/Screen";
import { StatCard } from "../src/components/StatCard";
import { useSessionController } from "../src/hooks/useSessionController";
import { useProgressStore } from "../src/store/progressStore";
import { useStudyStore } from "../src/store/studyStore";
import type { SessionHistoryEntry, VocabularyWord } from "../src/types";
import { styles } from "../src/theme/styles";
import { findWordById } from "../src/utils/session";

export default function SessionScreen() {
  const router = useRouter();
  const sessionConfig = useStudyStore((state) => state.sessionConfig);
  const clearSession = useStudyStore((state) => state.clearSession);
  const recordReview = useProgressStore((state) => state.recordReview);
  const recordSession = useProgressStore((state) => state.recordSession);
  const recordedSessionIdRef = useRef<string | null>(null);
  const activeWords = sessionConfig?.words ?? [];
  const session = useSessionController(activeWords);

  useEffect(() => {
    if (!session.summary || !sessionConfig) {
      return;
    }
    const sessionId = `${sessionConfig.chapterLabel}-${session.summary.durationSeconds}-${session.summary.reviews.length}`;
    if (recordedSessionIdRef.current === sessionId) {
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
    recordedSessionIdRef.current = sessionId;
  }, [recordSession, session.summary, sessionConfig]);

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

  function handleLeave(nextRoute: "/" | "/select") {
    clearSession();
    router.replace(nextRoute);
  }

  if (session.summary && sessionConfig) {
    const difficultWords = session.summary.difficultWordIds
      .map((wordId) => findWordById(wordId))
      .filter((word): word is VocabularyWord => Boolean(word));

    return (
      <Screen>
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
                <Text style={styles.listMeta}>
                  {word.reading} • {word.meaning.join(", ")}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footerButtons}>
          <Pressable style={styles.secondaryButton} onPress={() => handleLeave("/select")}>
            <Text style={styles.secondaryButtonText}>New Session</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => handleLeave("/")}>
            <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (!session.currentWord || !sessionConfig) {
    return (
      <Screen scroll={false}>
        <View style={styles.emptyState}>
          <Text style={styles.screenTitle}>No session ready</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace("/select")}>
            <Text style={styles.primaryButtonText}>Choose Lessons</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const progressValue = `${Math.min(session.currentIndex + 1, session.queueLength)} / ${session.queueLength}`;

  return (
    <Screen>
      <Text style={styles.progressText}>{progressValue} Words</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(Math.min(session.currentIndex, session.queueLength) / session.queueLength) * 100}%`,
            },
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
    </Screen>
  );
}
