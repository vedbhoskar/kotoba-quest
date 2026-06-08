import { n5Dataset } from "../data/n5";
import type { VocabularyWord } from "../types";

export function findWordById(wordId: string): VocabularyWord | undefined {
  return n5Dataset.chapters
    .flatMap((chapter) => chapter.vocabulary)
    .find((word) => word.uid === wordId);
}
