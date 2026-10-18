
import { create } from "zustand";
import type { QuizDatabase } from "../types/quiz";
import {
  getDatabase,
  resetDatabase,
} from "../data/quizService";

interface QuizStore {
  database: QuizDatabase;
  activeUserId: string;
  selectedCountry: string;
  refresh: () => void;
  reset: () => void;
  setActiveUser: (userId: string) => void;
  setSelectedCountry: (country: string) => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  database: getDatabase(),
  activeUserId: "u1",
  selectedCountry: "",
  refresh: () => {
    set({ database: getDatabase() });
  },
  reset: () => {
    set({
      database: resetDatabase(),
      activeUserId: "u1",
      selectedCountry: "",
    });
  },
  setActiveUser: (userId) => {
    set({ activeUserId: userId });
  },
  setSelectedCountry: (country) => {
    set({ selectedCountry: country });
  },
}));
