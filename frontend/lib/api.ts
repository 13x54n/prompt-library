const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:5001";

const PROMPT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PROMPT_SERVICE_URL ?? "http://localhost:5002";

const NOTIFICATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL ?? "http://localhost:5003";

export type ProfileUser = {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
  createdAt?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};

export async function fetchProfile(
  username: string
): Promise<{ success: true; user: ProfileUser } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${AUTH_SERVICE_URL}/api/users/profile/${encodeURIComponent(username)}`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "User not found" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function fetchProfilesByUsernames(
  usernames: string[]
): Promise<{ success: true; users: ProfileUser[] } | { success: false; error: string }> {
  try {
    const normalized = [...new Set(usernames.map((u) => u.trim().toLowerCase()).filter(Boolean))];
    if (!normalized.length) return { success: true, users: [] };
    const query = new URLSearchParams();
    query.set("usernames", normalized.join(","));
    const res = await fetch(`${AUTH_SERVICE_URL}/api/users/profiles?${query.toString()}`, {
      next: { revalidate: 30 },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch profiles" };
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export type ApiPrompt = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stats: { upvotes: number; forks: number; views: number; interactions?: number };
  lastUpdated: string;
  username: string;
  authorUid?: string;
  isPinned?: boolean;
  parentPromptId?: string | null;
  primaryPrompt?: string;
  parameters?: { name: string; placeholder?: string; type?: "text" | "select" }[];
  variants?: { id: string; content: string; author: string; votes: number; accepted?: boolean }[];
  guide?: string | null;
  visibility?: "public" | "unlisted";
};

export async function fetchPromptById(
  id: string,
  idToken?: string
): Promise<
  | { success: true; prompt: ApiPrompt }
  | { success: false; error: string }
> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(id)}`,
      { next: { revalidate: 30 }, headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Prompt not found" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function fetchPromptsByAuthor(
  username: string
): Promise<{ success: true; prompts: ApiPrompt[] } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/by-author/${encodeURIComponent(username)}`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch prompts" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function fetchPromptsByAuthorUid(
  uid: string,
  idToken?: string
): Promise<{ success: true; prompts: ApiPrompt[] } | { success: false; error: string }> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/by-author-uid/${encodeURIComponent(uid)}`,
      { next: { revalidate: 30 }, headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch prompts" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function fetchPopularTags(
  limit = 10
): Promise<{ success: true; tags: string[] } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/tags/popular?limit=${Math.min(limit, 50)}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch tags" };
    return { success: true, tags: Array.isArray(data.tags) ? data.tags : [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchPrompts(params?: {
  author?: string;
  authorUids?: string[];
  tags?: string | string[];
  q?: string;
  limit?: number;
  offset?: number;
  sort?: "createdAt" | "updatedAt" | "upvotes" | "views";
}, idToken?: string): Promise<
  | { success: true; prompts: ApiPrompt[]; total: number }
  | { success: false; error: string }
> {
  try {
    const query = new URLSearchParams();
    if (params?.author) query.set("author", params.author);
    if (params?.authorUids?.length) query.set("authorUids", params.authorUids.join(","));
    if (params?.q) query.set("q", params.q);
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.offset != null) query.set("offset", String(params.offset));
    if (params?.sort) query.set("sort", params.sort);
    if (params?.tags) {
      const tags = Array.isArray(params.tags) ? params.tags.join(",") : params.tags;
      if (tags) query.set("tags", tags);
    }
    const qs = query.toString();
    const url = qs
      ? `${PROMPT_SERVICE_URL}/api/prompts?${qs}`
      : `${PROMPT_SERVICE_URL}/api/prompts`;

    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(url, { next: { revalidate: 15 }, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch prompts" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export type SearchUser = {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string | null;
};

export async function searchUsers(
  q: string,
  limit = 8
): Promise<{ success: true; users: SearchUser[] } | { success: false; error: string }> {
  try {
    const query = new URLSearchParams();
    query.set("q", q);
    query.set("limit", String(limit));
    const res = await fetch(
      `${AUTH_SERVICE_URL}/api/users/search?${query.toString()}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to search users" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export type SearchDiscussion = {
  id: string;
  promptId: string;
  promptTitle: string;
  title: string;
  body: string;
  matchedAnswerSnippet?: string | null;
  author: string;
  votes: number;
  answerCount: number;
};

export async function searchDiscussions(
  q: string,
  limit = 8
): Promise<
  | { success: true; discussions: SearchDiscussion[] }
  | { success: false; error: string }
> {
  try {
    const query = new URLSearchParams();
    query.set("q", q);
    query.set("limit", String(limit));
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/search-discussions?${query.toString()}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to search discussions" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export type ApiUserContributionActivity = {
  createdPrompts: {
    promptId: string;
    promptTitle: string;
    createdAt: string;
  }[];
  prsByPrompt: { promptId: string; promptTitle: string; count: number }[];
  discussionQuestions: {
    id: string;
    promptId: string;
    promptTitle: string;
    title: string;
    createdAt: string;
  }[];
  answersByPrompt: { promptId: string; promptTitle: string; count: number }[];
};

export async function fetchUserContributionActivity(
  username: string
): Promise<
  | { success: true; activity: ApiUserContributionActivity }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/activity/${encodeURIComponent(username)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch activity" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function fetchUserContributionActivityByUid(
  uid: string,
  idToken?: string
): Promise<
  | { success: true; activity: ApiUserContributionActivity }
  | { success: false; error: string }
> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/activity/by-uid/${encodeURIComponent(uid)}`,
      { cache: "no-store", headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch activity" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export type CreatePromptPayload = {
  title: string;
  description?: string;
  tags?: string | string[];
  primaryPrompt: string;
  guide?: string;
  visibility?: "public" | "unlisted";
  authorUsername: string;
};

export async function createPrompt(
  idToken: string,
  payload: CreatePromptPayload
): Promise<
  | { success: true; prompt: ApiPrompt & { primaryPrompt?: string; guide?: string | null } }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(`${PROMPT_SERVICE_URL}/api/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        title: payload.title.trim(),
        description: payload.description ?? "",
        tags: Array.isArray(payload.tags)
          ? payload.tags
          : typeof payload.tags === "string"
            ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        primaryPrompt: payload.primaryPrompt.trim(),
        guide: payload.guide?.trim() || null,
        visibility: payload.visibility === "unlisted" ? "unlisted" : "public",
        authorUsername: payload.authorUsername.trim().toLowerCase(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to create prompt" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function setPromptPinned(
  idToken: string,
  promptId: string,
  isPinned: boolean
): Promise<
  | { success: true; prompt: ApiPrompt }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isPinned }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to update pin" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function updatePrompt(
  idToken: string,
  promptId: string,
  payload: {
    title?: string;
    description?: string;
    tags?: string[];
    primaryPrompt?: string;
    guide?: string | null;
    visibility?: "public" | "unlisted";
  }
): Promise<
  | { success: true; prompt: ApiPrompt }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to update prompt" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

export async function deletePrompt(
  idToken: string,
  promptId: string
): Promise<{ success: true; deleted: boolean } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to delete prompt" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}

// --- Discussions ---
export type ApiDiscussionQuestion = {
  id: string;
  title: string;
  body: string;
  author: string;
  authorUid?: string;
  createdAt: string;
  votes: number;
  answerCount: number;
  acceptedAnswerId?: string;
};
export type ApiDiscussionAnswer = {
  id: string;
  questionId: string;
  parentAnswerId?: string | null;
  depth?: number;
  content: string;
  author: string;
  authorUid?: string;
  createdAt: string;
  votes: number;
  accepted?: boolean;
  replies?: ApiDiscussionAnswer[];
};

export async function fetchDiscussions(
  promptId: string,
  idToken?: string
): Promise<
  | {
      success: true;
      questions: ApiDiscussionQuestion[];
      answersByQuestion: Record<string, ApiDiscussionAnswer[]>;
    }
  | { success: false; error: string }
> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions`,
      { cache: "no-store", headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch discussions" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function createDiscussionQuestion(
  idToken: string,
  promptId: string,
  payload: { title: string; body: string; authorUsername: string }
): Promise<
  | { success: true; question: ApiDiscussionQuestion }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to create question" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function createDiscussionAnswer(
  idToken: string,
  promptId: string,
  questionId: string,
  payload: { content: string; authorUsername: string; parentAnswerId?: string }
): Promise<
  | { success: true; answer: ApiDiscussionAnswer }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions/${encodeURIComponent(questionId)}/answers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to post answer" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function createDiscussionReply(
  idToken: string,
  promptId: string,
  questionId: string,
  answerId: string,
  payload: { content: string; authorUsername: string }
): Promise<
  | { success: true; answer: ApiDiscussionAnswer }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to post reply" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function voteDiscussionQuestion(
  idToken: string,
  promptId: string,
  questionId: string
): Promise<{ success: true; votes: number } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions/${encodeURIComponent(questionId)}/vote`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to vote" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function voteDiscussionAnswer(
  idToken: string,
  promptId: string,
  questionId: string,
  answerId: string
): Promise<{ success: true; votes: number } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}/vote`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to vote" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function acceptDiscussionAnswer(
  idToken: string,
  promptId: string,
  questionId: string,
  answerId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/discussions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}/accept`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to accept" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

// --- Pull Requests ---
export type ApiPullRequestSummary = {
  id: string;
  title: string;
  author: string;
  authorUid?: string | null;
  status: string;
  createdAt: string;
  discussionCount?: number;
};
export type ApiPullRequest = ApiPullRequestSummary & {
  body: string;
  baseBranch: string;
  headBranch: string;
  promptDiff?: string | null;
  proposedPrimaryPrompt?: string | null;
  proposedGuide?: string | null;
  proposedTags?: string[];
  comments: ApiPullRequestComment[];
  commentTree?: ApiPullRequestComment[];
};

export type ApiPullRequestComment = {
  id: string;
  author: string;
  authorUid?: string | null;
  body: string;
  parentId?: string | null;
  depth?: number;
  votes?: number;
  viewerHasVoted?: boolean;
  createdAt: string;
  replies?: ApiPullRequestComment[];
};

export async function fetchPullRequests(
  promptId: string,
  idToken?: string
): Promise<
  | { success: true; pullRequests: ApiPullRequestSummary[] }
  | { success: false; error: string }
> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests`,
      { cache: "no-store", headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch pull requests" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchPullRequest(
  promptId: string,
  prId: string
): Promise<
  | { success: true; pullRequest: ApiPullRequest }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch pull request" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function createPullRequest(
  idToken: string,
  promptId: string,
  payload: {
    title: string;
    body?: string;
    authorUsername: string;
    promptDiff?: string;
    proposedPrimaryPrompt?: string;
    proposedGuide?: string;
    proposedTags?: string[];
  }
): Promise<
  | { success: true; pullRequest: ApiPullRequest }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to create pull request" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function addPullRequestComment(
  idToken: string,
  promptId: string,
  prId: string,
  payload: { body: string; authorUsername: string; parentId?: string }
): Promise<
  | { success: true; comment: ApiPullRequestComment }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to add comment" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function addPullRequestCommentReply(
  idToken: string,
  promptId: string,
  prId: string,
  commentId: string,
  payload: { body: string; authorUsername: string }
): Promise<
  | { success: true; comment: ApiPullRequestComment }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}/comments/${encodeURIComponent(commentId)}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to add reply" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function votePullRequestComment(
  idToken: string,
  promptId: string,
  prId: string,
  commentId: string
): Promise<{ success: true; votes: number; hasVoted: boolean } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}/comments/${encodeURIComponent(commentId)}/vote`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to vote" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function mergePullRequest(
  idToken: string,
  promptId: string,
  prId: string
): Promise<{ success: true; pullRequest: ApiPullRequest } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}/merge`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to merge" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function closePullRequest(
  idToken: string,
  promptId: string,
  prId: string
): Promise<{ success: true; pullRequest: ApiPullRequest } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/pull-requests/${encodeURIComponent(prId)}/close`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to close" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

// --- Upvote & Fork ---
export async function fetchUpvoteStatus(
  promptId: string,
  idToken?: string | null
): Promise<{ success: true; upvoted: boolean } | { success: false; error: string }> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers["Authorization"] = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/upvote-status`,
      { cache: "no-store", headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function upvotePrompt(
  idToken: string,
  promptId: string,
  actorUsername?: string
): Promise<
  | { success: true; upvoted: boolean; upvotes: number }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/upvote`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorUsername: actorUsername ?? null,
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to upvote" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function forkPrompt(
  idToken: string,
  promptId: string,
  authorUsername: string
): Promise<
  | { success: true; prompt: ApiPrompt }
  | { success: false; error: string }
> {
  try {
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/fork`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ authorUsername }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fork" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

// --- Contributors ---
export async function fetchContributors(
  promptId: string,
  idToken?: string
): Promise<
  | { success: true; contributors: { uid: string; username: string; contributions: number }[] }
  | { success: false; error: string }
> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(
      `${PROMPT_SERVICE_URL}/api/prompts/${encodeURIComponent(promptId)}/contributors`,
      { cache: "no-store", headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "Failed to fetch contributors" };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export type ApiNotification = {
  id: string;
  type:
    | "prompt_forked"
    | "prompt_upvoted"
    | "discussion_answered"
    | "discussion_replied"
    | "discussion_question_on_my_prompt"
    | "pr_created"
    | "pr_commented"
    | "pr_merged"
    | "user_followed";
  title: string;
  body?: string | null;
  link: string;
  read: boolean;
  archived?: boolean;
  createdAt: string;
  actor?: string;
  actorUid?: string;
  entityType?: "prompt" | "discussion_question" | "discussion_answer" | "pull_request" | "user";
  entityId?: string;
  promptId?: string;
  metadata?: Record<string, unknown>;
};

export async function followUser(
  idToken: string,
  targetUid: string
): Promise<{ success: true; following: boolean } | { success: false; error: string }> {
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/api/users/${encodeURIComponent(targetUid)}/follow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to follow user" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function unfollowUser(
  idToken: string,
  targetUid: string
): Promise<{ success: true; following: boolean } | { success: false; error: string }> {
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/api/users/${encodeURIComponent(targetUid)}/follow`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to unfollow user" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchFollowStatus(
  targetUid: string,
  idToken?: string
): Promise<{ success: true; isFollowing: boolean } | { success: false; error: string }> {
  try {
    const headers: HeadersInit = {};
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const res = await fetch(`${AUTH_SERVICE_URL}/api/users/${encodeURIComponent(targetUid)}/follow-status`, {
      cache: "no-store",
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch follow status" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchMyFollowingUids(
  idToken: string
): Promise<{ success: true; followingUids: string[] } | { success: false; error: string }> {
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/api/users/me/following-uids`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch following users" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchNotifications(
  idToken: string,
  params?: { limit?: number; cursor?: string; includeArchived?: boolean }
): Promise<
  | { success: true; notifications: ApiNotification[]; nextCursor: string | null; hasMore: boolean }
  | { success: false; error: string }
> {
  try {
    const query = new URLSearchParams();
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    if (params?.includeArchived) query.set("includeArchived", "true");
    const qs = query.toString();
    const url = qs
      ? `${NOTIFICATION_SERVICE_URL}/api/notifications?${qs}`
      : `${NOTIFICATION_SERVICE_URL}/api/notifications`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch notifications" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function fetchUnreadNotificationCount(
  idToken: string
): Promise<{ success: true; unreadCount: number } | { success: false; error: string }> {
  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/unread-count`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to fetch unread count" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function markNotificationRead(
  idToken: string,
  notificationId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to mark as read" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function markAllNotificationsRead(
  idToken: string
): Promise<{ success: true; updated: number } | { success: false; error: string }> {
  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to mark all read" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function archiveNotification(
  idToken: string,
  notificationId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/${encodeURIComponent(notificationId)}/archive`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to archive notification" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function archiveAllNotifications(
  idToken: string
): Promise<{ success: true; updated: number } | { success: false; error: string }> {
  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/archive-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error ?? "Failed to archive notifications" };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}
