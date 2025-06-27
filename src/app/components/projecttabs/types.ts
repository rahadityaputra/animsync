export type Project = {
  id: string;
  name: string;
  status: "pending" | "rendering" | "completed";
  file_url?: string;
  description?: string;
  created_at?: string;
  scenes?: Scene[];
  collaborators?: Collaborator[];
};

export type Scene = {
  id: string;
  name: string;
  duration?: number;
  thumbnail_url?: string;
};

export type Collaborator = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";
  avatar?: string;
  role?: "viewer" | "editor" | "admin";
};