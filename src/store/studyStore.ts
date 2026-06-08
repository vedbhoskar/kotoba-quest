import { create } from "zustand";

import type { VocabularyWord } from "../types";

type SessionConfig = {
  chapters: number[];
  words: VocabularyWord[];
  chapterLabel: string;
};

type StudyState = {
  selectedChapters: number[];
  sessionConfig: SessionConfig | null;
  setSelectedChapters: (chapters: number[]) => void;
  toggleChapter: (chapter: number) => void;
  resetSelection: () => void;
  startSession: (config: SessionConfig) => void;
  clearSession: () => void;
};

export const useStudyStore = create<StudyState>((set) => ({
  selectedChapters: [1],
  sessionConfig: null,
  setSelectedChapters: (chapters) =>
    set({
      selectedChapters: [...chapters].sort((a, b) => a - b),
    }),
  toggleChapter: (chapter) =>
    set((state) => {
      if (state.selectedChapters.includes(chapter)) {
        if (state.selectedChapters.length === 1) {
          return state;
        }
        return {
          selectedChapters: state.selectedChapters.filter((item) => item !== chapter),
        };
      }
      return {
        selectedChapters: [...state.selectedChapters, chapter].sort((a, b) => a - b),
      };
    }),
  resetSelection: () => set({ selectedChapters: [1] }),
  startSession: (config) => set({ sessionConfig: config }),
  clearSession: () => set({ sessionConfig: null }),
}));
