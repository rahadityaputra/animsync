"use client";

import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/Ui/LoadingSpinner";
import ProjectDetail from "@/components/ProjectTab/ProjectDetail";

import useProjectManagement from "@/hooks/useProjectManagement";
import { useEffect, useState } from "react";
import Project from "@/types/Project";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

const ProjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId: any = params?.projectId

  const { projects, error, loading, getDetailProject } = useProjectManagement();
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const fetchDetailProject = async () => {
      const project = await getDetailProject(projectId)
      setProject(project)
    }

    fetchDetailProject();
  })

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-gray-500 mb-4">Project not found</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ProjectDetail project={project} />
    </ErrorBoundary>
  );
}

export default ProjectPage;
