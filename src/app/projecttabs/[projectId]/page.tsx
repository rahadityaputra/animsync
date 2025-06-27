// app/projecttabs/[projectId]/page.tsx
"use client";
import { use } from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProjectDetail from "@/app/components/projecttabs/ProjectDetail";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/app/components/ErrorBoundary";

interface Project {
  id: string;
  name: string;
  state: "pending" | "rendering" | "completed";
  file_url?: string;
  description?: string;
  user_id?: string;
  created_at?: string;
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const { projectId } = use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check auth first
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/login");
          return;
        }

        // Then fetch project
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.projectId)
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Project not found");

        setProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.projectId, router, supabase]);

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
