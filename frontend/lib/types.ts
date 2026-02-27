// Shared types for the prompt library

export type PromptStats = {
  stars: number;
  forks: number;
  views: number;
};

export type Prompt = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stats: PromptStats;
  lastUpdated: string;
  username: string;
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
  username: string;
  displayName?: string;
  avatarUrl?: string;
  promptCount: number;
  totalStars: number;
  totalForks: number;
  totalViews: number;
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
  type: "pr_review" | "star" | "fork" | "comment" | "mention" | "merge";
  title: string;
  body?: string;
  link: string;
  read: boolean;
  createdAt: string;
  actor?: string;
};
