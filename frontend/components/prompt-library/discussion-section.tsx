"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare, ArrowUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiscussionQuestion, DiscussionAnswer } from "@/lib/types";

type DiscussionSectionProps = {
  questions: DiscussionQuestion[];
  answersByQuestion: Record<string, DiscussionAnswer[]>;
};

function QuestionItem({
  question,
  answers,
  isExpanded,
  onToggle,
}: {
  question: DiscussionQuestion;
  answers: DiscussionAnswer[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const acceptedAnswer = answers.find((a) => a.accepted);

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="flex items-center gap-1 text-sm font-medium">
            <ArrowUp className="size-4 text-muted-foreground" />
            {question.votes}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            {question.answerCount}
          </span>
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
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ArrowUp className="size-4" />
                    {answer.votes}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{answer.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {answer.createdAt}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pl-12">
            <textarea
              placeholder="Write your answer..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            <Button size="sm" className="mt-2">
              Post Answer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiscussionSection({
  questions,
  answersByQuestion,
}: DiscussionSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    questions[0]?.id ?? null
  );

  return (
    <section id="discussion">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discussion</h2>
        <Button size="sm">Ask a question</Button>
      </div>
      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            answers={answersByQuestion[q.id] ?? []}
            isExpanded={expandedId === q.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === q.id ? null : q.id))
            }
          />
        ))}
      </div>
      {questions.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 size-8 opacity-50" />
          <p className="font-medium">No questions yet</p>
          <p className="mt-1 text-sm">Be the first to ask a question</p>
          <Button size="sm" className="mt-4">
            Ask a question
          </Button>
        </div>
      )}
    </section>
  );
}
