"use client";

import { useUser } from "@/app/providers";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectList from "@/components/Dashboard/ProjectList";
import ActivityList from "@/components/Dashboard/ActivityList";
import RenderQueue from "@/components/Dashboard/RenderQueue";
import RenderHistory from "@/components/Dashboard/RenderHistory";
import Header from "@/components/Dashboard/Header";

interface BasicProject {
  id: string;
  name: string;
  file_path: string;
  status: "pending" | "rendering" | "completed";
}

type Project = {
  id: string;
  name: string;
  user_id: string;
  file_path: string;
  status: "pending" | "rendering" | "completed";
};

type Activity = {
  id: string;
  action: string;
  created_at: string;
};

type RenderTask = {
  id: string;
  name: string;
  progress: number;
  project_id: string; // Pastikan ini ada
  status: "queued" | "rendering" | "completed" | "failed";
};

const Dashboard = () => {
  const { user, isLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [renderQueue, setRenderQueue] = useState<RenderTask[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .returns<Project[]>();

      if (!projectsError && projects) {
        setProjects(projects);
        setCompletedProjects(projects.filter((p) => p.status === "completed"));
      }

      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)
        .returns<Activity[]>();

      if (!activitiesError) setActivities(activities || []);

      const { data: renderQueue, error: renderError } = await supabase
        .from("render_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .returns<RenderTask[]>();

      if (!renderError) setRenderQueue(renderQueue || []);
    };

    fetchData();
  }, [user]);

  const handleProjectAdded = (newProject: Project, newTask: RenderTask) => {
    setProjects([...projects, newProject]);
    setRenderQueue([...renderQueue, newTask]);
  };

  const handleRenderCancelled = (taskId: string) => {
    setRenderQueue(renderQueue.filter((task) => task.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleDownload = async (projectId: string) => {
    try {
      const supabase = createClient();
      const project = projects.find((p) => p.id === projectId);

      if (!project) return;

      const { data } = await supabase.storage
        .from("project-files")
        .download(project.file_path);

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = project.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />

        <main className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Dashboard - AnimSync
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProjectList projects={projects} />
            <ActivityList activities={activities} />
            <RenderQueue
              queue={renderQueue.map((task) => ({
                id: task.id,
                name: task.name,
                progress: task.progress,
                status: task.status,
              }))}
              onAddProject={(project: BasicProject, task: BasicRenderTask) => {
                const fullProject: Project = {
                  ...project,
                  user_id: user?.id || "",
                };

                const fullTask: RenderTask = {
                  ...task,
                  project_id: project.id,
                };

                handleProjectAdded(fullProject, fullTask);
              }}
              onCancelRender={handleRenderCancelled}
            />
            <RenderHistory
              projects={completedProjects}
              onDownload={handleDownload}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
