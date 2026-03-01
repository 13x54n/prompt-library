import type { Metadata } from "next";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Prompt Library to save prompts, contribute variants, and join the community.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100dvh-5rem)] min-w-0 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4 p-6 md:p-10">
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="w-full min-w-0 max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1668852222395-11d9154ade25?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
