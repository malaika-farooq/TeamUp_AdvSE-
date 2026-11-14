import { createFileRoute } from "@tanstack/react-router";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { z } from "zod";
import { authenticateRequest, jsonError } from "@/lib/route-auth";
import { aiTextDeltas, friendlyAIError, UNTRUSTED_NOTE, type AIMessage } from "@/lib/ai-gateway";
import { buildPersonalContext, buildTeamContext } from "@/lib/ai-context";

const Body = z.object({
  threadId: z.string().uuid(),
  message: z.object({
    id: z.string().min(1).max(100),
    role: z.literal("user"),
    parts: z
      .array(z.object({ type: z.string(), text: z.string().max(4000).optional() }).passthrough())
      .min(1)
      .max(10),
  }),
});

type StoredPart = { type: string; text?: string };

function partsText(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return (parts as StoredPart[])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
}

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return jsonError(401, "Please sign in again to chat with the assistant.");
        const { supabase, userId } = auth;

        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return jsonError(400, "That message was not valid.");
        }
        const text = partsText(body.message.parts).trim();
        if (!text) return jsonError(400, "Type a message first.");

        const { data: thread } = await supabase
          .from("ai_threads")
          .select("id, title, team_id")
          .eq("id", body.threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return jsonError(404, "This conversation could not be found.");

        // Save the student's message once (retries reuse the same client id).
        const { data: existing } = await supabase
          .from("ai_messages")
          .select("id")
          .eq("thread_id", thread.id)
          .eq("client_id", body.message.id)
          .maybeSingle();
        if (!existing) {
          const { error } = await supabase.from("ai_messages").insert({
            thread_id: thread.id,
            user_id: userId,
            client_id: body.message.id,
            role: "user",
            parts: [{ type: "text", text }],
          });
          if (error) {
            console.error("[ai-chat] save user message", error);
            return jsonError(500, "Your message couldn't be saved. Please try again.");
          }
        }
        if (thread.title === "New conversation") {
          const title = text.replace(/\s+/g, " ").slice(0, 60);
          await supabase.from("ai_threads").update({ title }).eq("id", thread.id);
        }

        let records: string;
        let teamLine = "";
        try {
          if (thread.team_id) {
            const ctx = await buildTeamContext(supabase, userId, thread.team_id);
            records = ctx.text;
            teamLine = `This conversation is about the team "${ctx.team.name}".`;
          } else {
            records = await buildPersonalContext(supabase, userId);
          }
        } catch {
          records = await buildPersonalContext(supabase, userId);
          teamLine = "The student no longer has access to the team this chat was linked to.";
        }

        const { data: history } = await supabase
          .from("ai_messages")
          .select("role, parts, created_at")
          .eq("thread_id", thread.id)
          .order("created_at", { ascending: false })
          .limit(24);

        const messages: AIMessage[] = [
          {
            role: "system",
            content: `You are TeamUp's study assistant for university students working in teams. ${teamLine} Be friendly, specific and concise. Format answers in markdown with short headings or bullet lists when helpful. Refer to real task, note and session titles from the records. You can't create, edit or delete anything yourself — when an action would help, tell the student exactly where to do it in TeamUp (Tasks board, Calendar, Resources, Members, or the AI features on the AI Teammate Matching page). ${UNTRUSTED_NOTE}\n\n${records}`,
          },
          ...(history ?? [])
            .reverse()
            .map((m) => ({
              role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
              content: partsText(m.parts),
            }))
            .filter((m) => m.content),
        ];

        const stream = createUIMessageStream({
          onError: (e) => friendlyAIError(e),
          execute: async ({ writer }) => {
            const partId = crypto.randomUUID();
            let answer = "";
            writer.write({ type: "start" });
            writer.write({ type: "text-start", id: partId });
            try {
              for await (const delta of aiTextDeltas(messages, request.signal)) {
                answer += delta;
                writer.write({ type: "text-delta", id: partId, delta });
              }
            } finally {
              writer.write({ type: "text-end", id: partId });
              if (answer.trim()) {
                const { error } = await supabase.from("ai_messages").insert({
                  thread_id: thread.id,
                  user_id: userId,
                  role: "assistant",
                  parts: [{ type: "text", text: answer }],
                });
                if (error) console.error("[ai-chat] save assistant message", error);
                await supabase
                  .from("ai_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", thread.id);
              }
            }
            writer.write({ type: "finish" });
          },
        });

        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});
