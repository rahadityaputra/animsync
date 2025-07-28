"use client";

import { useState } from "react";
import { ActivityList, Header, ProjectList, RenderHistory } from "@/features/dashboard";

// interface BasicProject {
//   id: string;
//   name: string;
//   file_path: string;
//   status: "pending" | "rendering" | "completed";
// }

// type Activity = {
//   id: string;
//   action: string;
//   created_at: string;
// };

type RenderTask = {
  id: string;
  name: string;
  progress: number;
  project_id: string; // Pastikan ini ada
  status: "queued" | "rendering" | "completed" | "failed";
};

const Dashboard = () => {
  // const [activities, setActivities] = useState<Activity[]>([]);
  const [renderQueue, setRenderQueue] = useState<RenderTask[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);

  const handleProjectAdded = (newProject: Project, newTask: RenderTask) => {
    // setProjects([...projects, newProject]);
    // setRenderQueue([...renderQueue, newTask]);
  };

  const handleRenderCancelled = (taskId: string) => {
    setRenderQueue(renderQueue.filter((task) => task.id !== taskId));
  };

  const handleDownload = async (projectId: string) => {
    // try {
    //   const supabase = createClient();
    //   const project = projects.find((p) => p.id === projectId);
    //
    //   if (!project) return;
    //
    //   const { data } = await supabase.storage
    //     .from("project-files")
    //     .download(project.file_path);
    //
    //   if (data) {
    //     const url = URL.createObjectURL(data);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = project.name;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     URL.revokeObjectURL(url);
    //   }
    // } catch (error) {
    //   console.error("Error downloading:", error);
    // }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard - AnimSync
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProjectList />
          {/* <ActivityList activities={activities} /> */}
          {/* <RenderQueue */}
          {/*   queue={renderQueue.map((task) => ({ */}
          {/*     id: task.id, */}
          {/*     name: task.name, */}
          {/*     progress: task.progress, */}
          {/*     status: task.status, */}
          {/*   }))} */}
          {/*   onAddProject={(project: BasicProject, task: BasicRenderTask) => { */}
          {/*     const fullProject: Project = { */}
          {/*       ...project, */}
          {/*       user_id: user?.id || "", */}
          {/*     }; */}
          {/**/}
          {/*     const fullTask: RenderTask = { */}
          {/*       ...task, */}
          {/*       project_id: project.id, */}
          {/*     }; */}
          {/**/}
          {/*     handleProjectAdded(fullProject, fullTask); */}
          {/*   }} */}
          {/*   onCancelRender={handleRenderCancelled} */}
          {/* /> */}
          <RenderHistory
            projects={completedProjects}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
