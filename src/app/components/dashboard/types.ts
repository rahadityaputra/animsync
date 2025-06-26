// src/app/dashboard/types.ts
export type BasicProject = {
  id: string;
  name: string;
  file_path: string;
  status: "pending" | "rendering" | "completed";
};

export type Project = BasicProject & {
  user_id: string;
};

export type BasicRenderTask = {
  id: string;
  name: string;
  progress: number;
  status: "queued" | "rendering" | "completed" | "failed";
};

export type RenderTask = BasicRenderTask & {
  project_id: string;
};

export type Activity = {
  id: string;
  action: string;
  created_at: string;
};