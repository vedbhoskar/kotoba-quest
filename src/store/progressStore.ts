import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SessionHistoryEntry, SessionWordReview, WordProgress } from "../types";

type ProgressState = {
  streak: number;
  totalXp: number;
  sessions: SessionHistoryEntry[];
  wordProgress: Record<string, WordProgress>;
  recordReview: (review: SessionWordReview) => void;
  recordSession: (session: SessionHistoryEntry) => void;
};

function calculateMastery(progress: Omit<WordProgress, "mastery">): number {
  if (progress.seen === 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((progress.correct / progress.seen) * 100)));
}

function calculateStreak(sessions: SessionHistoryEntry[]): number {
  if (sessions.length === 0) {
    return 0;
  }
  const uniqueDays = [...new Set(sessions.map((session) => session.completedAt.slice(0, 10)))].sort(
    (a, b) => b.localeCompare(a)
  );
  let streak = 0;
  let cursor = new Date(uniqueDays[0]);
  for (const day of uniqueDays) {
    const iso = cursor.toISOString().slice(0, 10);
    if (day !== iso) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      streak: 0,
      totalXp: 0,
      sessions: [],
      wordProgress: {},
      recordReview: (review) =>
        set((state) => {
          const current = state.wordProgress[review.wordId] ?? {
            wordId: review.wordId,
            seen: 0,
            correct: 0,
            wrong: 0,
            mastery: 0,
          };
          const next = {
            ...current,
            seen: current.seen + 1,
            correct: current.correct + (review.result === "correct" ? 1 : 0),
            wrong: current.wrong + (review.result === "wrong" ? 1 : 0),
            lastReviewedAt: new Date().toISOString(),
          };
          return {
            wordProgress: {
              ...state.wordProgress,
              [review.wordId]: {
                ...next,
                mastery: calculateMastery(next),
              },
            },
          };
        }),
      recordSession: (session) =>
        set((state) => {
          const sessions = [session, ...state.sessions].slice(0, 50);
          return {
            sessions,
            totalXp: state.totalXp + session.xpEarned,
            streak: calculateStreak(sessions),
          };
        }),
    }),
    {
      name: "kotoba-quest-progress",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
