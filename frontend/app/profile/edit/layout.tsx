import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your profile on Prompt Library.",
};

export default function EditProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
