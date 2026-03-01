// Shared types for the prompt library

export type PromptStats = {
  upvotes: number;
  forks: number;
  views: number;
  interactions?: number;
};

export type Prompt = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stats: PromptStats;
  lastUpdated: string;
  username: string;
  authorUid?: string;
  isPinned?: boolean;
  parentPromptId?: string | null;
  parentPromptTitle?: string | null;
  parentPromptUsername?: string | null;
  parentPromptAuthorUid?: string | null;
  primaryPrompt: string;
  parameters?: { name: string; placeholder?: string; type?: "text" | "select" }[];
  variants?: PromptVariant[];
  guide?: string;
};

export type PromptVariant = {
  id: string;
  content: string;
  author: string;
  votes: number;
  accepted?: boolean;
};

export type PromptRequest = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  views: number;
  comments: number;
  answers?: PromptRequestAnswer[];
  tech?: string[];
  desired?: string[];
};

export type PromptRequestAnswer = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  votes: number;
  accepted?: boolean;
};

export type TrendingDeveloper = {
  uid?: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string | null;
  promptCount: number;
  totalUpvotes: number;
  totalForks: number;
  totalViews: number;
  totalActivity?: number;
};

export type DiscussionQuestion = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  votes: number;
  answerCount: number;
  acceptedAnswerId?: string;
};

export type DiscussionAnswer = {
  id: string;
  questionId: string;
  content: string;
  author: string;
  createdAt: string;
  votes: number;
  accepted?: boolean;
};

export type Notification = {
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
  body?: string;
  link: string;
  read: boolean;
  archived?: boolean;
  createdAt: string;
  actor?: string;
  actorUid?: string;
};
