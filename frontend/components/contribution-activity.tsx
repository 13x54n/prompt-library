"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GitPullRequest, Activity, MessageSquare, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreatedPrompt = {
  promptId: string;
  promptTitle: string;
  createdAt: string;
};
type PrsByPrompt = { promptId: string; promptTitle: string; count: number };
type DiscussionQuestion = {
  id: string;
  promptId: string;
  promptTitle: string;
  title: string;
  createdAt: string;
};
type AnswersByPrompt = { promptId: string; promptTitle: string; count: number };

type ContributionActivityProps = {
  username: string;
  isOwnProfile?: boolean;
  profileCreatedAt?: string | null;
  createdPrompts?: CreatedPrompt[];
  prsByPrompt?: PrsByPrompt[];
  discussionQuestions?: DiscussionQuestion[];
  answersByPrompt?: AnswersByPrompt[];
};

export function ContributionActivity({
  username,
  isOwnProfile = false,
  profileCreatedAt = null,
  createdPrompts = [],
  prsByPrompt = [],
  discussionQuestions = [],
  answersByPrompt = [],
}: ContributionActivityProps) {
  const years = useMemo(() => {
    const nowYear = new Date().getFullYear();
    const createdYear = profileCreatedAt ? new Date(profileCreatedAt).getFullYear() : nowYear;
    const startYear =
      Number.isFinite(createdYear) && createdYear > 1970 && createdYear <= nowYear
        ? createdYear
        : nowYear;
    const result = [];
    for (let y = nowYear; y >= startYear; y -= 1) result.push(y);
    return result;
  }, [profileCreatedAt]);
  const [selectedYear, setSelectedYear] = useState(years[0] ?? new Date().getFullYear());

  const filterByYear = (dateStr: string) =>
    new Date(dateStr).getFullYear() === selectedYear;

  const createdInYear = createdPrompts.filter((p) => filterByYear(p.createdAt));
  const questionsInYear = discussionQuestions.filter((q) => filterByYear(q.createdAt));

  const totalAnswers = answersByPrompt.reduce((sum, p) => sum + p.count, 0);
  const maxAnswers = Math.max(...answersByPrompt.map((p) => p.count), 1);
  const hasActivity =
    createdPrompts.length > 0 ||
    prsByPrompt.length > 0 ||
    discussionQuestions.length > 0 ||
    answersByPrompt.length > 0;
  const hasActivityInYear =
    createdInYear.length > 0 ||
    prsByPrompt.length > 0 ||
    questionsInYear.length > 0 ||
    answersByPrompt.length > 0;

  return (
    <section className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold">Contribution activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">{selectedYear}</p>

        {!hasActivity && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            <Activity className="size-4 shrink-0" />
            {isOwnProfile ? "No activity yet" : "No activity"}
          </div>
        )}

        {/* Created prompts */}
        {createdInYear.length > 0 && (
          <div className="mt-6 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">
              Created {createdInYear.length} prompt{createdInYear.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 space-y-2 ml-6">
              {createdInYear.map((item) => (
                <Link
                  key={item.promptId}
                  href={`/prompts/${item.promptId}`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <FilePlus2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Answers grouped by prompt */}
        {answersByPrompt.length > 0 && (
          <div className="mt-6 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">
              Posted {totalAnswers} answer{totalAnswers !== 1 ? "s" : ""} across {answersByPrompt.length} prompt
              {answersByPrompt.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 space-y-2 ml-6">
              {answersByPrompt.map((item) => (
                <div
                  key={item.promptId}
                  className="flex items-center gap-4"
                >
                  <Link
                    href={`/prompts/${item.promptId}`}
                    className="min-w-0 flex-1 truncate text-sm text-primary hover:underline"
                  >
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </Link>
                  <span className="w-20 shrink-0 text-right text-sm text-muted-foreground">
                    {item.count} answer{item.count !== 1 ? "s" : ""}
                  </span>
                  <div className="flex h-2 w-32 shrink-0 items-center rounded-sm bg-green-500/20">
                    <div
                      className="h-full rounded-sm bg-green-500"
                      style={{
                        width: `${(item.count / maxAnswers) * 100}%`,
                        minWidth: item.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion questions */}
        {questionsInYear.length > 0 && (
          <div className="mt-4 border-b border-border pb-6">
            <p className="text-sm font-medium">Discussion questions</p>
            <div className="mt-3 space-y-2 ml-6">
              {questionsInYear.map((item) => (
                <Link
                  key={item.id}
                  href={`/prompts/${item.promptId}#discussion`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pull requests */}
        {prsByPrompt.length > 0 && (
          <div className="mt-4 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">
              Opened {prsByPrompt.reduce((s, p) => s + p.count, 0)} pull request
              {prsByPrompt.reduce((s, p) => s + p.count, 0) !== 1 ? "s" : ""} in{" "}
              {prsByPrompt.length} prompt{prsByPrompt.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 space-y-2 ml-6">
              {prsByPrompt.map((item) => (
                <Link
                  key={item.promptId}
                  href={`/prompts/${item.promptId}`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <GitPullRequest className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {item.count} pull request{item.count !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasActivity && !hasActivityInYear && (
          <p className="mt-6 text-sm text-muted-foreground">
            No activity in {selectedYear}. Try selecting another year.
          </p>
        )}
      </div>

      {/* Year filter sidebar */}
      <aside className="hidden shrink-0 flex-col gap-1 sm:flex">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSelectedYear(year)}
            className={cn(
              "rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors",
              selectedYear === year
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {year}
          </button>
        ))}
      </aside>
    </section>
  );
}
