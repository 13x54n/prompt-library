"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  GitPullRequest,
  MessageSquare,
  GitBranch,
  Check,
  X,
  GitMerge,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { PromptCodeBlock } from "@/components/prompt-library";
import { MarkdownEditor } from "@/components/prompt-library/markdown-editor";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  fetchPullRequest,
  addPullRequestComment,
  addPullRequestCommentReply,
  votePullRequestComment,
  type ApiPullRequestComment,
  type ApiPullRequest,
} from "@/lib/api";

type PullRequestModalProps = {
  promptId: string;
  prId: string;
  highlightedCommentId?: string;
  onClose: () => void;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "merged") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400">
        <GitMerge className="size-4" />
        Merged
      </span>
    );
  }
  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400">
        <X className="size-4" />
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
      <Check className="size-4" />
      Open
    </span>
  );
}

export function PullRequestModal({
  promptId,
  prId,
  highlightedCommentId,
  onClose,
}: PullRequestModalProps) {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const [pr, setPr] = useState<ApiPullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchPullRequest(promptId, prId).then((result) => {
      if (result.success) setPr(result.pullRequest);
      setLoading(false);
    });
  }, [promptId, prId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleComment() {
    if (!user || !currentUser || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const token = await user.getIdToken();
      const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
      const result = await addPullRequestComment(token, promptId, prId, {
        body: commentText.trim(),
        authorUsername,
      });
      if (result.success) {
        setCommentText("");
        const refresh = await fetchPullRequest(promptId, prId);
        if (refresh.success) setPr(refresh.pullRequest);
      }
    } finally {
      setPostingComment(false);
    }
  }

  async function handleReply(commentId: string, body: string) {
    if (!user || !currentUser || !body.trim()) return false;
    try {
      const token = await user.getIdToken();
      const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
      const result = await addPullRequestCommentReply(token, promptId, prId, commentId, {
        body: body.trim(),
        authorUsername,
      });
      if (!result.success) {
        return false;
      }
      const refresh = await fetchPullRequest(promptId, prId);
      if (refresh.success) setPr(refresh.pullRequest);
      return true;
    } catch {
      return false;
    }
  }

  async function handleVoteComment(commentId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    const token = await user.getIdToken();
    const result = await votePullRequestComment(token, promptId, prId, commentId);
    if (!result.success) return;
    setPr((prev) => {
      if (!prev) return prev;
      const updateVotes = (comments: ApiPullRequestComment[]): ApiPullRequestComment[] =>
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              votes: result.votes,
              viewerHasVoted: result.hasVoted,
              replies: comment.replies ? updateVotes(comment.replies) : comment.replies,
            };
          }
          return {
            ...comment,
            replies: comment.replies ? updateVotes(comment.replies) : comment.replies,
          };
        });

      return {
        ...prev,
        comments: updateVotes(prev.comments),
        commentTree: prev.commentTree ? updateVotes(prev.commentTree) : prev.commentTree,
      };
    });
  }

  if (loading || !pr) return null;

  const isPrOpen = pr.status === "open";
  const commentTree = pr.commentTree ?? pr.comments.filter((comment) => !comment.parentId);

  function CommentThreadNode({
    comment,
    level = 0,
  }: {
    comment: ApiPullRequestComment;
    level?: number;
  }) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [replyBody, setReplyBody] = useState("");
    const [postingReply, setPostingReply] = useState(false);
    const isHighlighted = highlightedCommentId === comment.id;

    useEffect(() => {
      if (!isHighlighted) return;
      const element = document.getElementById(`pr-comment-${comment.id}`);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [comment.id, isHighlighted]);

    async function submitReply() {
      if (!replyBody.trim()) return;
      setPostingReply(true);
      try {
        const ok = await handleReply(comment.id, replyBody.trim());
        if (ok) {
          setReplyBody("");
          setIsReplyOpen(false);
        }
      } finally {
        setPostingReply(false);
      }
    }

    return (
      <div className={cn(level > 0 && "ml-6 border-l border-border/60 pl-4")}>
        <div
          id={`pr-comment-${comment.id}`}
          className={cn(
            "flex gap-4 p-4 transition-colors",
            isHighlighted && "rounded-lg bg-primary/10 ring-1 ring-primary/40"
          )}
        >
          <UserAvatar photoURL={null} name={comment.author} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/profile/${comment.authorUid ?? comment.author}`}
                className="font-medium hover:underline"
              >
                @{comment.author}
              </Link>
              <span className="text-muted-foreground">commented {comment.createdAt}</span>
            </div>
            <div className="prose prose-sm dark:prose-invert mt-2 max-w-none text-muted-foreground">
              <ReactMarkdown>{comment.body}</ReactMarkdown>
            </div>
            {isPrOpen && (
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "gap-1 text-xs",
                    comment.viewerHasVoted && "text-rose-500 hover:text-rose-500"
                  )}
                  onClick={() => void handleVoteComment(comment.id)}
                >
                  <Heart className={cn("size-4", comment.viewerHasVoted && "fill-current")} />
                  {comment.votes ?? 0}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setIsReplyOpen((v) => !v)}
                >
                  {isReplyOpen ? "Cancel reply" : "Reply"}
                </Button>
              </div>
            )}
            {isReplyOpen && (
              <div className="mt-3">
                <MarkdownEditor
                  content={replyBody}
                  onChange={setReplyBody}
                  placeholder="Write your reply..."
                  minRows={4}
                  submitLabel={postingReply ? "Posting..." : "Post reply"}
                  onSubmit={submitReply}
                  onCancel={() => setIsReplyOpen(false)}
                  disabled={postingReply}
                />
              </div>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1 pb-3">
            {comment.replies.map((reply) => (
              <CommentThreadNode key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal content */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="pr-modal-title" className="text-xl font-semibold">
                {pr.title}
              </h2>
              <span className="text-muted-foreground">#{pr.id}</span>
              <StatusBadge status={pr.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                <GitPullRequest className="mr-1 inline size-4" />
                {pr.author} opened this {pr.createdAt}
              </span>
              {pr.comments.length > 0 && (
                <span>
                  <MessageSquare className="mr-1 inline size-4" />
                  {pr.comments.length} comment{pr.comments.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid">
            <main className="min-w-0 space-y-6">
              {/* Description */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <span className="font-medium">Description</span>
                </div>
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                    {pr.body}
                  </div>
                </div>
              </div>

              {/* Changes */}
              {pr.promptDiff && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <GitBranch className="size-4 text-muted-foreground" />
                    <span className="font-medium">Changes</span>
                  </div>
                  <div className="p-4">
                    <PromptCodeBlock content={pr.promptDiff} />
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <span className="font-medium">Conversation</span>
                  {commentTree.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {pr.comments.length}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {commentTree.map((comment) => (
                    <CommentThreadNode key={comment.id} comment={comment} />
                  ))}
                  {commentTree.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No comments yet.
                    </div>
                  )}
                </div>
                {isPrOpen && (
                  <div className="border-t border-border p-4">
                    <MarkdownEditor
                      content={commentText}
                      onChange={setCommentText}
                      placeholder="Add a comment..."
                      minRows={5}
                      submitLabel={postingComment ? "Posting..." : "Comment"}
                      onSubmit={handleComment}
                      disabled={postingComment}
                    />
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
