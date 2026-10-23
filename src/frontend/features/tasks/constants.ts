import type { TaskStatus, TaskPriority } from "@/types/domain";

export const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
];

export const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
