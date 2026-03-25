import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCreateProject } from "@/components/dashboard/create-projects-data";
import { DashboardCreateProjectDetailClient } from "@/components/dashboard/dashboard-create-project-detail-client";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = getCreateProject(projectId);
  if (!project) {
    return { title: "Project · Create · Maple" };
  }
  return {
    title: `${project.name} · Create · Maple`,
    description: `Build and preview ${project.name} with AI on Maple.`,
  };
}

export default async function DashboardCreateProjectPage({ params }: Props) {
  const { projectId } = await params;
  const project = getCreateProject(projectId);
  if (!project) {
    notFound();
  }
  return <DashboardCreateProjectDetailClient project={project} />;
}
