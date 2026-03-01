"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageSquare, ArrowUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  fetchDiscussions,
  createDiscussionQuestion,
  createDiscussionAnswer,
  voteDiscussionQuestion,
  voteDiscussionAnswer,
  acceptDiscussionAnswer,
} from "@/lib/api";
import type { DiscussionQuestion, DiscussionAnswer } from "@/lib/types";

type DiscussionSectionProps = {
  promptId: string;
  promptAuthorUid?: string;
  initialQuestions: DiscussionQuestion[];
  initialAnswersByQuestion: Record<string, DiscussionAnswer[]>;
};

function QuestionItem({
  promptId,
  isOwner,
  question,
  answers,
  isExpanded,
  onToggle,
  onQuestionVote,
  onAnswerVote,
  onAnswerPost,
  onAcceptAnswer,
  onRefresh,
}: {
  promptId: string;
  isOwner: boolean;
  question: DiscussionQuestion;
  answers: DiscussionAnswer[];
  isExpanded: boolean;
  onToggle: () => void;
  onQuestionVote: (questionId: string) => void;
  onAnswerVote: (questionId: string, answerId: string) => void;
  onAnswerPost: (questionId: string, content: string) => void;
  onAcceptAnswer: (questionId: string, answerId: string) => void;
  onRefresh: () => void;
}) {
  const [answerText, setAnswerText] = useState("");
  const [postingAnswer, setPostingAnswer] = useState(false);

  async function handlePostAnswer() {
    if (!answerText.trim()) return;
    setPostingAnswer(true);
    try {
      await onAnswerPost(question.id, answerText.trim());
      setAnswerText("");
      onRefresh();
    } finally {
      setPostingAnswer(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onQuestionVote(question.id); }}
          onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onQuestionVote(question.id))}
          className="flex shrink-0 flex-col items-center gap-1 rounded p-1 hover:bg-muted/50"
        >
          <ArrowUp className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{question.votes}</span>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{question.answerCount}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium hover:text-primary">{question.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {question.body}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            @{question.author} · {question.createdAt}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="space-y-4 pl-12">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className={cn(
                  "rounded-lg border p-4",
                  answer.accepted
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-muted/30"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {answer.accepted && (
                      <span
                        className="flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-xs text-primary"
                        title="Accepted answer"
                      >
                        <Check className="size-3" />
                        Accepted
                      </span>
                    )}
                    @{answer.author}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAnswerVote(question.id, answer.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUp className="size-4" />
                    {answer.votes}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm">{answer.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {answer.createdAt}
                </p>
                {isOwner && !answer.accepted && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs"
                    onClick={() => onAcceptAnswer(question.id, answer.id)}
                  >
                    Accept answer
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pl-12">
            <textarea
              placeholder="Write your answer..."
              rows={3}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={handlePostAnswer}
              disabled={postingAnswer || !answerText.trim()}
            >
              {postingAnswer ? "Posting…" : "Post Answer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiscussionSection({
  promptId,
  promptAuthorUid,
  initialQuestions,
  initialAnswersByQuestion,
}: DiscussionSectionProps) {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const [questions, setQuestions] = useState(initialQuestions);
  const [answersByQuestion, setAnswersByQuestion] = useState(initialAnswersByQuestion);
  const [expandedId, setExpandedId] = useState<string | null>(initialQuestions[0]?.id ?? null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [askTitle, setAskTitle] = useState("");
  const [askBody, setAskBody] = useState("");
  const [postingQuestion, setPostingQuestion] = useState(false);

  const isOwner = Boolean(currentUser?.uid && promptAuthorUid && currentUser.uid === promptAuthorUid);

  async function refreshDiscussions() {
    const result = await fetchDiscussions(promptId);
    if (result.success) {
      setQuestions(result.questions);
      setAnswersByQuestion(result.answersByQuestion ?? {});
    }
  }

  async function handleAskQuestion() {
    if (!user || !currentUser || !askTitle.trim() || !askBody.trim()) return;
    setPostingQuestion(true);
    try {
      const token = await user.getIdToken();
      const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
      const result = await createDiscussionQuestion(token, promptId, {
        title: askTitle.trim(),
        body: askBody.trim(),
        authorUsername,
      });
      if (result.success) {
        setIsComposerOpen(false);
        setAskTitle("");
        setAskBody("");
        refreshDiscussions();
      }
    } finally {
      setPostingQuestion(false);
    }
  }

  async function handleQuestionVote(questionId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    const token = await user.getIdToken();
    const result = await voteDiscussionQuestion(token, promptId, questionId);
    if (result.success) refreshDiscussions();
  }

  async function handleAnswerVote(questionId: string, answerId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    const token = await user.getIdToken();
    const result = await voteDiscussionAnswer(token, promptId, questionId, answerId);
    if (result.success) refreshDiscussions();
  }

  async function handleAnswerPost(questionId: string, content: string) {
    if (!user || !currentUser) {
      router.push("/login");
      return;
    }
    const token = await user.getIdToken();
    const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
    const result = await createDiscussionAnswer(token, promptId, questionId, {
      content,
      authorUsername,
    });
    return result.success;
  }

  async function handleAcceptAnswer(questionId: string, answerId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    const token = await user.getIdToken();
    const result = await acceptDiscussionAnswer(token, promptId, questionId, answerId);
    if (result.success) refreshDiscussions();
  }

  return (
    <section id="discussion">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discussion</h2>
        <Button size="sm" onClick={() => (user ? setIsComposerOpen(true) : router.push("/login"))}>
          Ask a question
        </Button>
      </div>

      {isComposerOpen && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-1 text-base font-semibold">Start a discussion</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Ask a focused question and include context, expected behavior, and examples.
          </p>
          <input
            placeholder="Title (e.g. Why does this prompt fail on longer inputs?)"
            value={askTitle}
            onChange={(e) => setAskTitle(e.target.value)}
            className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Describe your question in detail..."
            rows={5}
            value={askBody}
            onChange={(e) => setAskBody(e.target.value)}
            className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsComposerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAskQuestion}
              disabled={postingQuestion || !askTitle.trim() || !askBody.trim()}
            >
              {postingQuestion ? "Posting..." : "Post discussion"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            promptId={promptId}
            isOwner={!!isOwner}
            question={q}
            answers={answersByQuestion[q.id] ?? []}
            isExpanded={expandedId === q.id}
            onToggle={() => setExpandedId((prev) => (prev === q.id ? null : q.id))}
            onQuestionVote={handleQuestionVote}
            onAnswerVote={handleAnswerVote}
            onAnswerPost={handleAnswerPost}
            onAcceptAnswer={isOwner ? handleAcceptAnswer : () => {}}
            onRefresh={refreshDiscussions}
          />
        ))}
      </div>
      {questions.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 size-8 opacity-50" />
          <p className="font-medium">No questions yet</p>
          <p className="mt-1 text-sm">Be the first to ask a question</p>
          <Button size="sm" className="mt-4" onClick={() => (user ? setIsComposerOpen(true) : router.push("/login"))}>
            Ask a question
          </Button>
        </div>
      )}
    </section>
  );
}
