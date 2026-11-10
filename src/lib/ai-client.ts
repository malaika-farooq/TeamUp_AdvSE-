// Browser helpers for the AI assistant: auth headers, streamed writing tools and chat threads.
import { queryOptions } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";

export type WriteTool = "summary" | "study_guide" | "quiz" | "agenda" | "checkin";

const ERROR_MARK = "\u0000ERR:";

export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function readableError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e ?? "");
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed?.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return raw || "The assistant is unavailable right now.";
}

/** Streams a written answer (summary, study guide, quiz, agenda, check-in). */
export async function streamWrite(
  body: {
    tool: WriteTool;
    teamId: string;
    noteIds?: string[];
    sessionId?: string;
    instructions?: string;
  },
  onText: (text: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch("/api/ai/write", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    let message = "The assistant is unavailable right now.";
    try {
      message = ((await res.json()) as { error?: string }).error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    const errAt = text.indexOf(ERROR_MARK);
    if (errAt >= 0) {
      onText(text.slice(0, errAt));
      throw new Error(text.slice(errAt + ERROR_MARK.length));
    }
    onText(text);
  }
  return text;
}

export type AIThread = {
  id: string;
  title: string;
  team_id: string | null;
  updated_at: string;
};

export const threadsQuery = () =>
  queryOptions({
    queryKey: ["ai-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_threads")
        .select("id, title, team_id, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []) as AIThread[];
    },
  });

export const threadQuery = (threadId: string) =>
  queryOptions({
    queryKey: ["ai-thread", threadId],
    staleTime: 0,
    queryFn: async () => {
      const [{ data: thread, error }, { data: rows, error: msgErr }] = await Promise.all([
        supabase
          .from("ai_threads")
          .select("id, title, team_id, updated_at")
          .eq("id", threadId)
          .maybeSingle(),
        supabase
          .from("ai_messages")
          .select("id, role, parts, created_at")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true }),
      ]);
      if (error) throw new Error(error.message);
      if (msgErr) throw new Error(msgErr.message);
      if (!thread) return null;
      const messages: UIMessage[] = (rows ?? []).map((r) => ({
        id: r.id,
        role: r.role === "assistant" ? "assistant" : "user",
        parts: (Array.isArray(r.parts) ? r.parts : [])
          .filter(
            (p): p is { type: "text"; text: string } =>
              !!p && typeof p === "object" && (p as { type?: unknown }).type === "text",
          )
          .map((p) => ({ type: "text" as const, text: String(p.text ?? "") })),
      }));
      return { thread: thread as AIThread, messages };
    },
  });

export async function createThread(userId: string, teamId: string | null) {
  const { data, error } = await supabase
    .from("ai_threads")
    .insert({ user_id: userId, team_id: teamId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteThread(threadId: string) {
  const { error } = await supabase.from("ai_threads").delete().eq("id", threadId);
  if (error) throw new Error(error.message);
}

/** Suggested questions for the page the student is looking at. */
export function pagePrompts(pathname: string): { label: string; prompts: string[] } {
  if (/^\/teams\/[^/]+/.test(pathname)) {
    return {
      label: "this team",
      prompts: [
        "Summarize where this team stands right now",
        "What are our biggest blockers?",
        "Is anyone overloaded with tasks?",
      ],
    };
  }
  if (pathname.startsWith("/teams")) {
    return {
      label: "your teams",
      prompts: [
        "Which of my teams needs the most attention?",
        "How do I invite someone to my team?",
        "What makes a good project goal?",
      ],
    };
  }
  if (pathname.startsWith("/tasks")) {
    return {
      label: "your tasks",
      prompts: [
        "What should I work on first?",
        "Which tasks are at risk of missing their deadline?",
        "Help me break my biggest task into steps",
      ],
    };
  }
  if (pathname.startsWith("/calendar")) {
    return {
      label: "your calendar",
      prompts: [
        "Help me plan my study time this week",
        "Draft an agenda for our next meeting",
        "What deadlines are coming up soon?",
      ],
    };
  }
  if (pathname.startsWith("/resources")) {
    return {
      label: "your resources",
      prompts: [
        "Explain our notes in simple terms",
        "Quiz me on our latest notes",
        "What topics are missing from our notes?",
      ],
    };
  }
  if (pathname.startsWith("/discover")) {
    return {
      label: "finding teammates",
      prompts: [
        "What kind of teammate would help my team most?",
        "How do I join a public team?",
        "Write a short intro I can use when asking to join",
      ],
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      label: "your settings",
      prompts: [
        "Why should I add my weekly availability?",
        "How do I make my profile discoverable?",
        "Help me write a short bio",
      ],
    };
  }
  return {
    label: "your day",
    prompts: [
      "What should I focus on today?",
      "Summarize what's due this week",
      "Do I have any overdue tasks?",
    ],
  };
}
