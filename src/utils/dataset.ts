import { n5Dataset } from "../data/n5";
import type { VocabularyWord, WordProgress } from "../types";

export function getWordsForChapters(chapters: number[]): VocabularyWord[] {
  const selected = new Set(chapters);
  return n5Dataset.chapters
    .filter((chapter) => selected.has(chapter.chapter))
    .flatMap((chapter) => chapter.vocabulary);
}

export function getChapterLabel(chapters: number[]): string {
  const sorted = [...chapters].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return "No lessons";
  }
  if (sorted.length === 1) {
    return `Lesson ${sorted[0]}`;
  }
  const contiguous = sorted.every((chapter, index) => {
    if (index === 0) {
      return true;
    }
    return chapter === sorted[index - 1] + 1;
  });
  if (contiguous) {
    return `Lesson ${sorted[0]}-${sorted[sorted.length - 1]}`;
  }
  return `${sorted.length} lessons`;
}

export function estimateMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 15));
}

export function getDifficultyLabel(
  words: VocabularyWord[],
  progress: Record<string, WordProgress>
): "Easy" | "Balanced" | "Challenge" {
  if (words.length === 0) {
    return "Easy";
  }
  const averageMastery =
    words.reduce((sum, word) => sum + (progress[word.uid]?.mastery ?? 0), 0) /
    words.length;
  if (averageMastery >= 70) {
    return "Easy";
  }
  if (averageMastery >= 35) {
    return "Balanced";
  }
  return "Challenge";
}

export function getWeakWordIds(
  progress: Record<string, WordProgress>,
  limit: number
): string[] {
  return Object.values(progress)
    .filter((entry) => entry.wrong > 0)
    .sort((a, b) => {
      if (b.wrong !== a.wrong) {
        return b.wrong - a.wrong;
      }
      return a.mastery - b.mastery;
    })
    .slice(0, limit)
    .map((entry) => entry.wordId);
}
