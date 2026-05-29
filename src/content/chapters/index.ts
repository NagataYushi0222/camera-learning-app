import { chapter01 } from "./chapter01";
import { chapter02 } from "./chapter02";
import { chapter03 } from "./chapter03";
import { chapter04 } from "./chapter04";
import { chapter05 } from "./chapter05";
import { chapter06 } from "./chapter06";
import { chapter07 } from "./chapter07";
import { chapter08 } from "./chapter08";
import { chapter09 } from "./chapter09";
import { chapter10 } from "./chapter10";
import { chapter11 } from "./chapter11";
import { chapter12 } from "./chapter12";
import type { Chapter, LessonStep } from "../lessonTypes";

export const chapters: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapter11,
  chapter12,
];

export function getChapter(chapterId: string): Chapter {
  return chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0];
}

export function getStep(chapterId: string, stepId: string): LessonStep {
  const chapter = getChapter(chapterId);
  return chapter.steps.find((step) => step.id === stepId) ?? chapter.steps[0];
}

export function getNextChapter(chapterId: string): Chapter | null {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  return index >= 0 ? (chapters[index + 1] ?? null) : null;
}

export function getPreviousChapter(chapterId: string): Chapter | null {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  return index > 0 ? chapters[index - 1] : null;
}
