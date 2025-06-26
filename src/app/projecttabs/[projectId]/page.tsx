"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProjectDetail from "@/app/components/projrcttabs/ProjectDetail";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

type Project = {
  id: string;
  name: string;
  status: "pending" | "rendering" | "completed";
  file_url?: string;
  description?: string;
  created_at?: string;
};

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.projectId)
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error("Project not found");

        setProject(data as Project);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.projectId, supabase]);

  if (loading) return <LoadingSpinner fullPage />;

  if (error)
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

  if (!project)
    return (
      <div className="flex flex-col items-center justify-center  bg-gray-100 min-h-[300px]">
        <p className="text-gray-500 mb-4">Project not found</p>
        <button
          onClick={() => (window.location.href = "/projects")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );

  return (
    <div className="container mx-auto  bg-gray-500 px-4 py-8">
      <ProjectDetail project={project} />
    </div>
  );
}
