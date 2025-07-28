import Collaborator from "./Collaborator";
import Scene from "./Scene";

type Project = {
  id: string,
  name: string,
  status: "pending" | "rendering" | "completed",
  file_url?: string,
  description?: string,
  user_id?: string,
  created_at?: string,
  scenes?: Scene[],
  collaborators?: Collaborator[]
}

export default Project;
