import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { AssistantMark } from "./AssistantMark";
import { authHeaders, readableError } from "@/lib/ai-client";
import { cn } from "@/lib/utils";

function textOf(m: UIMessage) {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

export function ChatWindow({
  threadId,
  initialMessages,
  initialPrompt,
  onInitialPromptSent,
  suggestions = [],
  contextLabel,
  className,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  initialPrompt?: string | undefined;
  onInitialPromptSent?: () => void;
  suggestions?: string[];
  contextLabel?: string;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/ai/chat",
        headers: authHeaders,
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { threadId: id, message: messages[messages.length - 1] },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, error, regenerate, clearError } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
      queryClient.invalidateQueries({ queryKey: ["ai-thread", threadId] });
      textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId]);

  // Keep the latest chat instance's sender: useChat can swap its instance while mounting.
  const sendRef = useRef(sendMessage);
  sendRef.current = sendMessage;
  const sentCallbackRef = useRef(onInitialPromptSent);
  sentCallbackRef.current = onInitialPromptSent;

  useEffect(() => {
    if (!initialPrompt || sentInitial.current || initialMessages.length > 0) return;
    // Defer to after mount settles so the message goes to the final chat instance.
    const timer = setTimeout(() => {
      if (sentInitial.current) return;
      sentInitial.current = true;
      void sendRef.current({ text: initialPrompt });
      sentCallbackRef.current?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [initialPrompt, initialMessages.length]);

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    if (error) clearError();
    void sendMessage({ text: clean });
    textareaRef.current?.focus();
  }

  const last = messages[messages.length - 1];

  return (
    <div className={cn("flex min-h-0 w-full min-w-0 flex-col", className)}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-6">
          {messages.length === 0 ? (
            <ConversationEmptyState className="gap-4">
              <AssistantMark className="size-20" />
              <div className="space-y-1">
                <h3 className="font-display text-lg font-semibold">Hi, I'm TeamUp AI</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask me about {contextLabel ?? "your teams, tasks and schedule"}. I read your real
                  records and never change anything without you.
                </p>
              </div>
              {suggestions.length > 0 && (
                <div className="flex max-w-md flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <Suggestion key={s} suggestion={s} onClick={send} />
                  ))}
                </div>
              )}
            </ConversationEmptyState>
          ) : (
            messages.map((m) => {
              const isLast = m.id === last?.id;
              const streaming = isLast && status === "streaming" && m.role === "assistant";
              return (
                <Message from={m.role} key={m.id}>
                  <MessageContent
                    className={cn(
                      "group-[.is-user]:bg-navy group-[.is-user]:text-navy-foreground",
                      "group-[.is-assistant]:w-full",
                    )}
                  >
                    {m.parts.map((p, i) =>
                      p.type === "text" ? (
                        m.role === "assistant" ? (
                          <MessageResponse key={i} isAnimating={streaming}>
                            {p.text}
                          </MessageResponse>
                        ) : (
                          <p key={i} className="whitespace-pre-wrap">
                            {p.text}
                          </p>
                        )
                      ) : null,
                    )}
                  </MessageContent>
                  {m.role === "assistant" && !streaming && textOf(m) && (
                    <MessageActions>
                      <MessageAction
                        tooltip="Copy"
                        onClick={() => {
                          void navigator.clipboard.writeText(textOf(m));
                          toast.success("Copied");
                        }}
                      >
                        <CopyIcon className="size-3.5" />
                      </MessageAction>
                      {isLast && (
                        <MessageAction tooltip="Try again" onClick={() => void regenerate()}>
                          <RefreshCwIcon className="size-3.5" />
                        </MessageAction>
                      )}
                    </MessageActions>
                  )}
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm"
            >
              <span className="flex-1">{readableError(error)}</span>
              <Button size="sm" variant="outline" onClick={() => void regenerate()}>
                Try again
              </Button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length > 0 && suggestions.length > 0 && !busy && (
        <Suggestions className="px-1 pb-2">
          {suggestions.map((s) => (
            <Suggestion key={s} suggestion={s} onClick={send} className="text-xs" />
          ))}
        </Suggestions>
      )}

      <PromptInput onSubmit={(msg) => send(msg.text)} className="shrink-0">
        <PromptInputTextarea
          ref={textareaRef}
          placeholder="Ask TeamUp AI…"
          aria-label="Message TeamUp AI"
        />
        <PromptInputFooter className="justify-between">
          <span className="text-[11px] text-muted-foreground">
            Answers use your team's records. Double-check before you rely on them.
          </span>
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
