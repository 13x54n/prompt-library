"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchModal } from "@/components/search-modal";

export function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="relative flex-1 cursor-text"
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        role="button"
        tabIndex={0}
      >
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search users, prompts, discussions..."
          className="pl-9"
          aria-label="Search prompts"
          readOnly
        />
      </div>
      <SearchModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
