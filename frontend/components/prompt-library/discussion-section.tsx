"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MessageSquare, ArrowUp, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
import { MarkdownEditor } from "./markdown-editor";

type DiscussionSectionProps = {
  promptId: string;
  promptAuthorUid?: string;
  initialQuestions: DiscussionQuestion[];
  initialAnswersByQuestion: Record<string, DiscussionAnswer[]>;
};

function AnswerNode({
  questionId,
  answer,
  isOwner,
  onAnswerVote,
  onReplyPost,
  onAcceptAnswer,
  onRefresh,
  level = 0,
  highlightedAnswerId,
}: {
  questionId: string;
  answer: DiscussionAnswer;
  isOwner: boolean;
  onAnswerVote: (questionId: string, answerId: string) => void;
  onReplyPost: (questionId: string, parentAnswerId: string, content: string) => Promise<boolean>;
  onAcceptAnswer: (questionId: string, answerId: string) => void;
  onRefresh: () => void;
  level?: number;
  highlightedAnswerId?: string | null;
}) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  async function handleReplyPost() {
    if (!replyText.trim()) return;
    setPostingReply(true);
    try {
      const posted = await onReplyPost(questionId, answer.id, replyText.trim());
      if (posted) {
        setReplyText("");
        setIsReplyOpen(false);
        onRefresh();
      }
    } finally {
      setPostingReply(false);
    }
  }

  const isTopLevelAnswer = !answer.parentAnswerId;

  const isHighlighted = highlightedAnswerId === answer.id;

  useEffect(() => {
    if (!isHighlighted) return;
    const element = document.getElementById(`answer-${answer.id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [answer.id, isHighlighted]);

  return (
    <div className={cn(level > 0 && "ml-6 border-l border-border/60 pl-4")}>
      <div
        id={`answer-${answer.id}`}
        className={cn(
          "rounded-lg border p-4 transition-colors",
          answer.accepted
            ? "border-primary/50 bg-primary/5"
            : "border-border bg-muted/30",
          isHighlighted && "ring-1 ring-primary/40 bg-primary/10"
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
          <span className="text-xs text-muted-foreground">{answer.votes} upvotes</span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
          <ReactMarkdown>{answer.content}</ReactMarkdown>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{answer.createdAt}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => onAnswerVote(questionId, answer.id)}
          >
            <ArrowUp className="mr-1 size-3.5" />
            Upvote ({answer.votes})
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => setIsReplyOpen((v) => !v)}>
            {isReplyOpen ? "Cancel reply" : "Reply"}
          </Button>
          {isOwner && isTopLevelAnswer && !answer.accepted && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => onAcceptAnswer(questionId, answer.id)}
            >
              Accept answer
            </Button>
          )}
        </div>

        {isReplyOpen && (
          <div className="mt-3">
            <MarkdownEditor
              content={replyText}
              onChange={setReplyText}
              placeholder="Write your reply..."
              minRows={4}
              submitLabel={postingReply ? "Posting..." : "Post reply"}
              onSubmit={handleReplyPost}
              onCancel={() => setIsReplyOpen(false)}
              disabled={postingReply}
            />
          </div>
        )}
      </div>

      {answer.replies && answer.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {answer.replies.map((reply) => (
            <AnswerNode
              key={reply.id}
              questionId={questionId}
              answer={reply}
              isOwner={isOwner}
              onAnswerVote={onAnswerVote}
              onReplyPost={onReplyPost}
              onAcceptAnswer={onAcceptAnswer}
              onRefresh={onRefresh}
              level={level + 1}
              highlightedAnswerId={highlightedAnswerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionItem({
  isOwner,
  question,
  answers,
  isExpanded,
  onToggle,
  onQuestionVote,
  onAnswerVote,
  onAnswerPost,
  onReplyPost,
  onAcceptAnswer,
  onRefresh,
  highlightedAnswerId,
  highlightedQuestionId,
}: {
  isOwner: boolean;
  question: DiscussionQuestion;
  answers: DiscussionAnswer[];
  isExpanded: boolean;
  onToggle: () => void;
  onQuestionVote: (questionId: string) => void;
  onAnswerVote: (questionId: string, answerId: string) => void;
  onAnswerPost: (questionId: string, content: string) => Promise<boolean>;
  onReplyPost: (questionId: string, parentAnswerId: string, content: string) => Promise<boolean>;
  onAcceptAnswer: (questionId: string, answerId: string) => void;
  onRefresh: () => void;
  highlightedAnswerId?: string | null;
  highlightedQuestionId?: string | null;
}) {
  const [answerText, setAnswerText] = useState("");
  const [postingAnswer, setPostingAnswer] = useState(false);

  async function handlePostAnswer() {
    if (!answerText.trim()) return;
    setPostingAnswer(true);
    try {
      const posted = await onAnswerPost(question.id, answerText.trim());
      if (posted) {
        setAnswerText("");
        onRefresh();
      }
    } finally {
      setPostingAnswer(false);
    }
  }

  const isQuestionHighlighted = highlightedQuestionId === question.id;

  useEffect(() => {
    if (!isQuestionHighlighted) return;
    const element = document.getElementById(`discussion-${question.id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isQuestionHighlighted, question.id]);

  return (
    <div
      id={`discussion-${question.id}`}
      className={cn(
        "rounded-lg border border-border bg-card transition-colors",
        isQuestionHighlighted && "ring-1 ring-primary/40 bg-primary/5"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex shrink-0 flex-col items-center gap-1 rounded p-1">
          <ArrowUp className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{question.votes}</span>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{question.answerCount}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium hover:text-primary">{question.title}</h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{question.body}</p>
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
          <div className="mb-3 pl-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => onQuestionVote(question.id)}
            >
              <ArrowUp className="mr-1 size-3.5" />
              Upvote ({question.votes})
            </Button>
          </div>

          <div className="space-y-4 pl-4">
            {answers.map((answer) => (
              <AnswerNode
                key={answer.id}
                questionId={question.id}
                answer={answer}
                isOwner={isOwner}
                onAnswerVote={onAnswerVote}
                onReplyPost={onReplyPost}
                onAcceptAnswer={onAcceptAnswer}
                onRefresh={onRefresh}
                highlightedAnswerId={highlightedAnswerId}
              />
            ))}
            {answers.length === 0 && (
              <p className="text-sm text-muted-foreground">No answers yet. Add the first answer below.</p>
            )}
          </div>
          <div className="mt-4 pl-4">
            <MarkdownEditor
              content={answerText}
              onChange={setAnswerText}
              placeholder="Write your answer..."
              minRows={5}
              submitLabel={postingAnswer ? "Posting..." : "Post answer"}
              onSubmit={handlePostAnswer}
              disabled={postingAnswer}
            />
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
  const searchParams = useSearchParams();
  const { user, currentUser } = useAuth();
  const [questions, setQuestions] = useState(initialQuestions);
  const [answersByQuestion, setAnswersByQuestion] = useState(initialAnswersByQuestion);
  const [expandedId, setExpandedId] = useState<string | null>(initialQuestions[0]?.id ?? null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [askTitle, setAskTitle] = useState("");
  const [askBody, setAskBody] = useState("");
  const [postingQuestion, setPostingQuestion] = useState(false);
  const highlightedQuestionId = searchParams.get("question");
  const highlightedAnswerId = searchParams.get("answer");

  useEffect(() => {
    if (!highlightedQuestionId) return;
    setExpandedId(highlightedQuestionId);
  }, [highlightedQuestionId]);

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
      return false;
    }
    const token = await user.getIdToken();
    const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
    const result = await createDiscussionAnswer(token, promptId, questionId, {
      content,
      authorUsername,
    });
    return result.success;
  }

  async function handleReplyPost(questionId: string, parentAnswerId: string, content: string) {
    if (!user || !currentUser) {
      router.push("/login");
      return false;
    }
    const token = await user.getIdToken();
    const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
    const result = await createDiscussionAnswer(token, promptId, questionId, {
      content,
      authorUsername,
      parentAnswerId,
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
          <MarkdownEditor
            content={askBody}
            onChange={setAskBody}
            placeholder="Describe your question in detail..."
            minRows={6}
            submitLabel={postingQuestion ? "Posting..." : "Post discussion"}
            onSubmit={handleAskQuestion}
            onCancel={() => setIsComposerOpen(false)}
            disabled={postingQuestion}
            submitDisabled={!askTitle.trim() || !askBody.trim()}
          />
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            isOwner={!!isOwner}
            question={q}
            answers={answersByQuestion[q.id] ?? []}
            isExpanded={expandedId === q.id}
            onToggle={() => setExpandedId((prev) => (prev === q.id ? null : q.id))}
            onQuestionVote={handleQuestionVote}
            onAnswerVote={handleAnswerVote}
            onAnswerPost={handleAnswerPost}
            onReplyPost={handleReplyPost}
            onAcceptAnswer={isOwner ? handleAcceptAnswer : () => {}}
            onRefresh={refreshDiscussions}
            highlightedAnswerId={highlightedAnswerId}
            highlightedQuestionId={highlightedQuestionId}
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
