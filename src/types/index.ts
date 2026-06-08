export type VocabularyWord = {
  uid: string;
  japanese: string;
  reading: string;
  romaji: string;
  meaning: string[];
  verb_group?: string;
};

export type ChapterDataset = {
  chapter: number;
  lesson: number;
  jlpt: string;
  vocabulary: VocabularyWord[];
};

export type N5Dataset = {
  jlpt: string;
  totalChapters: number;
  totalWords: number;
  chapters: ChapterDataset[];
};

export type WordProgress = {
  wordId: string;
  seen: number;
  correct: number;
  wrong: number;
  mastery: number;
  lastReviewedAt?: string;
};

export type SessionHistoryEntry = {
  id: string;
  completedAt: string;
  chapterLabel: string;
  wordsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  durationSeconds: number;
  xpEarned: number;
  difficultWordIds: string[];
};

export type SessionWordReview = {
  wordId: string;
  result: "correct" | "wrong";
  firstAttempt: boolean;
};
