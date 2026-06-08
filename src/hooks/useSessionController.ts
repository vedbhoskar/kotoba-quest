import { useEffect, useState } from "react";

import type { VocabularyWord } from "../types";

type ReviewRecord = {
  wordId: string;
  result: "correct" | "wrong";
  firstAttempt: boolean;
};

type SessionSummary = {
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  xpEarned: number;
  durationSeconds: number;
  difficultWordIds: string[];
  reviews: ReviewRecord[];
};

function insertLater(queue: VocabularyWord[], currentIndex: number, word: VocabularyWord) {
  const nextQueue = [...queue];
  const insertAt = Math.min(nextQueue.length, currentIndex + 3);
  nextQueue.splice(insertAt, 0, word);
  return nextQueue;
}

export function useSessionController(words: VocabularyWord[]) {
  const [queue, setQueue] = useState<VocabularyWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [attemptsByWord, setAttemptsByWord] = useState<Record<string, number>>({});
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setQueue(words);
    setCurrentIndex(0);
    setFlipped(false);
    setStartedAt(Date.now());
    setCompletedAt(null);
    setReviews([]);
    setAttemptsByWord({});
    setWrongCounts({});
  }, [words]);

  const currentWord = queue[currentIndex];
  const completed = queue.length > 0 && currentIndex >= queue.length;
  const correctAnswers = reviews.filter((review) => review.result === "correct").length;
  const incorrectAnswers = reviews.filter((review) => review.result === "wrong").length;
  const accuracy = reviews.length === 0 ? 0 : Math.round((correctAnswers / reviews.length) * 1000) / 10;
  const difficultWordIds = Object.entries(wrongCounts)
    .filter(([, wrong]) => wrong > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([wordId]) => wordId);
  let xpEarned = reviews.reduce((sum, review) => {
    if (review.result !== "correct") {
      return sum;
    }
    return sum + (review.firstAttempt ? 15 : 10);
  }, 0);
  if (completed) {
    xpEarned += 100;
    if (incorrectAnswers === 0) {
      xpEarned += 250;
    }
  }

  function flipCard() {
    if (!completed) {
      setFlipped((value) => !value);
    }
  }

  function answer(result: "correct" | "wrong") {
    if (!currentWord || completed) {
      return;
    }
    const attempts = attemptsByWord[currentWord.uid] ?? 0;
    const firstAttempt = attempts === 0;

    setAttemptsByWord((state) => ({
      ...state,
      [currentWord.uid]: attempts + 1,
    }));
    setReviews((state) => [
      ...state,
      {
        wordId: currentWord.uid,
        result,
        firstAttempt,
      },
    ]);
    if (result === "wrong") {
      setWrongCounts((state) => ({
        ...state,
        [currentWord.uid]: (state[currentWord.uid] ?? 0) + 1,
      }));
      setQueue((state) => insertLater(state, currentIndex, currentWord));
    }
    setFlipped(false);
    setCurrentIndex((index) => index + 1);
    if (currentIndex + 1 >= queue.length) {
      setCompletedAt(Date.now());
    }
  }

  const summary: SessionSummary | null = completed
    ? {
        totalWords: words.length,
        correctAnswers,
        incorrectAnswers,
        accuracy,
        xpEarned,
        durationSeconds: Math.max(
          1,
          Math.round(((completedAt ?? Date.now()) - startedAt) / 1000)
        ),
        difficultWordIds,
        reviews,
      }
    : null;

  return {
    currentWord,
    currentIndex,
    queueLength: queue.length,
    completed,
    flipped,
    reviews,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    xpEarned,
    summary,
    flipCard,
    answer,
  };
}
