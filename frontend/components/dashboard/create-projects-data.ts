export type CreateProject = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  statusLabel: string;
  statusKind: "upload" | "package";
};

/** Demo projects for the Create dashboard (replace with API later). */
export const CREATE_PROJECTS: CreateProject[] = [
  {
    id: "sherpamomo",
    name: "sherpamomo",
    slug: "sherpamomo",
    icon: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=128&h=128&fit=crop&q=80",
    statusLabel: "iOS submission created 2 months ago",
    statusKind: "upload",
  },
  {
    id: "isendmoney",
    name: "isendmoney",
    slug: "isendmoney",
    icon: "https://images.unsplash.com/photo-1633409361618-c6932a5e1f6e?w=128&h=128&fit=crop&q=80",
    statusLabel: "iOS build completed 7 months ago",
    statusKind: "package",
  },
  {
    id: "goji",
    name: "goji",
    slug: "goji",
    icon: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop&q=80",
    statusLabel: "Android build in progress",
    statusKind: "upload",
  },
  {
    id: "maple-labs",
    name: "Maple Labs",
    slug: "maple-labs",
    icon: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=128&h=128&fit=crop&q=80",
    statusLabel: "Last deploy 3 days ago",
    statusKind: "package",
  },
  {
    id: "prompt-kit",
    name: "Prompt Kit",
    slug: "prompt-kit",
    icon: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=128&h=128&fit=crop&q=80",
    statusLabel: "Draft — not submitted",
    statusKind: "upload",
  },
];

export function getCreateProject(id: string): CreateProject | undefined {
  return CREATE_PROJECTS.find((p) => p.id === id);
}
