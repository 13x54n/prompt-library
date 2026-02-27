import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Prompt",
  description:
    "Add a new prompt to the library. Share your AI prompts with the community, add variants, and help other developers.",
};

export default function CreatePromptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
